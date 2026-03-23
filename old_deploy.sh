#!/bin/bash
set -euo pipefail

# Cores para o terminal
GREEN='\033[0;32m'
NC='\033[0m'

echo "${GREEN}🚀 Starting Deploy: Experiencias del Destino${NC}"

# Ensure correct project
gcloud config set project plusedd

# 1. Build da imagem localmente (Usando Colima/Docker)
# 1. Build e Push da imagem usando Cloud Build (Sem depender do Docker local)

# Fetch build-time VITE vars from Secret Manager
VITE_SUPABASE_URL=$(gcloud secrets versions access latest --secret=supabase-url --project plusedd)
VITE_SUPABASE_ANON_KEY=$(gcloud secrets versions access latest --secret=supabase-anon-key --project plusedd)
VITE_STRIPE_PUBLISHABLE_KEY=$(gcloud secrets versions access latest --secret=stripe-publishable-key --project plusedd)


echo "${GREEN}📦 Building and pushing image via Cloud Build...${NC}"
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions=_VITE_SUPABASE_URL="$VITE_SUPABASE_URL",_VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY",_VITE_STRIPE_PUBLISHABLE_KEY="$VITE_STRIPE_PUBLISHABLE_KEY" \
  .


# 3. Deploy no Cloud Run
echo "${GREEN}🌍 Publishing in Cloud Run...${NC}"
gcloud run deploy plusedd \
  --image europe-west1-docker.pkg.dev/plusedd/cloud-run-source-deploy/plusedd:latest \
  --region europe-west1 \
  --platform managed \
  --memory 4Gi \
  --cpu 4 \
  --execution-environment gen2 \
  --timeout 900 \
  --port 8080 \
  --allow-unauthenticated \
  --set-env-vars "PUBLIC_SITE_URL=https://plus.experienciasdeldestino.com" \
  --set-secrets "GEMINI_API_KEY=gemini-api-key:latest,\
STRIPE_SECRET_KEY=stripe-secret-key-test:latest,\
RESEND_API_KEY=resend-api-key:latest,\
SENDGRID_API_KEY=sendgrid-api-key:latest,\
EMAIL_FROM=email-from:latest,\
EMAIL_FROM_NAME=email-from-name:latest,\
VITE_SUPABASE_URL=supabase-url:latest,\
VITE_SUPABASE_ANON_KEY=supabase-anon-key:latest,\
VITE_STRIPE_PUBLISHABLE_KEY=stripe-publishable-key:latest,\
SUPABASE_URL=supabase-url:latest,\
SUPABASE_SERVICE_ROLE_KEY=supabase-service-role-key:latest,\
STRIPE_WEBHOOK_SECRET=stripe-webhook-secret:latest,\
TWILIO_ACCOUNT_SID=twilio-account-sid:latest,\
TWILIO_AUTH_TOKEN=twilio-auth-token:latest,\
TWILIO_WHATSAPP_NUMBER=twilio-whatsapp-number:latest"


echo "${GREEN}✅ Successful Deploy!${NC}"
