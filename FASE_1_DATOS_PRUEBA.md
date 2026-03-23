# FASE 1: Configuración y Datos de Prueba

## ✅ Variables de Entorno Actualizadas

Frontend y Backend ya tienen las keys configuradas correctamente.

## 📊 SQL para Datos de Prueba

Ejecuta este SQL en Supabase SQL Editor:

```sql
-- 1. Primero crea un usuario en Authentication > Users en Supabase dashboard
-- Anota el UUID que te da Supabase

-- 2. Crea el perfil de usuario Central
INSERT INTO user_profiles (user_id, email, role, province, full_name)
VALUES (
  'TU_USER_UUID_AQUI',  -- Reemplaza con el UUID del paso 1
  'admin@kultrip.com',
  'central',
  'ALL',
  'Admin Central'
) ON CONFLICT (user_id) DO NOTHING;

-- 3. Crear usuarios de prueba para Delegado y Productor
-- Nota: Primero créalos en Authentication > Users, luego inserta sus perfiles

-- Ejemplo Delegado
INSERT INTO user_profiles (user_id, email, role, province, full_name)
VALUES (
  'UUID_DELEGADO',  -- Reemplaza con UUID real
  'delegado@kultrip.com',
  'delegado',
  'Galicia',
  'María García - Delegada Galicia'
) ON CONFLICT (user_id) DO NOTHING;

-- Ejemplo Productor
INSERT INTO user_profiles (user_id, email, role, province, full_name)
VALUES (
  'UUID_PRODUCTOR',  -- Reemplaza con UUID real
  'productor@kultrip.com',
  'productor',
  'A Coruña',
  'Juan López - Productor Local'
) ON CONFLICT (user_id) DO NOTHING;

-- 4. Insertar experiencias de prueba
INSERT INTO experiences (
  title, 
  description, 
  long_description,
  province,
  city, 
  category,
  price,
  price_numeric, 
  price_per_person,
  min_group_size,
  max_group_size,
  status,
  main_image,
  duration,
  language,
  included,
  created_by,
  producer_id
) VALUES 
(
  'Tour Gastronómico por Santiago',
  'Descubre los sabores auténticos de Galicia',
  'Una experiencia única que te llevará por los mejores restaurantes y mercados de Santiago de Compostela. Probarás tapas tradicionales, vinos locales y aprenderás sobre la rica cultura culinaria gallega. Incluye visita al mercado de abastos, degustación en 4 restaurantes seleccionados y guía experto en gastronomía local.',
  'A Coruña',
  'Santiago de Compostela',
  'Gastronomía',
  '45€ por persona',
  45.00,
  45.00,
  2,
  10,
  'published',
  'https://images.unsplash.com/photo-1656423521731-9665583f100c?w=800',
  '4 horas',
  'es',
  '["Guía experto", "Degustación en 4 restaurantes", "Visita al mercado", "Vino local incluido"]',
  (SELECT id FROM user_profiles WHERE role = 'productor' LIMIT 1),
  (SELECT id FROM user_profiles WHERE role = 'productor' LIMIT 1)
),
(
  'Ruta del Camino de Santiago',
  'Vive la experiencia del peregrino',
  'Recorre los últimos kilómetros del Camino de Santiago con un guía experto. Visitarás lugares emblemáticos como Monte do Gozo, conocerás la historia del camino y disfrutarás de paisajes impresionantes. La ruta incluye parada para almuerzo típico gallego y finaliza en la Catedral de Santiago.',
  'A Coruña',
  'Santiago de Compostela',
  'Cultura',
  '35€ por persona',
  35.00,
  35.00,
  4,
  15,
  'published',
  'https://images.pexels.com/photos/30582533/pexels-photo-30582533.jpeg?w=800',
  '6 horas',
  'es',
  '["Guía certificado", "Almuerzo gallego", "Entrada a la Catedral", "Credencial del peregrino"]',
  (SELECT id FROM user_profiles WHERE role = 'productor' LIMIT 1),
  (SELECT id FROM user_profiles WHERE role = 'productor' LIMIT 1)
),
(
  'Visita a Bodegas con Cata',
  'Descubre los secretos del vino gallego',
  'Visita una bodega tradicional en la Ribeira Sacra, conoce el proceso de elaboración del vino desde la vendimia hasta el embotellado. Disfruta de una cata comentada de 5 vinos con maridaje de productos locales: quesos, embutidos y pan artesano. Incluye paseo por los viñedos en bancales.',
  'Lugo',
  'Ribeira Sacra',
  'Enología',
  '50€ por persona',
  50.00,
  50.00,
  2,
  12,
  'published',
  'https://images.unsplash.com/photo-1659003608484-dae8f0a45a14?w=800',
  '3 horas',
  'es',
  '["Visita guiada a bodega", "Cata de 5 vinos", "Maridaje con productos locales", "Paseo por viñedos"]',
  (SELECT id FROM user_profiles WHERE role = 'productor' LIMIT 1),
  (SELECT id FROM user_profiles WHERE role = 'productor' LIMIT 1)
),
(
  'Kayak en las Rías Baixas',
  'Aventura acuática por la costa gallega',
  'Rema por las aguas cristalinas de las Rías Baixas descubriendo calas escondidas y playas vírgenes. Incluye instructor experimentado, todo el equipo necesario y parada para snorkel. Apto para principiantes. La ruta puede adaptarse según nivel y condiciones del mar.',
  'Pontevedra',
  'Rías Baixas',
  'Aventura',
  '40€ por persona',
  40.00,
  40.00,
  1,
  8,
  'published',
  'https://images.unsplash.com/photo-1683669446813-59152d13ae0e?w=800',
  '2.5 horas',
  'es',
  '["Kayak y equipo completo", "Instructor certificado", "Equipo de snorkel", "Seguro de actividad"]',
  (SELECT id FROM user_profiles WHERE role = 'productor' LIMIT 1),
  (SELECT id FROM user_profiles WHERE role = 'productor' LIMIT 1)
);

-- 5. Insertar reglas de comisión por defecto (global)
INSERT INTO commission_rules (
  scope,
  province,
  central_percentage,
  delegado_percentage,
  productor_percentage,
  notes
) VALUES (
  'global',
  NULL,
  20.00,
  30.00,
  50.00,
  'Comisión por defecto para toda la red'
) ON CONFLICT DO NOTHING;

-- Verificar que todo se insertó correctamente
SELECT 'Usuarios creados:' as info, COUNT(*) as total FROM user_profiles
UNION ALL
SELECT 'Experiencias creadas:', COUNT(*) FROM experiences
UNION ALL
SELECT 'Reglas de comisión:', COUNT(*) FROM commission_rules;
```

## ✅ Checklist FASE 1

- [ ] Crear usuario en Supabase Authentication
- [ ] Ejecutar SQL de datos de prueba
- [ ] Probar login con el usuario creado
- [ ] Verificar que se ven las experiencias en homepage
- [ ] Hacer una reserva de prueba con tarjeta 4242 4242 4242 4242
- [ ] Verificar email de confirmación

## 🔄 Siguiente: FASE 2

Una vez completada FASE 1, continuaré con:
- Formulario de creación de experiencias
- Upload de imágenes
- Integración con Gemini AI para procesar DOC
