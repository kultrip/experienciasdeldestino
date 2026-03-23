# Instrucciones para configurar Supabase

## Paso 1: Obtener Service Role Key

1. Ve a tu proyecto Supabase: https://znyobiyzwkexzmjvixnu.supabase.co
2. Ve a **Settings** > **API**
3. Copia el **service_role key** (¡NO lo compartas públicamente!)
4. Actualiza el archivo `/app/backend/.env` con la key correcta

## Paso 2: Ejecutar el Schema SQL

1. Ve a tu proyecto Supabase: https://znyobiyzwkexzmjvixnu.supabase.co
2. Ve a **SQL Editor**
3. Crea una nueva query
4. Copia TODO el contenido del archivo `/app/supabase_schema.sql`
5. Pégalo en el editor
6. Haz clic en **RUN** para ejecutar el schema

Esto creará:
- ✅ Todas las tablas (user_profiles, experiences, bookings, payments, etc.)
- ✅ Índices para mejor rendimiento
- ✅ Row Level Security (RLS) policies
- ✅ Triggers para updated_at

## Paso 3: Configurar Storage (para imágenes)

1. Ve a **Storage** en Supabase dashboard
2. Crea un nuevo bucket llamado `experience-images`
3. Configúralo como público para lectura
4. Policies:
   - Permitir lectura a todos
   - Permitir upload solo a usuarios autenticados

## Paso 4: Crear usuario Central inicial

En el SQL Editor, ejecuta:

```sql
-- Primero crea un usuario en Authentication > Users en el dashboard
-- Luego ejecuta esto con el user_id que te dé Supabase

INSERT INTO user_profiles (user_id, email, role, province, full_name)
VALUES (
  'TU_USER_ID_AQUI',  -- Reemplaza con el UUID del usuario
  'admin@kultrip.com',
  'central',
  'ALL',
  'Administrador Central'
);
```

## Verificación

Verifica que las tablas se crearon correctamente:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Deberías ver:
- user_profiles
- experiences
- bookings
- payments
- commission_rules
- message_timeline
