import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... GEMINI_API_KEY=... node backend/scripts/backfillExperienceEmbeddings.mjs

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

let localEmbedderPromise = null;
const getLocalEmbedder = async () => {
  if (!localEmbedderPromise) {
    const modelName =
      process.env.LOCAL_EMBEDDING_MODEL ||
      'Xenova/paraphrase-multilingual-mpnet-base-v2';
    const { pipeline } = await import('@xenova/transformers');
    localEmbedderPromise = pipeline('feature-extraction', modelName);
  }
  return localEmbedderPromise;
};

const getLocalEmbedding = async (text) => {
  const input = String(text || '').slice(0, 8000).trim();
  if (!input) return null;
  const embedder = await getLocalEmbedder();
  const output = await embedder(input, { pooling: 'mean', normalize: true });
  return Array.from(output.data).map((v) => Number(v));
};

const getEmbedding = async (text) => {
  const input = String(text || '').slice(0, 8000).trim();
  if (!input) return null;

  const candidates = [
    process.env.EMBEDDING_MODEL,
    'text-embedding-004',
    'embedding-001',
  ].filter(Boolean);

  if (genAI) {
    for (const modelName of candidates) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.embedContent(input);
        const values = result?.embedding?.values || result?.embedding?.value || result?.embedding;
        if (!Array.isArray(values) || values.length === 0) continue;
        return values.map((v) => Number(v));
      } catch (error) {
        console.warn(`Embedding model failed (${modelName}):`, error?.message || error);
      }
    }
  }

  // Local fallback (no external API calls).
  return await getLocalEmbedding(input);
};

const buildSearchText = (exp) => {
  const parts = [
    exp.title,
    exp.description,
    exp.long_description,
    exp.category,
    exp.province,
    exp.city,
  ]
    .filter(Boolean)
    .map((v) => String(v).trim());

  // Keep it reasonably sized for embedding.
  return parts.join('\n\n').slice(0, 8000);
};

const main = async () => {
  let updated = 0;
  let skipped = 0;

  // Process in small batches to avoid timeouts.
  const batchSize = 50;
  let offset = 0;

  while (true) {
    const { data: rows, error } = await supabaseAdmin
      .from('experiences')
      .select('id,title,description,long_description,category,province,city,embedding')
      .eq('status', 'published')
      .is('embedding', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + batchSize - 1);

    if (error) throw error;
    if (!rows || rows.length === 0) break;

    for (const exp of rows) {
      const searchText = buildSearchText(exp);
      if (!searchText) {
        skipped += 1;
        continue;
      }

      const embedding = await getEmbedding(searchText);
      if (!embedding) {
        skipped += 1;
        continue;
      }

      // pgvector requires a fixed dimension. Our SQL uses vector(768). If your model
      // outputs a different dimension, adjust supabase_semantic_search.sql accordingly.
      if (embedding.length !== 768) {
        throw new Error(
          `Embedding dimension mismatch: got ${embedding.length}, expected 768. ` +
            `Set EMBEDDING_MODEL to a 768-dim model or update DB column to vector(${embedding.length}).`
        );
      }

      const { error: upErr } = await supabaseAdmin
        .from('experiences')
        .update({
          embedding,
          search_text: searchText,
        })
        .eq('id', exp.id);

      if (upErr) throw upErr;
      updated += 1;
      process.stdout.write(`\rUpdated: ${updated} | Skipped: ${skipped}`);
    }

    offset += batchSize;
  }

  process.stdout.write(`\nDone. Updated: ${updated} | Skipped: ${skipped}\n`);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
