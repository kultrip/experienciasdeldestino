#!/bin/bash
set -euo pipefail

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

# Project config (override via env vars if needed)
PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || true)}"
SERVICE_NAME="${SERVICE_NAME:-experienciasdeldestino}"
REGION="${REGION:-$(gcloud config get-value run/region 2>/dev/null || true)}"

if [ -z "${REGION}" ]; then
  REGION="europe-west1"
fi

if [ -z "${PROJECT_ID}" ]; then
  echo "❌ PROJECT_ID not set and gcloud config has no project. Set PROJECT_ID env var."
  exit 1
fi

echo "${GREEN}🚀 Starting Deploy: Experiencias del Destino${NC}"

gcloud config set project "${PROJECT_ID}"
gcloud config set run/region "${REGION}"

# Fetch build-time Vite vars from Secret Manager
VITE_SUPABASE_URL=$(gcloud secrets versions access latest --secret=supabase-url --project "${PROJECT_ID}")
VITE_SUPABASE_ANON_KEY=$(gcloud secrets versions access latest --secret=supabase-anon-key --project "${PROJECT_ID}")
VITE_STRIPE_PUBLIC_KEY=$(gcloud secrets versions access latest --secret=stripe-publishable-key --project "${PROJECT_ID}")
VITE_BACKEND_URL=$(gcloud secrets versions access latest --secret=vite-backend-url --project "${PROJECT_ID}" 2>/dev/null || true)
if [ -z "${VITE_BACKEND_URL}" ]; then
  VITE_BACKEND_URL=$(gcloud secrets versions access latest --secret=public-site-url --project "${PROJECT_ID}")
fi

echo "${GREEN}📦 Building and pushing image via Cloud Build...${NC}"
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions=_VITE_SUPABASE_URL="$VITE_SUPABASE_URL",_VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY",_VITE_STRIPE_PUBLIC_KEY="$VITE_STRIPE_PUBLIC_KEY",_VITE_BACKEND_URL="$VITE_BACKEND_URL",_SERVICE_NAME="$SERVICE_NAME",_REGION="$REGION" \
  .

echo "${GREEN}🌍 Publishing in Cloud Run...${NC}"
gcloud run deploy "${SERVICE_NAME}" \
  --image "${REGION}-docker.pkg.dev/${PROJECT_ID}/cloud-run-source-deploy/${SERVICE_NAME}:latest" \
  --region "${REGION}" \
  --platform managed \
  --memory 4Gi \
  --cpu 4 \
  --execution-environment gen2 \
  --timeout 900 \
  --port 8080 \
  --allow-unauthenticated \
  --set-env-vars "PUBLIC_SITE_URL=${VITE_BACKEND_URL},FRONTEND_URL=${VITE_BACKEND_URL},VITE_BACKEND_URL=${VITE_BACKEND_URL}" \
  --set-secrets "SUPABASE_URL=supabase-url:latest,\
SUPABASE_SERVICE_ROLE_KEY=supabase-service-role-key:latest,\
STRIPE_SECRET_KEY=stripe-secret-key-live:latest,\
STRIPE_WEBHOOK_SECRET=stripe-webhook-secret:latest,\
SENDGRID_API_KEY=sendgrid-api-key:latest,\
SENDGRID_FROM_EMAIL=sendgrid-from-email:latest,\
SENDGRID_FROM_NAME=sendgrid-from-name:latest,\
RESEND_API_KEY=resend-api-key:latest,\
EMAIL_FROM=email-from:latest,\
EMAIL_FROM_NAME=email-from-name:latest,\
BRANDED_LOGO_URL=branded-logo-url:latest,\
VITE_SUPABASE_URL=supabase-url:latest,\
VITE_SUPABASE_ANON_KEY=supabase-anon-key:latest,\
VITE_STRIPE_PUBLIC_KEY=stripe-publishable-key:latest,\
GEMINI_API_KEY=gemini-api-key:latest"

echo "${GREEN}✅ Successful Deploy!${NC}"
