# Guía Rápida de Inicio - Experiencias del Destino

## ✅ Estado del Proyecto

### Completado:
- ✅ Base de datos Supabase (6 tablas creadas)
- ✅ Backend Node/Express con Stripe + SendGrid
- ✅ Frontend React + TypeScript + Vite
- ✅ Autenticación con Supabase
- ✅ Todas las páginas públicas y dashboards
- ✅ Flujo completo de booking con Stripe

## 🚀 Cómo Iniciar los Servidores

### Backend (Puerto 5000):
```bash
cd /app/backend
node server.js
```

### Frontend (Puerto 3000):
```bash
cd /app/frontend
yarn vite --host 0.0.0.0 --port 3000
```

## 📍 URLs de Acceso

- **Frontend**: http://localhost:3000 o https://wanderlust-hub-169.preview.emergentagent.com
- **Backend API**: http://localhost:5000/api/health

## 📋 Próximos Pasos

### 1. Crear Usuario Central de Prueba

En Supabase Dashboard:
1. Ve a Authentication → Users
2. Crea un nuevo usuario manualmente
3. Ve a SQL Editor y ejecuta:

```sql
-- Reemplaza 'USER_ID_AQUI' con el UUID del usuario que creaste
INSERT INTO user_profiles (user_id, email, role, province, full_name)
VALUES (
  'USER_ID_AQUI',
  'admin@kultrip.com',
  'central',
  'ALL',
  'Admin Central'
);
```

### 2. Crear Experiencias de Prueba

```sql
INSERT INTO experiences (
  title, 
  description, 
  long_description,
  province, 
  price_numeric, 
  price_per_person, 
  status,
  main_image
) VALUES 
(
  'Tour Gastronómico por Santiago',
  'Descubre los sabores auténticos de Galicia',
  'Una experiencia única que te llevará por los mejores restaurantes y mercados de Santiago de Compostela. Probarás tapas tradicionales, vinos locales y aprenderás sobre la rica cultura culinaria gallega.',
  'A Coruña',
  45.00,
  45.00,
  'published',
  'https://images.unsplash.com/photo-1656423521731-9665583f100c?w=800'
),
(
  'Ruta del Camino de Santiago',
  'Vive la experiencia del peregrino',
  'Recorre los últimos kilómetros del Camino de Santiago con un guía experto. Visitarás lugares emblemáticos, conocerás la historia del camino y disfrutarás de paisajes impresionantes.',
  'A Coruña',
  35.00,
  35.00,
  'published',
  'https://images.pexels.com/photos/30582533/pexels-photo-30582533.jpeg?w=800'
),
(
  'Visita a Bodegas con Cata',
  'Descubre los secretos del vino gallego',
  'Visita una bodega tradicional en la Ribeira Sacra, conoce el proceso de elaboración del vino y disfruta de una cata comentada con maridaje de productos locales.',
  'Lugo',
  50.00,
  50.00,
  'published',
  'https://images.unsplash.com/photo-1659003608484-dae8f0a45a14?w=800'
);
```

### 3. Probar el Flujo Completo

1. **Navegación Pública**:
   - Visita http://localhost:3000
   - Explora las experiencias
   - Haz clic en "Ver más" de una experiencia

2. **Booking**:
   - Completa el formulario de reserva
   - Usa tarjeta de prueba Stripe: `4242 4242 4242 4242`
   - Fecha de vencimiento: cualquier fecha futura
   - CVC: cualquier 3 dígitos

3. **Login**:
   - Ve a /login
   - Inicia sesión con el usuario que creaste
   - Accede al dashboard según tu rol

## 🔑 Variables de Entorno Configuradas

### Frontend (.env):
- ✅ VITE_SUPABASE_URL
- ✅ VITE_SUPABASE_ANON_KEY
- ✅ VITE_STRIPE_PUBLIC_KEY
- ✅ VITE_BACKEND_URL

### Backend (.env):
- ✅ SUPABASE_URL
- ✅ SUPABASE_SERVICE_KEY
- ✅ STRIPE_SECRET_KEY
- ✅ SENDGRID_API_KEY / RESEND_API_KEY
- ✅ GEMINI_API_KEY

## 📁 Estructura del Proyecto

```
/app
├── backend/
│   ├── server.js          # API principal con Stripe
│   ├── .env              # Variables de entorno
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # Header, Footer
│   │   ├── contexts/     # AuthContext
│   │   ├── pages/
│   │   │   ├── public/   # Home, Experiences, Detail
│   │   │   ├── auth/     # Login, SetPassword
│   │   │   ├── dashboards/ # Central, Delegado, Productor
│   │   │   └── booking/  # Success
│   │   ├── services/     # API services
│   │   ├── types/        # TypeScript types
│   │   └── lib/          # Supabase client
│   └── .env
├── SETUP.md              # Guía de configuración detallada
└── supabase_schema.sql   # Schema de base de datos
```

## 🎯 Funcionalidades Implementadas

### Público:
- ✅ Homepage con hero y búsqueda
- ✅ Listado de experiencias con filtros
- ✅ Detalle de experiencia
- ✅ Booking flow con Stripe
- ✅ Confirmación de pago

### Autenticación:
- ✅ Login con Supabase
- ✅ Set password para invitados
- ✅ Protected routes por rol

### Dashboards:
- ✅ Central: Vista completa de red, usuarios, ingresos
- ✅ Delegado: Gestión regional, experiencias, comisiones
- ✅ Productor: Mis experiencias, reservas, ingresos

### Backend:
- ✅ Stripe Checkout integration
- ✅ Payment confirmation
- ✅ Webhook handling
- ✅ Email confirmations (SendGrid/Resend)
- ✅ Admin user invitations

## 🐛 Troubleshooting

### Backend no inicia:
```bash
cd /app/backend
cat /var/log/supervisor/backend.err.log
```

### Frontend no inicia:
```bash
cd /app/frontend
yarn vite --host 0.0.0.0 --port 3000
```

### Supabase RLS issues:
- Verifica que las políticas RLS estén correctas
- Usa service_role key para operaciones admin
- Revisa los logs en Supabase Dashboard

## 📞 Soporte

Para cualquier pregunta sobre el código o arquitectura, consulta:
- `/app/CONTEXT.md` - Modelo de negocio completo
- `/app/SETUP.md` - Setup detallado
- Backend API docs en `server.js`
