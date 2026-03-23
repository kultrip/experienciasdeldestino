import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, Filter } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getAllExperiences, semanticSearchExperiences } from '../../services/experienceService';
import type { Experience } from '../../types';
import { resolveImageUrl } from '../../utils/images';
import { useSearchParams } from 'react-router-dom';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600';

const ExperiencesPage = () => {
  const [allExperiences, setAllExperiences] = useState<Experience[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [durationMax, setDurationMax] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [semanticMode, setSemanticMode] = useState<'semantic' | 'keyword' | 'recent' | ''>('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadExperiences();
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    const province = searchParams.get('province');
    if (q && !searchTerm) setSearchTerm(q);
    if (province && !selectedProvince) setSelectedProvince(province);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadExperiences = async () => {
    try {
      const data = await getAllExperiences();
      setAllExperiences(data);
      setExperiences(data);
    } catch (error) {
      console.error('Error loading experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const term = searchTerm.trim();
    const shouldSemantic = term.length >= 3;
    if (!shouldSemantic) {
      setExperiences(allExperiences);
      setSemanticMode('');
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setSearchLoading(true);
        const result = await semanticSearchExperiences({
          query: term,
          province: selectedProvince || undefined,
          category: selectedCategory || undefined,
          minPrice: priceMin || undefined,
          maxPrice: priceMax || undefined,
          limit: 96,
        });
        if (!controller.signal.aborted) {
          setSemanticMode(result.mode);
          setExperiences(result.data || []);
        }
      } catch (error) {
        console.error('Semantic search failed, falling back to local filter:', error);
        if (!controller.signal.aborted) {
          setSemanticMode('');
          setExperiences(allExperiences);
        }
      } finally {
        if (!controller.signal.aborted) setSearchLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [searchTerm, allExperiences, selectedProvince, selectedCategory, priceMin, priceMax]);

  const uniqueProvinces = Array.from(new Set(allExperiences.map((exp) => exp.province))).sort();
  const uniqueCategories = Array.from(new Set(allExperiences.map((exp) => exp.category).filter(Boolean) as string[])).sort();

  const parseDurationHours = (value?: string) => {
    if (!value) return null;
    const match = value.match(/(\d+([.,]\d+)?)/);
    if (!match) return null;
    return parseFloat(match[1].replace(',', '.'));
  };

  const filteredExperiences = experiences
    .filter((exp) => {
      const normalizedSearch = searchTerm.trim().toLowerCase();
      const semanticActive = normalizedSearch.length >= 3 && semanticMode !== '';
      const matchesSearch = semanticActive
        ? true
        : (!normalizedSearch ||
            exp.title.toLowerCase().includes(normalizedSearch) ||
            exp.description?.toLowerCase().includes(normalizedSearch) ||
            exp.long_description?.toLowerCase().includes(normalizedSearch) ||
            exp.category?.toLowerCase().includes(normalizedSearch));
      const matchesProvince = !selectedProvince || exp.province === selectedProvince;
      const matchesCategory = !selectedCategory || exp.category === selectedCategory;

      const priceValue = exp.price_per_person ?? exp.price_numeric ?? 0;
      const minPrice = priceMin ? parseFloat(priceMin) : null;
      const maxPrice = priceMax ? parseFloat(priceMax) : null;
      const matchesPrice =
        (minPrice === null || priceValue >= minPrice) &&
        (maxPrice === null || priceValue <= maxPrice);

      const group = groupSize ? parseInt(groupSize, 10) : null;
      const matchesGroup =
        !group ||
        ((exp.min_group_size ?? 1) <= group && (!exp.max_group_size || exp.max_group_size >= group));

      const durationHours = parseDurationHours(exp.duration);
      const durationLimit = durationMax ? parseFloat(durationMax) : null;
      const matchesDuration = durationLimit === null || (durationHours !== null && durationHours <= durationLimit);

      return matchesSearch && matchesProvince && matchesCategory && matchesPrice && matchesGroup && matchesDuration;
    })
    .sort((a, b) => {
      if (sortBy === 'price_low') {
        return (a.price_per_person ?? a.price_numeric ?? 0) - (b.price_per_person ?? b.price_numeric ?? 0);
      }
      if (sortBy === 'price_high') {
        return (b.price_per_person ?? b.price_numeric ?? 0) - (a.price_per_person ?? a.price_numeric ?? 0);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const activeFiltersCount = [
    searchTerm,
    selectedProvince,
    selectedCategory,
    priceMin,
    priceMax,
    groupSize,
    durationMax
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Page Header with Hero Image */}
      <div 
        className="relative text-white py-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(234, 88, 12, 0.85), rgba(194, 65, 12, 0.9)), url(https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Todas las Experiencias</h1>
          <p className="text-xl text-orange-100">Descubre experiencias únicas en toda España</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar (ej. romantico atardecer, aventura en familia)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 h-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                </div>
              )}
            </div>

            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todas las provincias</option>
              {uniqueProvinces.map((prov) => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowFilters((open) => !open)}
              className="h-12 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Filter size={18} />
              <span>Filtros {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
            </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Categoría</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="h-11 w-full px-3 border border-gray-300 rounded-lg"
                  >
                    <option value="">Todas</option>
                    {uniqueCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Precio (€)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="Mín"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="h-11 w-full px-3 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Máx"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="h-11 w-full px-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Personas (grupo)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ej. 4"
                    value={groupSize}
                    onChange={(e) => setGroupSize(e.target.value)}
                    className="h-11 w-full px-3 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Duración máxima (horas)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ej. 3"
                    value={durationMax}
                    onChange={(e) => setDurationMax(e.target.value)}
                    className="h-11 w-full px-3 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Ordenar por</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-11 w-full px-3 border border-gray-300 rounded-lg"
                  >
                    <option value="recent">Más recientes</option>
                    <option value="price_low">Precio: menor a mayor</option>
                    <option value="price_high">Precio: mayor a menor</option>
                    <option value="title">Título (A-Z)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedProvince('');
                      setSelectedCategory('');
                      setPriceMin('');
                      setPriceMax('');
                      setGroupSize('');
                      setDurationMax('');
                      setSortBy('recent');
                    }}
                    className="h-11 w-full px-3 border border-gray-300 rounded-lg hover:bg-white"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Experiences Grid */}
      <div className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando experiencias...</p>
            </div>
          ) : filteredExperiences.length > 0 ? (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
                <p className="text-gray-600">{filteredExperiences.length} experiencias encontradas</p>
                {searchTerm.trim().length >= 3 && (
                  <p className="text-sm text-gray-500">
                    {semanticMode === 'semantic' ? 'Búsqueda inteligente' : semanticMode === 'keyword' ? 'Búsqueda por palabras' : ''}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExperiences.map((exp) => (
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
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">{exp.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">{exp.description}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-orange-600">€{exp.price_per_person ?? exp.price_numeric}</span>
                          <span className="text-sm text-gray-500 ml-1">/persona</span>
                        </div>
                        <span className="text-orange-600 font-medium text-sm group-hover:underline">Ver más →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No se encontraron experiencias</p>
              <p className="text-sm text-gray-500 mt-2">Intenta ajustar tus filtros de búsqueda</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ExperiencesPage;
