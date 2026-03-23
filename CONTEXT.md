# CONTEXT — Experiencias del Destino Plus

## Qué es
**Experiencias del Destino Plus** es una plataforma digital para **descubrir, reservar y gestionar experiencias turísticas**. Combina un catálogo público de experiencias con un backoffice por roles para operar una red comercial y territorial.

Estructura de roles:
- **Central**: gestión global del sistema y la red
- **Delegados**: gestión territorial
- **Productores**: creadores/operadores de experiencias
- **Clientes**: compradores finales

Venta online:
- El cliente compra mediante **Stripe Checkout**.
- La reserva se registra en Supabase y alimenta métricas/dashboards.

URL pública:
- https://plus.experienciasdeldestino.com

## Qué va a ser (visión)
- Un marketplace escalable con catálogo curado, compra online, backoffice por roles y operación orientada a performance.
- Gestión flexible de **comisiones por experiencia** (productor/delegado/central).
- Automatización de altas (invitaciones) y emails con identidad de marca.
- Evolución opcional a imágenes en CDN/Storage (Supabase Storage) y plantillas de email finales en dominio propio.

## Arquitectura
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **DB + Auth**: Supabase (PostgreSQL + Auth)
- **Pagos**: Stripe Checkout + Webhooks
- **Emails**: SendGrid (primario) + Resend (fallback)
- **Deploy**: Cloud Run (contenedor único). El backend sirve el build del frontend (`frontend/dist`) como estático + fallback SPA.

## Funcionalidades principales

### Público
- Homepage
- Catálogo/listado de experiencias con filtros
- Detalle de experiencia (texto + imágenes + precio)
- Compra (Stripe Checkout)
- Página de éxito post-compra (`/booking/success`)

### Autenticación
- Login con Supabase
- Rutas protegidas por rol
- Set password para usuarios invitados (link de invitación)

### Dashboards por rol
- **Central**: métricas globales, listados, invitación de usuarios
- **Delegado**: gestión territorial (catálogo/actividad)
- **Productor**: gestión de catálogo y actividad

### Invitaciones (alta de usuarios)
- Central invita Delegados/Productores vía backend:
  - `POST /api/admin/invite-user`
  - Campos: `email`, `role`, `province`, `full_name`, `metadata`
- El backend genera link con Supabase Admin (`generateLink`) y envía email con branding.
- La contraseña se define cuando el usuario **acepta la invitación** y completa el flujo de set-password.

### Importación por plantilla (Productor)
- Importación desde **DOCX/Excel** con parseo automático + previsualización.
- Backend:
  - `POST /api/parse-experience-template`
- Gemini es opcional: si no está configurado, existe parser heurístico de fallback.

### Comisiones e ingresos
- Reparto configurable por experiencia entre productor/delegado/central.

### Reviews (MVP)
- Lectura en detalle si existe tabla `reviews`.
- Escritura/moderación no está incluida por defecto.

### PWA / móvil
- Manifest + service worker (baseline).
- Header responsive (hamburger) + navegación inferior en mobile.

## Datos y tablas clave (Supabase)
- `experiences`: catálogo
- `experiences_staging`: staging de importación (incluye `foto_portada`, `fotos`, `carpeta`)
- `user_profiles`: rol, provincia, datos de usuario
- `bookings`, `payments`: reservas y pagos
- `commission_rules`: reglas de comisión por defecto/alcance

## Imágenes (estado actual)
Estado actual recomendado en este proyecto:
- Imágenes servidas desde `frontend/public/images/` (incluidas en el build).
- En DB se guardan **paths locales** (sin URL encoding).

Estructura (ASCII, sin acentos) bajo:
- `/images/Kit Digital EdD/<categoria>/<carpeta>/<archivo>`

Notas:
- Se normalizaron rutas para evitar doble encoding (`%2520`) y mismatches de mayúsculas/minúsculas.

Alternativa futura:
- Subir imágenes a Supabase Storage (bucket) y guardar URLs públicas completas en `main_image` / `images`.

## Precios
- `price_numeric` y/o `price_per_person` representan el precio real numérico.
- `price` puede ser texto (fallback).
- Total en detalle: `precio * participantes`.

## Endpoints backend
- `GET /api/health`
- `POST /api/create-checkout-session`
- `POST /api/confirm-payment`
- `POST /api/webhook`
- `POST /api/admin/invite-user`
- `POST /api/parse-experience-template`

## Entornos y variables

### Frontend (.env / build args)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLIC_KEY`
- `VITE_BACKEND_URL` (en producción suele ser la misma URL pública)

### Backend (runtime)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (o `SUPABASE_SERVICE_KEY`)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `PUBLIC_SITE_URL` (p.ej. https://plus.experienciasdeldestino.com)
- `FRONTEND_URL` (normalmente igual a `PUBLIC_SITE_URL`)
- `BRANDED_LOGO_URL` (logo para emails)
- `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_FROM_NAME`
- `RESEND_API_KEY` (fallback)
- `EMAIL_FROM`, `EMAIL_FROM_NAME` (fallback)

## Notas de operación
Local:
- Backend: `yarn dev` (puerto 8001 en esta máquina)
- Frontend: `yarn dev` (puerto 3000)

Producción:
- Cloud Run (service: `plusedd`, region: `europe-west1`)
- Build y deploy via `deploy.sh` + `cloudbuild.yaml`

## Estado actual (marzo 2026)
- Plataforma desplegada y lista para pruebas de negocio
- Compra con Stripe operativa según llaves y webhooks configurados
- Emails:
  - confirmación de reserva con detalles
  - invitaciones con branding (SendGrid + fallback Resend)
- Imágenes locales normalizadas y visibles

## Pendiente / siguientes hitos
- Activar llaves Stripe live definitivas y validar webhooks en producción
- Definir plantilla final de emails + dominio remitente
- Monitorización/observabilidad (logs/alertas)
- Reseñas con escritura/moderación si aplica
- Evaluación de migración de imágenes a Storage/CDN si escala el catálogo

## Troubleshooting (común)

### Imágenes no cargan
- Verificar que `main_image` / `images` no tengan `%2520`.
- Verificar extensiones (`.jpg`, `.png`) y que el archivo exista en `frontend/public/images`.
- Si la ruta es local, debe empezar por `/images/`.

### Checkout falla (CORS / 500)
- En local, `VITE_BACKEND_URL` debe apuntar al backend real.
- En producción, validar `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`.

### Perfil no carga (Supabase 406)
- Suele venir de `.single()` cuando no existe fila o hay duplicados.
- La app usa `.maybeSingle()` para no romper si aún no existe perfil.

### Invitar usuario falla
- Validar `SUPABASE_SERVICE_ROLE_KEY` en backend.
- Validar `PUBLIC_SITE_URL`, `BRANDED_LOGO_URL` y credenciales de email (SendGrid/Resend).
