// Mock data for Experiencias del Destino

export const provinces = [
  'A Coruña', 'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias',
  'Ávila', 'Badajoz', 'Barcelona', 'Burgos', 'Cáceres', 'Cádiz',
  'Cantabria', 'Castellón', 'Ciudad Real', 'Córdoba', 'Cuenca',
  'Girona', 'Granada', 'Guadalajara', 'Guipúzcoa', 'Huelva', 'Huesca',
  'Islas Baleares', 'Jaén', 'La Rioja', 'Las Palmas', 'León', 'Lleida',
  'Lugo', 'Madrid', 'Málaga', 'Murcia', 'Navarra', 'Ourense',
  'Palencia', 'Pontevedra', 'Salamanca', 'Santa Cruz de Tenerife',
  'Segovia', 'Sevilla', 'Soria', 'Tarragona', 'Teruel', 'Toledo',
  'Valencia', 'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza'
];

export const featuredDestinations = [
  {
    id: 1,
    name: 'A Coruña',
    location: 'ESPAÑA',
    experiences: 60,
    image: 'https://images.unsplash.com/photo-1659003608484-dae8f0a45a14?w=800'
  },
  {
    id: 2,
    name: 'Ávila',
    location: 'ESPAÑA',
    experiences: 60,
    image: 'https://images.pexels.com/photos/29346988/pexels-photo-29346988.jpeg?w=800'
  },
  {
    id: 3,
    name: 'Albacete',
    location: 'ESPAÑA',
    experiences: 60,
    image: 'https://images.unsplash.com/photo-1656423521731-9665583f100c?w=800'
  },
  {
    id: 4,
    name: 'Alicante',
    location: 'ESPAÑA',
    experiences: 60,
    image: 'https://images.unsplash.com/photo-1683669446813-59152d13ae0e?w=800'
  }
];

export const categories = [
  {
    id: 'todas',
    name: 'Todas',
    icon: 'Filter',
    count: null
  },
  {
    id: 'diversion',
    name: 'Diversión y Tecnología',
    icon: 'Gamepad2',
    count: 500
  },
  {
    id: 'recuerdos',
    name: 'Recuerdos y Complementos',
    icon: 'Gift',
    count: 500
  },
  {
    id: 'catas',
    name: 'Catas y Degustaciones',
    icon: 'Wine',
    count: 500
  },
  {
    id: 'rutas',
    name: 'Rutas y Visitas',
    icon: 'MapPin',
    count: 500
  },
  {
    id: 'actividades',
    name: 'Actividades',
    icon: 'Activity',
    count: null
  }
];

export const popularCategories = [
  { id: 1, name: 'Atardeceres', icon: 'Sunset' },
  { id: 2, name: 'Gastronomía', icon: 'UtensilsCrossed' },
  { id: 3, name: 'Rutas Literarias', icon: 'BookOpen' },
  { id: 4, name: 'Excursiones', icon: 'Mountain' },
  { id: 5, name: 'Cultura', icon: 'Landmark' },
  { id: 6, name: 'Aventura', icon: 'Compass' }
];

export const experiences = [
  {
    id: 1,
    title: 'Tour por el casco antiguo',
    province: 'A Coruña',
    category: 'Rutas y Visitas',
    price: 25,
    rating: 4.8,
    image: 'https://images.pexels.com/photos/30582533/pexels-photo-30582533.jpeg?w=600',
    description: 'Descubre los tesoros ocultos del noroeste de España'
  },
  {
    id: 2,
    title: 'Cata de vinos tradicionales',
    province: 'La Rioja',
    category: 'Catas y Degustaciones',
    price: 45,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1656423521731-9665583f100c?w=600',
    description: 'Experiencia única de sabores locales'
  },
  {
    id: 3,
    title: 'Ruta del Camino de Santiago',
    province: 'Galicia',
    category: 'Rutas y Visitas',
    price: 35,
    rating: 4.7,
    image: 'https://images.pexels.com/photos/30582533/pexels-photo-30582533.jpeg?w=600',
    description: 'Vive la experiencia del peregrino'
  }
];

export const footerLinks = {
  experiencias: [
    { name: 'Atardeceres', url: '#' },
    { name: 'Gastronomía', url: '#' },
    { name: 'Rutas Literarias', url: '#' },
    { name: 'Excursiones', url: '#' }
  ],
  destinos: [
    { name: 'Galicia', url: '#' },
    { name: 'Histerria (próximamente)', url: '#', disabled: true },
    { name: 'Ribeira Sacra (próximamente)', url: '#', disabled: true },
    { name: 'Rías Baixas (próximamente)', url: '#', disabled: true }
  ]
};

export const contactInfo = {
  phone: '+34 900 300 111',
  email: 'info@experienciasdeldestino.com',
  hours: 'Lun-Vie 09:00-18:00'
};