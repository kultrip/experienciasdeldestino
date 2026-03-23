import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import type { Experience } from '../../types';
import { getExperiencesByProvince } from '../../services/experienceService';
import { SPANISH_PROVINCES } from '../../data/provinces';
import { slugify } from '../../utils/slug';
import { resolveImageUrl } from '../../utils/images';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600';

const setMeta = (name: string, content: string) => {
  if (typeof document === 'undefined') return;
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const ProvincePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [experiences, setExperiences] = useState<Experience[]>([]);

  const province = useMemo(() => {
    const s = String(slug || '').trim().toLowerCase();
    if (!s) return null;
    return SPANISH_PROVINCES.find((p) => slugify(p.name) === s) || null;
  }, [slug]);

  useEffect(() => {
    if (!province) return;
    const title = `Mejores experiencias en ${province.name} | Experiencias del Destino Plus`;
    const description = `Descubre planes y experiencias únicas en ${province.name}. Reserva online de forma rápida y segura con Experiencias del Destino Plus.`;
    document.title = title;
    setMeta('description', description);
  }, [province]);

  useEffect(() => {
    const run = async () => {
      if (!province) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getExperiencesByProvince(province.name);
        setExperiences(data);
      } catch (error) {
        console.error('Error loading province experiences:', error);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [province]);

  if (!province) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center bg-gray-50 px-4">
          <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-lg w-full text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Provincia no encontrada</h1>
            <p className="text-gray-600 mb-6">
              La provincia que buscas no existe o el enlace es incorrecto.
            </p>
            <button
              onClick={() => navigate('/experiencias')}
              className="h-11 px-5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium"
            >
              Ver todas las experiencias
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 bg-gray-50">
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-orange-100 text-sm mb-2">Guía de provincia</p>
            <h1 className="text-4xl font-bold mb-3">Mejores experiencias en {province.name}</h1>
            <p className="text-orange-100 max-w-2xl">
              Selección de planes y experiencias para disfrutar en pareja, en familia o con amigos. Reserva online en minutos.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">¿Qué encontrarás en {province.name}?</h2>
            <p className="text-gray-700">
              Experiencias culturales, gastronomía, rutas y actividades locales. Explora el catálogo y elige la opción perfecta para tu viaje.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/experiencias"
                className="h-10 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-900 font-medium inline-flex items-center"
              >
                Ver todo el catálogo
              </Link>
              <Link
                to={`/experiencias?province=${encodeURIComponent(province.name)}`}
                className="h-10 px-4 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium inline-flex items-center"
              >
                Filtrar por {province.name}
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando experiencias...</p>
            </div>
          ) : experiences.length > 0 ? (
            <>
              <p className="text-gray-600 mb-6">{experiences.length} experiencias en {province.name}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experiences.map((exp) => (
                  <Link
                    key={exp.id}
                    to={`/experiencia/${exp.id}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative h-56 overflow-hidden">
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
                      {exp.category && (
                        <span className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-orange-600">
                          {exp.category}
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-1 text-orange-600 text-sm mb-2">
                        <MapPin size={14} />
                        <span>{exp.province}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                        {exp.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">{exp.description}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-orange-600">€{exp.price_numeric}</span>
                          {exp.price_per_person && <span className="text-sm text-gray-500 ml-1">/persona</span>}
                        </div>
                        <span className="text-orange-600 font-medium text-sm group-hover:underline">Ver más →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Aún no hay experiencias publicadas en {province.name}</h2>
              <p className="text-gray-600 mb-6">
                Estamos ampliando el catálogo. Mientras tanto, puedes explorar experiencias en otras provincias o ver todas las disponibles.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/experiencias"
                  className="h-11 px-5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium inline-flex items-center justify-center"
                >
                  Ver experiencias
                </Link>
                <Link
                  to="/contacto"
                  className="h-11 px-5 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-900 font-medium inline-flex items-center justify-center"
                >
                  Contacto
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProvincePage;

