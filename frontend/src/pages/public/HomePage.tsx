import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, Users } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getAllExperiences } from '../../services/experienceService';
import type { Experience } from '../../types';
import { resolveImageUrl } from '../../utils/images';
import { getProvinceNames } from '../../data/provinces';
import { slugify } from '../../utils/slug';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600';

const provinces = getProvinceNames();

const HomePage = () => {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      const data = await getAllExperiences();
      setExperiences(data.slice(0, 4)); // Show first 4
    } catch (error) {
      console.error('Error loading experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <div
        className="relative h-[600px] flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1659003608484-dae8f0a45a14?w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-orange-900/40 via-orange-800/50 to-orange-900/60"></div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-4 tracking-tight">
            Experiencias del Destino
          </h1>
          <p className="text-2xl mb-2 font-light">Plus</p>
          <p className="text-xl mb-8">Descubre experiencias únicas en toda España</p>

          <div className="mt-12">
            <p className="text-lg mb-4">Selecciona tu provincia para comenzar</p>
            <div className="max-w-md mx-auto">
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full h-14 bg-white text-gray-900 text-lg border-none shadow-lg rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Selecciona una provincia</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>
            {selectedProvince && (
              <div className="mt-4">
                <Link
                  to={`/provincias/${slugify(selectedProvince)}`}
                  className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium transition-colors"
                >
                  Ver mejores experiencias en {selectedProvince} →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow-md sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="¿Qué experiencia buscas?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 h-12 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button className="h-12 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Precio
            </button>

            <button className="h-12 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Users size={18} />
              <span>Grupo</span>
            </button>

            <Link
              to={`/experiencias${(() => {
                const params = new URLSearchParams();
                if (searchQuery.trim()) params.set('q', searchQuery.trim());
                if (selectedProvince) params.set('province', selectedProvince);
                const qs = params.toString();
                return qs ? `?${qs}` : '';
              })()}`}
              className="h-12 px-8 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center justify-center font-medium"
            >
              Buscar
            </Link>
          </div>
        </div>
      </div>

      {/* Experiences Section */}
      <div className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Experiencias Destacadas</h2>
          <p className="text-gray-600 mb-8">Descubre las experiencias más populares</p>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            </div>
          ) : experiences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {experiences.map((exp) => (
                <Link
                  key={exp.id}
                  to={`/experiencia/${exp.id}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={resolveImageUrl(exp.main_image) || FALLBACK_IMAGE}
                      alt={exp.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== FALLBACK_IMAGE) {
                          target.src = FALLBACK_IMAGE;
                        }
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 text-orange-600 text-sm mb-2">
                      <MapPin size={14} />
                      <span>{exp.province}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{exp.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">{exp.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-orange-600">€{exp.price_numeric}</span>
                      <span className="text-orange-600 font-medium text-sm group-hover:underline">Ver más →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No hay experiencias disponibles aún.</p>
              <p className="text-sm text-gray-500 mt-2">¡Vuelve pronto para descubrir nuevas experiencias!</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/experiencias"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Ver todas las experiencias
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-orange-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">¿Necesitas Ayuda?</h2>
              <p className="text-gray-600">Nuestro equipo está aquí para ayudarte a planificar tu experiencia perfecta</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Llámanos</h3>
                <p className="text-orange-600 font-bold text-lg mb-1">+34 900 300 111</p>
                <p className="text-sm text-gray-600">Llamada gratuita</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Escríbenos</h3>
                <p className="text-orange-600 font-bold text-lg mb-1">info@experienciasdeldestino.com</p>
                <p className="text-sm text-gray-600">Respuesta en 24h</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Horario</h3>
                <p className="text-orange-600 font-bold text-lg mb-1">Lun-Vie 09:00-18:00</p>
                <p className="text-sm text-gray-600">Atención personalizada</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
