import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import sgMail from '@sendgrid/mail';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/&/g, 'and')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

// Initialize Supabase Admin Client
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  '';

if (!process.env.SUPABASE_URL || !supabaseServiceKey) {
  console.warn('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for admin actions.');
}

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  supabaseServiceKey
);

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const getEmailBranding = () => {
  const siteUrl = process.env.PUBLIC_SITE_URL || process.env.FRONTEND_URL || 'https://plus.experienciasdeldestino.com';
  const logoUrl = process.env.BRANDED_LOGO_URL || `${siteUrl}/logo-email.png`;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@experienciasdeldestino.com';
  const fromName = process.env.SENDGRID_FROM_NAME || process.env.EMAIL_FROM_NAME || 'Experiencias del Destino';

  return { siteUrl, logoUrl, fromEmail, fromName };
};

const sendEmail = async ({ to, subject, html }) => {
  const { fromEmail, fromName } = getEmailBranding();

  if (process.env.SENDGRID_API_KEY) {
    try {
      await sgMail.send({
        to,
        from: { email: fromEmail, name: fromName },
        subject,
        html,
      });
      return { sent: true, provider: 'sendgrid' };
    } catch (error) {
      console.error('SendGrid email failed:', error);
    }
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: [to],
          subject,
          html,
        }),
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Resend failed: ${response.status} ${body}`);
      }
      return { sent: true, provider: 'resend' };
    } catch (error) {
      console.error('Resend email failed:', error);
    }
  }

  return { sent: false };
};

let localEmbedderPromise = null;
const getLocalEmbedder = async () => {
  if (!localEmbedderPromise) {
    const modelName =
      process.env.LOCAL_EMBEDDING_MODEL ||
      // 768 dims, works well for multilingual semantic search.
      'Xenova/paraphrase-multilingual-mpnet-base-v2';
    localEmbedderPromise = import('@xenova/transformers').then(({ pipeline }) =>
      pipeline('feature-extraction', modelName)
    );
  }
  return localEmbedderPromise;
};

const getLocalTextEmbedding = async (text) => {
  const input = String(text || '').trim();
  if (!input) return null;
  try {
    const embedder = await getLocalEmbedder();
    const output = await embedder(input, { pooling: 'mean', normalize: true });
    // `output.data` is a typed array.
    return Array.from(output.data).map((v) => Number(v));
  } catch (error) {
    console.error('Local embedding generation failed:', error);
    return null;
  }
};

const getTextEmbedding = async (text) => {
  // Prefer Gemini if available; fall back to local embeddings when Gemini embeddings
  // models are not accessible for this API key/version.
  const input = String(text || '').trim();
  if (!input) return null;

  // Gemini embeddings model. The exact model availability depends on the API key
  // and API version used by the SDK. We try a small set of known models and allow
  // override via EMBEDDING_MODEL.
  try {
    if (genAI) {
      const candidates = [
        process.env.EMBEDDING_MODEL,
        'text-embedding-004',
        'embedding-001',
      ].filter(Boolean);

      for (const modelName of candidates) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.embedContent(input);
          const values =
            result?.embedding?.values ||
            result?.embedding?.value ||
            result?.embedding ||
            null;
          if (!Array.isArray(values) || values.length === 0) continue;
          return values.map((v) => Number(v));
        } catch (innerError) {
          // Common case: model not available (404) or not supported for embedContent.
          console.warn(`Embedding model failed (${modelName}):`, innerError?.message || innerError);
        }
      }
    }

    // Local fallback (no external API calls).
    return await getLocalTextEmbedding(input);
  } catch (error) {
    console.error('Embedding generation failed:', error);
    return await getLocalTextEmbedding(input);
  }
};

const getBearerToken = (req) => {
  const header = req.headers.authorization || '';
  if (typeof header !== 'string') return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
};

const requireAuthenticated = async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Missing Authorization bearer token' });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role, email, full_name, province')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    req.user = userData.user;
    req.profile = profile || null;
    next();
  } catch (error) {
    console.error('Authorization failed:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
};

const requireCentral = async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Missing Authorization bearer token' });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile || profile.role !== 'central') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    req.user = userData.user;
    req.profile = profile;
    next();
  } catch (error) {
    console.error('Authorization failed:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
};

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Kultrip API is running' });
});

const normalizeKey = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

const parseGroupSize = (value) => {
  if (!value) return {};
  const text = String(value);
  const match = text.match(/(\d+)\s*-\s*(\d+)/);
  if (match) {
    return {
      min_group_size: parseInt(match[1], 10),
      max_group_size: parseInt(match[2], 10),
    };
  }
  const single = text.match(/(\d+)/);
  if (single) {
    return { min_group_size: parseInt(single[1], 10) };
  }
  return {};
};

const parseList = (value) =>
  String(value || '')
    .split(/[,;]\s*/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const buildExperienceSearchText = (exp) => {
  const parts = [
    exp?.title,
    exp?.description,
    exp?.long_description,
    exp?.category,
    exp?.province,
    exp?.city,
  ]
    .filter(Boolean)
    .map((v) => String(v).trim())
    .filter((v) => v.length > 0);

  return parts.join('\n\n').slice(0, 8000);
};

const mapRowToExperience = (row) => {
  const mapped = {};
  const keyMap = {
    titulo: 'title',
    'titulo de la experiencia': 'title',
    'descripcion corta': 'description',
    'descripcion completa': 'long_description',
    provincia: 'province',
    ciudad: 'city',
    categoria: 'category',
    'precio por persona': 'price_per_person',
    precio: 'price_per_person',
    duracion: 'duration',
    'duracion (horas)': 'duration',
    'tamano grupo': 'group_size',
    'tamano grupo (min - max)': 'group_size',
    'min grupo': 'min_group_size',
    'max grupo': 'max_group_size',
    'que incluye': 'included',
    incluye: 'included',
    requisitos: 'requirements',
    'politica de cancelacion': 'cancellation_policy',
    'url de fotos': 'images',
    fotos: 'images',
  };

  Object.entries(row || {}).forEach(([key, value]) => {
    const normalized = normalizeKey(key);
    const mappedKey = keyMap[normalized];
    if (!mappedKey) return;
    if (mappedKey === 'group_size') {
      Object.assign(mapped, parseGroupSize(value));
      return;
    }
    mapped[mappedKey] = value;
  });

  if (mapped.included) mapped.included = parseList(mapped.included);
  if (mapped.images) mapped.images = parseList(mapped.images);

  if (mapped.price_per_person !== undefined && mapped.price_per_person !== null) {
    const numeric = parseFloat(String(mapped.price_per_person).replace(',', '.'));
    if (!Number.isNaN(numeric)) {
      mapped.price_numeric = numeric;
      mapped.price_per_person = numeric;
    }
  }

  if (mapped.images && mapped.images.length > 0) {
    mapped.main_image = mapped.images[0];
  }

  if (mapped.min_group_size === undefined) {
    mapped.min_group_size = 1;
  }

  return mapped;
};

const parseWithGemini = async (rawText) => {
  if (!genAI) return null;
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const prompt = `
Extrae la información de esta experiencia y devuelve SOLO JSON con estas claves:
title, description, long_description, province, city, category, price_per_person, duration, min_group_size, max_group_size, included, requirements, cancellation_policy, images.
Si no hay un campo, devuélvelo vacío.
Texto:
${rawText}
  `;
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const parseFromTextHeuristic = (rawText) => {
  const lines = String(rawText || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const result = {};
  const labelMap = {
    titulo: 'title',
    'titulo de la experiencia': 'title',
    'descripcion corta': 'description',
    'descripcion completa': 'long_description',
    provincia: 'province',
    ciudad: 'city',
    categoria: 'category',
    'precio por persona': 'price_per_person',
    duracion: 'duration',
    incluye: 'included',
    requisitos: 'requirements',
    'politica de cancelacion': 'cancellation_policy',
    fotos: 'images',
    imagenes: 'images',
  };
  lines.forEach((line) => {
    const match = line.split(':');
    if (match.length < 2) return;
    const label = normalizeKey(match[0]);
    const value = match.slice(1).join(':').trim();
    const mappedKey = labelMap[label];
    if (mappedKey) {
      result[mappedKey] = value;
    }
  });
  return mapRowToExperience(result);
};

app.post('/api/parse-experience-template', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Archivo no recibido' });
    }

    const filename = req.file.originalname.toLowerCase();
    let parsed = null;
    let rawText = '';

    if (filename.endsWith('.xlsx')) {
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      if (rows.length > 0) {
        parsed = mapRowToExperience(rows[0]);
      }
    } else if (filename.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      rawText = result.value || '';
      parsed = await parseWithGemini(rawText);
      if (parsed) {
        parsed = mapRowToExperience(parsed);
      } else {
        parsed = parseFromTextHeuristic(rawText);
      }
    } else {
      return res.status(400).json({ error: 'Formato no soportado. Usa .xlsx o .docx' });
    }

    if (!parsed) {
      return res.status(422).json({ error: 'No se pudo extraer información del template' });
    }

    res.json({ data: parsed, raw: rawText });
  } catch (error) {
    console.error('Error parsing template:', error);
    res.status(500).json({ error: 'Error al procesar el template' });
  }
});

// Stripe Checkout Session endpoint
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const {
      experienceId,
      experienceTitle,
      price,
      participants,
      customerEmail,
      customerName,
      customerPhone,
      bookingDate,
      specialRequests,
    } = req.body;

    const session = await stripe.checkout.sessions.create({
      // Let Stripe decide the best payment methods for the customer (Apple Pay / Google Pay where available).
      automatic_payment_methods: { enabled: true },
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: experienceTitle,
              description: `Booking for ${participants} participant(s)`,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/experiencia/${experienceId}`,
      customer_email: customerEmail,
      metadata: {
        experienceId,
        participants: participants.toString(),
        customerName: String(customerName || ''),
        customerPhone: String(customerPhone || ''),
        bookingDate: String(bookingDate || ''),
        specialRequests: String(specialRequests || ''),
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Confirm payment and create booking
app.post('/api/confirm-payment', async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const { experienceId, participants, customerName, customerPhone, bookingDate, specialRequests } =
        session.metadata || {};

      const { data: booking, error: bookingError } = await supabaseAdmin
        .from('bookings')
        .insert([
          {
            experience_id: experienceId,
            customer_email: session.customer_email,
            customer_name: session.customer_details?.name || customerName || '',
            customer_phone: customerPhone || null,
            participants: parseInt(participants || '1'),
            booking_date: bookingDate ? bookingDate : null,
            total_amount: session.amount_total ? session.amount_total / 100 : 0,
            status: 'confirmed',
            payment_status: 'paid',
            payment_provider: 'stripe',
            payment_id: String(session.payment_intent),
            special_requests: specialRequests || null,
          },
        ])
        .select()
        .single();

      if (bookingError) {
        console.error('Error creating booking:', bookingError);
        throw bookingError;
      }

      await supabaseAdmin.from('payments').insert([
        {
          booking_id: booking.id,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency || 'eur',
          status: 'succeeded',
          provider: 'stripe',
          provider_payment_id: String(session.payment_intent),
        },
      ]);

      if (session.customer_email) {
        const { siteUrl, logoUrl } = getEmailBranding();
        let experienceInfo = null;
        if (experienceId) {
          const { data: experienceData } = await supabaseAdmin
            .from('experiences')
            .select('title, province, city, category, duration')
            .eq('id', experienceId)
            .maybeSingle();
          experienceInfo = experienceData;
        }

        const experienceTitle = experienceInfo?.title || 'Experiencia reservada';
        const experienceLocation = [experienceInfo?.city, experienceInfo?.province].filter(Boolean).join(', ');
        const experienceCategory = experienceInfo?.category || '';
        const experienceDuration = experienceInfo?.duration || '';
        const experienceUrl = experienceId ? `${siteUrl}/experiencia/${experienceId}` : siteUrl;

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; background:#f9fafb; padding:24px;">
            <div style="max-width:640px; margin:0 auto; background:#ffffff; border-radius:12px; border:1px solid #e5e7eb; overflow:hidden;">
              <div style="background:#ffffff; padding:20px 24px; border-bottom:1px solid #f1f5f9;">
                <img src="${logoUrl}" alt="Experiencias del Destino" style="height:36px; display:block;" />
              </div>
              <div style="background:#f97316; color:#ffffff; padding:20px 24px;">
                <h1 style="margin:0; font-size:22px;">¡Reserva Confirmada!</h1>
                <p style="margin:6px 0 0; font-size:14px;">Gracias por tu reserva.</p>
              </div>
              <div style="padding:24px; color:#111827;">
                <h2 style="margin:0 0 8px; font-size:18px;">${experienceTitle}</h2>
                ${experienceLocation ? `<p style="margin:0 0 6px;"><strong>Ubicación:</strong> ${experienceLocation}</p>` : ''}
                ${experienceCategory ? `<p style="margin:0 0 6px;"><strong>Categoría:</strong> ${experienceCategory}</p>` : ''}
                ${experienceDuration ? `<p style="margin:0 0 6px;"><strong>Duración:</strong> ${experienceDuration}</p>` : ''}
                <p style="margin:16px 0 6px;"><strong>ID de Reserva:</strong> ${booking.id}</p>
                <p style="margin:0 0 6px;"><strong>Participantes:</strong> ${participants}</p>
                <p style="margin:0 0 16px;"><strong>Total:</strong> €${(session.amount_total / 100).toFixed(2)}</p>
                <a href="${experienceUrl}" style="display:inline-block; background:#f97316; color:#ffffff; text-decoration:none; padding:12px 16px; border-radius:8px; font-weight:600;">
                  Ver experiencia
                </a>
                <p style="margin:16px 0 0; color:#6b7280; font-size:13px;">
                  Experiencias del Destino • <a href="${siteUrl}" style="color:#f97316; text-decoration:none;">${siteUrl}</a>
                </p>
              </div>
            </div>
          </div>
        `;

        const emailResult = await sendEmail({
          to: session.customer_email,
          subject: `Confirmación de Reserva - ${experienceTitle}`,
          html: emailHtml,
        });

        if (!emailResult.sent) {
          console.error('Booking confirmation email not sent.');
        }
      }

      res.json({ success: true, booking });
    } else {
      res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Stripe webhook endpoint
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { experienceId, participants, customerName, customerPhone, bookingDate, specialRequests } =
      session.metadata || {};

    try {
      const { data: booking } = await supabaseAdmin
        .from('bookings')
        .insert([
          {
            experience_id: experienceId,
            customer_email: session.customer_email,
            customer_name: session.customer_details?.name || customerName || '',
            customer_phone: customerPhone || null,
            participants: parseInt(participants || '1'),
            booking_date: bookingDate ? bookingDate : null,
            total_amount: session.amount_total ? session.amount_total / 100 : 0,
            status: 'confirmed',
            payment_status: 'paid',
            payment_provider: 'stripe',
            payment_id: String(session.payment_intent),
            special_requests: specialRequests || null,
          },
        ])
        .select()
        .single();

      if (booking) {
        await supabaseAdmin.from('payments').insert([
          {
            booking_id: booking.id,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency || 'eur',
            status: 'succeeded',
            provider: 'stripe',
            provider_payment_id: String(session.payment_intent),
          },
        ]);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
    }
  }

  res.json({ received: true });
});

// Public: semantic search (vector) with keyword fallback
app.post('/api/search-experiences', async (req, res) => {
  try {
    const {
      query,
      province,
      category,
      minPrice,
      maxPrice,
      limit,
    } = req.body || {};

    const q = String(query || '').trim();
    const safeLimit = Math.min(Math.max(parseInt(String(limit || 48), 10) || 48, 1), 200);

    // Always keep the endpoint usable (empty query -> recent experiences)
    if (!q) {
      let baseQuery = supabaseAdmin
        .from('experiences')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(safeLimit);

      if (province) baseQuery = baseQuery.eq('province', province);
      if (category) baseQuery = baseQuery.eq('category', category);

      const { data, error } = await baseQuery;
      if (error) throw error;
      return res.json({ mode: 'recent', data: data || [] });
    }

    const embedding = await getTextEmbedding(q);

    // Prefer vector search when possible (requires DB function + embeddings backfilled)
    if (embedding) {
      const { data: vectorData, error: vectorError } = await supabaseAdmin.rpc(
        'match_experiences',
        {
          query_embedding: embedding,
          match_count: safeLimit,
          filter_province: province || null,
          filter_category: category || null,
          min_price: minPrice !== undefined && minPrice !== null && String(minPrice) !== '' ? Number(minPrice) : null,
          max_price: maxPrice !== undefined && maxPrice !== null && String(maxPrice) !== '' ? Number(maxPrice) : null,
        }
      );

      if (!vectorError && Array.isArray(vectorData) && vectorData.length > 0) {
        return res.json({ mode: 'semantic', data: vectorData });
      }

      // If the RPC doesn't exist yet or there are no embeddings, fall back to keyword search.
      if (vectorError) {
        console.warn('Vector search unavailable, falling back to keyword search:', vectorError);
      }
    }

    const term = q.replace(/%/g, '\\%').replace(/_/g, '\\_');
    let kwQuery = supabaseAdmin
      .from('experiences')
      .select('*')
      .eq('status', 'published')
      .or(
        [
          `title.ilike.%${term}%`,
          `description.ilike.%${term}%`,
          `long_description.ilike.%${term}%`,
          `category.ilike.%${term}%`,
        ].join(',')
      )
      .order('created_at', { ascending: false })
      .limit(safeLimit);

    if (province) kwQuery = kwQuery.eq('province', province);
    if (category) kwQuery = kwQuery.eq('category', category);
    if (minPrice !== undefined && minPrice !== null && String(minPrice) !== '') {
      kwQuery = kwQuery.gte('price_numeric', Number(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== null && String(maxPrice) !== '') {
      kwQuery = kwQuery.lte('price_numeric', Number(maxPrice));
    }

    const { data: keywordData, error: keywordError } = await kwQuery;
    if (keywordError) throw keywordError;

    res.json({ mode: 'keyword', data: keywordData || [] });
  } catch (error) {
    console.error('Error searching experiences:', error);
    res.status(500).json({
      error: 'Failed to search experiences',
      detail: error?.message || String(error),
    });
  }
});

// Public: social proof for a single experience
app.get('/api/experiences/:id/social-proof', async (req, res) => {
  try {
    const experienceId = req.params.id;
    if (!experienceId) return res.status(400).json({ error: 'Missing experience id' });

    const now = Date.now();
    const since24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const since7d = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: bookings, error } = await supabaseAdmin
      .from('bookings')
      .select('customer_email,participants,created_at')
      .eq('experience_id', experienceId)
      .eq('payment_status', 'paid')
      .gte('created_at', since7d);

    if (error) throw error;

    const last24h = [];
    for (const b of bookings || []) {
      const createdAt = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (createdAt >= now - 24 * 60 * 60 * 1000) last24h.push(b);
    }

    const uniqueEmails24h = new Set(last24h.map((b) => String(b.customer_email || '').toLowerCase()).filter(Boolean));

    const sumParticipants = (rows) =>
      rows.reduce((acc, r) => acc + (Number(r.participants) || 0), 0);

    res.json({
      window: {
        last24hSince: since24h,
        last7dSince: since7d,
      },
      bookingsLast24h: last24h.length,
      participantsLast24h: sumParticipants(last24h),
      uniqueCustomersLast24h: uniqueEmails24h.size,
      bookingsLast7d: (bookings || []).length,
      participantsLast7d: sumParticipants(bookings || []),
    });
  } catch (error) {
    console.error('Error loading social proof:', error);
    res.status(500).json({
      error: 'Failed to load social proof',
      detail: error?.message || String(error),
    });
  }
});

// Admin: generate embeddings for new experiences (or backfill missing)
app.post('/api/admin/generate-embeddings', requireCentral, async (req, res) => {
  try {
    const { onlyMissing, limit, includeUnpublished } = req.body || {};
    const safeLimit = Math.min(Math.max(parseInt(String(limit || 200), 10) || 200, 1), 2000);
    const missingOnly = onlyMissing !== false;
    const includeAll = includeUnpublished === true;

    let q = supabaseAdmin
      .from('experiences')
      .select('id,title,description,long_description,category,province,city,status,embedding,search_text')
      .order('created_at', { ascending: false })
      .limit(safeLimit);

    if (!includeAll) {
      q = q.eq('status', 'published');
    }

    if (missingOnly) {
      q = q.or('embedding.is.null,search_text.is.null');
    }

    const { data: rows, error } = await q;
    if (error) throw error;

    let updated = 0;
    let skipped = 0;
    const errors = [];

    for (const exp of rows || []) {
      const searchText = buildExperienceSearchText(exp);
      if (!searchText) {
        skipped += 1;
        continue;
      }

      // Skip if already has embedding and search_text, when onlyMissing=true.
      if (missingOnly && exp.embedding && exp.search_text) {
        skipped += 1;
        continue;
      }

      const embedding = await getTextEmbedding(searchText);
      if (!embedding || embedding.length === 0) {
        skipped += 1;
        continue;
      }

      const { error: upErr } = await supabaseAdmin
        .from('experiences')
        .update({
          embedding,
          search_text: searchText,
        })
        .eq('id', exp.id);

      if (upErr) {
        errors.push({ id: exp.id, error: upErr.message || String(upErr) });
        continue;
      }

      updated += 1;
    }

    res.json({ success: true, updated, skipped, errors });
  } catch (error) {
    console.error('Error generating embeddings:', error);
    res.status(500).json({
      error: 'Failed to generate embeddings',
      detail: error?.message || String(error),
    });
  }
});

// Admin: Invite user endpoint
app.post('/api/admin/invite-user', async (req, res) => {
  try {
    const { email, role, province, metadata, full_name } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if profile already exists
    const { data: existingProfile, error: existingError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }
    if (existingProfile) {
      return res.status(409).json({ error: 'User already exists', code: 'email_exists' });
    }

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email: normalizedEmail,
      options: {
        redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/set-password`,
      },
    });

    if (linkError) {
      if (linkError.code === 'email_exists' || linkError.code === 'user_already_exists') {
        return res.status(409).json({ error: 'User already exists', code: linkError.code });
      }
      throw linkError;
    }

    const userId = linkData?.user?.id;

    const { error: profileError } = await supabaseAdmin.from('user_profiles').insert([
      {
        user_id: userId,
        email: normalizedEmail,
        role,
        province,
        full_name: full_name || null,
        metadata: metadata || {},
      },
    ]);

    if (profileError) {
      if (profileError.code === '23505') {
        return res.status(409).json({ error: 'User already exists', code: 'email_exists' });
      }
      throw profileError;
    }

    const { siteUrl, logoUrl } = getEmailBranding();
    const inviteUrl = linkData?.properties?.action_link;
    if (!inviteUrl) {
      return res.status(500).json({ error: 'Invite link missing' });
    }

    const msg = {
      to: normalizedEmail,
      from: {
        email: getEmailBranding().fromEmail,
        name: getEmailBranding().fromName,
      },
      subject: 'Invitación a Experiencias del Destino',
      html: `
        <div style="font-family: Arial, sans-serif; background:#f9fafb; padding:24px;">
          <div style="max-width:640px; margin:0 auto; background:#ffffff; border-radius:12px; border:1px solid #e5e7eb; overflow:hidden;">
            <div style="background:#ffffff; padding:20px 24px; border-bottom:1px solid #f1f5f9;">
              <img src="${logoUrl}" alt="Experiencias del Destino" style="height:36px; display:block;" />
            </div>
            <div style="background:#f97316; color:#ffffff; padding:20px 24px;">
              <h1 style="margin:0; font-size:22px;">¡Bienvenido a Experiencias del Destino!</h1>
              <p style="margin:6px 0 0; font-size:14px;">Has sido invitado como <strong>${role}</strong>.</p>
            </div>
            <div style="padding:24px; color:#111827;">
              <p style="margin:0 0 16px;">Para activar tu cuenta y crear tu contraseña, haz clic en el botón:</p>
              <a href="${inviteUrl}" style="display:inline-block; background:#f97316; color:#ffffff; text-decoration:none; padding:12px 16px; border-radius:8px; font-weight:600;">
                Activar cuenta
              </a>
              <p style="margin:16px 0 0; color:#6b7280; font-size:13px;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
                <br/>
                <span style="word-break:break-all;">${inviteUrl}</span>
              </p>
              <p style="margin:24px 0 0; font-size:13px; color:#6b7280;">
                Experiencias del Destino • <a href="${siteUrl}" style="color:#f97316; text-decoration:none;">${siteUrl}</a>
              </p>
            </div>
          </div>
        </div>
      `,
    };

    let emailSent = false;
    let emailWarning = null;
    const emailResult = await sendEmail({
      to: normalizedEmail,
      subject: msg.subject,
      html: msg.html,
    });
    emailSent = emailResult.sent;
    if (!emailSent) {
      emailWarning = 'Invite link generated but email failed to send.';
    }

    res.json({
      success: true,
      user: linkData.user,
      inviteLink: inviteUrl,
      emailSent,
      warning: emailWarning,
    });
  } catch (error) {
    console.error('Error inviting user:', error);
    res.status(500).json({
      error: 'Failed to invite user',
      detail: error?.message || String(error),
    });
  }
});

// Messaging: Start a thread (creates thread + participants; optional initial message).
// We do this via service role to add other participants even when RLS is enabled.
app.post('/api/messages/start-thread', requireAuthenticated, async (req, res) => {
  try {
    const recipientEmail = String(req.body?.recipientEmail || '').trim().toLowerCase();
    const subjectInput = req.body?.subject;
    const message = String(req.body?.message || '').trim();

    if (!recipientEmail) {
      return res.status(400).json({ error: 'recipientEmail is required' });
    }
    if (recipientEmail === String(req.profile?.email || '').trim().toLowerCase()) {
      return res.status(400).json({ error: 'Cannot start a thread with yourself' });
    }

    const { data: recipientProfile, error: recipientError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id,email,full_name,role,province')
      .eq('email', recipientEmail)
      .maybeSingle();

    if (recipientError) throw recipientError;
    if (!recipientProfile?.user_id) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const subject =
      subjectInput && String(subjectInput).trim().length > 0
        ? String(subjectInput).trim()
        : `Conversación con ${recipientEmail}`;

    const { data: thread, error: threadError } = await supabaseAdmin
      .from('message_threads')
      .insert([
        {
          subject,
          created_by: req.user.id,
          metadata: {},
        },
      ])
      .select('id')
      .single();

    if (threadError) throw threadError;

    const now = new Date().toISOString();
    const participantsPayload = [
      {
        thread_id: thread.id,
        user_id: req.user.id,
        role: req.profile?.role || null,
        last_read_at: now,
      },
      {
        thread_id: thread.id,
        user_id: recipientProfile.user_id,
        role: recipientProfile.role || null,
        last_read_at: null,
      },
    ];

    const { error: participantsError } = await supabaseAdmin
      .from('message_participants')
      .insert(participantsPayload);
    if (participantsError) throw participantsError;

    if (message) {
      const { error: msgError } = await supabaseAdmin.from('messages').insert([
        {
          thread_id: thread.id,
          sender_user_id: req.user.id,
          body: message,
        },
      ]);
      if (msgError) throw msgError;
    }

    res.json({ threadId: thread.id });
  } catch (error) {
    console.error('Error starting message thread:', error);
    res.status(500).json({ error: 'Failed to start thread', detail: error?.message || String(error) });
  }
});

// SEO: sitemap.xml (dynamic, based on published experiences)
app.get('/sitemap.xml', async (req, res) => {
  try {
    const siteUrl =
      process.env.PUBLIC_SITE_URL ||
      process.env.FRONTEND_URL ||
      `${req.protocol}://${req.get('host')}`;

    const { data: rows, error } = await supabaseAdmin
      .from('experiences')
      .select('province,updated_at')
      .eq('status', 'published')
      .not('province', 'is', null);

    if (error) throw error;

    const byProvince = new Map();
    for (const r of rows || []) {
      const province = String(r.province || '').trim();
      if (!province) continue;
      const last = byProvince.get(province);
      const ts = r.updated_at ? new Date(r.updated_at).toISOString() : null;
      if (!last || (ts && ts > last)) byProvince.set(province, ts || new Date().toISOString());
    }

    const staticUrls = [
      { loc: `${siteUrl}/`, lastmod: new Date().toISOString() },
      { loc: `${siteUrl}/experiencias`, lastmod: new Date().toISOString() },
      { loc: `${siteUrl}/sobre-nosotros`, lastmod: new Date().toISOString() },
      { loc: `${siteUrl}/contacto`, lastmod: new Date().toISOString() },
    ];

    const provinceUrls = Array.from(byProvince.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([province, lastmod]) => ({
        loc: `${siteUrl}/provincias/${slugify(province)}`,
        lastmod,
      }));

    const urls = [...staticUrls, ...provinceUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls
        .map(
          (u) =>
            `  <url>\n` +
            `    <loc>${u.loc}</loc>\n` +
            `    <lastmod>${u.lastmod}</lastmod>\n` +
            `  </url>`
        )
        .join('\n') +
      `\n</urlset>\n`;

    res.status(200).type('application/xml').send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).type('text/plain').send('Failed to generate sitemap');
  }
});

// SEO: robots.txt
app.get('/robots.txt', (req, res) => {
  const siteUrl =
    process.env.PUBLIC_SITE_URL ||
    process.env.FRONTEND_URL ||
    `${req.protocol}://${req.get('host')}`;
  res
    .status(200)
    .type('text/plain')
    .send(`User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
});

// Start server
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDistPath));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}/api`);
});

export default app;
