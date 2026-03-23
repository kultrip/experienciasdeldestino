# Kultrip / Experiencias del Destino - Setup Guide

This guide will help you set up the complete application stack based on CONTEXT.md specifications.

## Architecture Overview

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Email**: SendGrid
- **Storage**: Supabase Storage

## Prerequisites

1. Node.js 18+ and Yarn
2. Supabase account and project
3. Stripe account
4. SendGrid account
5. (Optional) Gemini AI API key
6. (Optional) Twilio account for WhatsApp

## Step 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to https://supabase.com
2. Create a new project
3. Note your project URL and anon key

### 1.2 Run Database Schema
1. Go to SQL Editor in Supabase dashboard
2. Copy the contents of `supabase_schema.sql`
3. Execute the SQL to create all tables, indexes, and RLS policies

### 1.3 Configure Storage
1. Go to Storage in Supabase dashboard
2. Create a bucket named `experience-images`
3. Make it public for read access
4. Set up policies for authenticated uploads

### 1.4 Get Service Role Key
1. Go to Project Settings > API
2. Copy the `service_role` key (keep it secret!)

## Step 2: Stripe Setup

### 2.1 Get API Keys
1. Go to https://dashboard.stripe.com
2. Get your test API keys (Publishable and Secret)
3. Note them for environment variables

### 2.2 Set up Webhook
1. Go to Developers > Webhooks
2. Add endpoint: `https://your-backend-url.com/api/webhook`
3. Select events: `checkout.session.completed`
4. Copy the webhook signing secret

## Step 3: SendGrid Setup

1. Go to https://sendgrid.com
2. Create an API key with mail send permissions
3. Verify your sender email address
4. Note the API key

## Step 4: Backend Configuration

### 4.1 Environment Variables
Create `/app/backend/.env`:

```env
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:5173

# Optional: Gemini AI
GEMINI_API_KEY=your_gemini_key

# Optional: Twilio
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### 4.2 Install Dependencies
```bash
cd /app/backend
yarn install
```

### 4.3 Start Backend
```bash
yarn dev
```

Backend should be running on http://localhost:5000

## Step 5: Frontend Configuration

### 5.1 Environment Variables
Create `/app/frontend/.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_BACKEND_URL=http://localhost:5000
```

### 5.2 Install Dependencies
```bash
cd /app/frontend
yarn install
```

### 5.3 Start Frontend
```bash
yarn dev
```

Frontend should be running on http://localhost:5173

## Step 6: Create Initial Data

### 6.1 Create Central User
Use Supabase dashboard to:
1. Go to Authentication > Users
2. Create a user manually
3. Go to SQL Editor and run:

```sql
INSERT INTO user_profiles (user_id, email, role, province)
VALUES ('user-uuid-from-auth', 'admin@kultrip.com', 'central', 'ALL');
```

### 6.2 Use Admin API to Invite Users
```bash
curl -X POST http://localhost:5000/api/admin/invite-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "delegado@example.com",
    "role": "delegado",
    "province": "Galicia"
  }'
```

## Step 7: Test the Application

### 7.1 Test Public Flow
1. Visit http://localhost:5173
2. Browse experiences
3. View experience details
4. Complete a test booking with Stripe test card: 4242 4242 4242 4242

### 7.2 Test Admin Dashboards
1. Login as Central user
2. Navigate to dashboard
3. Create experiences
4. Invite delegados and productores
5. View bookings and revenue

## Key Features Implemented

✅ Three-tier franchise model (Central/Delegado/Productor)
✅ Role-based authentication with Supabase
✅ Experience management with pricing normalization
✅ Booking flow with Stripe payments
✅ Email confirmations via SendGrid
✅ Role-specific dashboards
✅ Commission structure (ready for future enhancements)
✅ Message timeline (schema ready)
✅ Webhook handling for payment backup

## Next Steps (Based on CONTEXT.md Roadmap)

1. **Communication Timeline**: Implement real messaging with WhatsApp integration
2. **Commission Overrides**: Build UI for per-user and per-experience commission rules
3. **Approval Workflow**: Add experience approval flow for Delegados/Central
4. **Invoice Generation**: Monthly PDF invoices with commission breakdowns
5. **Advanced Dashboards**: Performance insights and analytics
6. **Shopping Cart**: Multi-experience bookings

## Deployment

### Using Google Cloud Run (as per CONTEXT.md)

1. Build Docker image
2. Deploy to Cloud Run
3. Configure environment variables
4. Set up Cloud Build for CI/CD
5. Configure custom domain

See CONTEXT.md for deployment architecture details.

## Troubleshooting

### Backend not starting
- Check all environment variables are set
- Verify Supabase credentials
- Check port 5000 is available

### Frontend not connecting to Supabase
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- Check RLS policies are correctly set
- Ensure tables are created

### Stripe payments failing
- Use test card: 4242 4242 4242 4242
- Check Stripe API keys
- Verify webhook secret for production

### Emails not sending
- Verify SendGrid API key
- Check sender email is verified
- Look at SendGrid activity logs

## Support

For questions or issues, refer to:
- CONTEXT.md for business logic
- supabase_schema.sql for database structure
- Backend API documentation in server.js
