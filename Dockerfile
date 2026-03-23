FROM node:20 AS build

WORKDIR /app

# Frontend dependencies
COPY frontend/package*.json frontend/
RUN cd frontend && npm install

# Frontend source
COPY frontend frontend

# Build args for Vite (frontend build-time vars)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_STRIPE_PUBLIC_KEY
ARG VITE_BACKEND_URL

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Build frontend
RUN cd frontend && npm run build

# Runtime image
FROM node:20

WORKDIR /app

# Backend dependencies
COPY backend/package*.json backend/
RUN cd backend && npm install --omit=dev

# Backend source
COPY backend backend

# Frontend build output
COPY --from=build /app/frontend/dist /app/frontend/dist

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "backend/server.js"]
