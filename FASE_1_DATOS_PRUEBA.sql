-- FASE 1: Datos de Prueba para Kultrip
-- Usuario ID: 1f8b6389-b892-4763-97ff-ea0049607c71

-- 1. Crear perfil de usuario Central
INSERT INTO user_profiles (user_id, email, role, province, full_name)
VALUES (
  '1f8b6389-b892-4763-97ff-ea0049607c71',
  'admin@kultrip.com',
  'central',
  'ALL',
  'Admin Central'
) ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  province = EXCLUDED.province,
  full_name = EXCLUDED.full_name;

-- 2. Insertar experiencias de prueba
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
  created_by
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
  (SELECT id FROM user_profiles WHERE user_id = '1f8b6389-b892-4763-97ff-ea0049607c71')
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
  (SELECT id FROM user_profiles WHERE user_id = '1f8b6389-b892-4763-97ff-ea0049607c71')
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
  (SELECT id FROM user_profiles WHERE user_id = '1f8b6389-b892-4763-97ff-ea0049607c71')
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
  (SELECT id FROM user_profiles WHERE user_id = '1f8b6389-b892-4763-97ff-ea0049607c71')
),
(
  'Tour Nocturno por Compostela',
  'Descubre los misterios de Santiago de noche',
  'Un recorrido nocturno por el casco histórico de Santiago descubriendo leyendas, historias y rincones mágicos iluminados. Visitarás la Catedral iluminada, plazas medievales y callejuelas con encanto. El guía experto te contará historias fascinantes de la ciudad.',
  'A Coruña',
  'Santiago de Compostela',
  'Cultura',
  '25€ por persona',
  25.00,
  25.00,
  4,
  20,
  'published',
  'https://images.unsplash.com/photo-1659003608484-dae8f0a45a14?w=800',
  '2 horas',
  'es',
  '["Guía local experto", "Entrada a monumentos iluminados", "Leyendas y tradiciones"]',
  (SELECT id FROM user_profiles WHERE user_id = '1f8b6389-b892-4763-97ff-ea0049607c71')
);

-- 3. Insertar regla de comisión por defecto
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

-- Verificar resultados
SELECT 'user_profiles' as tabla, COUNT(*) as registros FROM user_profiles
UNION ALL
SELECT 'experiences', COUNT(*) FROM experiences
UNION ALL
SELECT 'commission_rules', COUNT(*) FROM commission_rules;

-- Mostrar el perfil creado
SELECT id, email, role, province, full_name FROM user_profiles WHERE user_id = '1f8b6389-b892-4763-97ff-ea0049607c71';

-- Mostrar experiencias creadas
SELECT id, title, province, price_numeric, status FROM experiences LIMIT 5;
