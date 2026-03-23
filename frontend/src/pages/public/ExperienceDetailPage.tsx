import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Check } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getExperienceById } from '../../services/experienceService';
import { getReviewsByExperience } from '../../services/reviewService';
import type { Experience } from '../../types';
import axios from 'axios';
import { resolveImageUrl } from '../../utils/images';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1920';

const DEFAULT_LOCAL_BACKEND = 'http://localhost:8001';
const RAW_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const isLocalhost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const BACKEND_URL = isLocalhost ? DEFAULT_LOCAL_BACKEND : (RAW_BACKEND_URL || '')

const ExperienceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [bookingData, setBookingData] = useState({
    participants: 1,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    bookingDate: '',
    specialRequests: ''
  });
  const [isBooking, setIsBooking] = useState(false);
  const [socialProof, setSocialProof] = useState<{
    bookingsLast24h: number;
    participantsLast24h: number;
    uniqueCustomersLast24h: number;
    bookingsLast7d: number;
    participantsLast7d: number;
  } | null>(null);
  const [socialProofLoading, setSocialProofLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadExperience(id);
    }
  }, [id]);

  const loadExperience = async (experienceId: string) => {
    try {
      const data = await getExperienceById(experienceId);
      setExperience(data);
      const reviewData = await getReviewsByExperience(experienceId);
      setReviews(reviewData);

      // Social proof comes from backend (service role) to avoid RLS issues on public pages.
      setSocialProofLoading(true);
      try {
        const resp = await fetch(`${BACKEND_URL}/api/experiences/${experienceId}/social-proof`);
        if (resp.ok) {
          const payload = await resp.json();
          setSocialProof({
            bookingsLast24h: payload.bookingsLast24h || 0,
            participantsLast24h: payload.participantsLast24h || 0,
            uniqueCustomersLast24h: payload.uniqueCustomersLast24h || 0,
            bookingsLast7d: payload.bookingsLast7d || 0,
            participantsLast7d: payload.participantsLast7d || 0,
          });
        }
      } catch (e) {
        // Non-blocking
        console.warn('Social proof unavailable:', e);
      } finally {
        setSocialProofLoading(false);
      }
    } catch (error) {
      console.error('Error loading experience:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!experience) return 0;
    const pricePerPerson = experience.price_per_person || experience.price_numeric || 0;
    return pricePerPerson * bookingData.participants;
  };

  const handleBooking = async () => {
    if (!experience) return;

    if (!bookingData.customerName || !bookingData.customerEmail) {
      alert('Por favor completa tu nombre y email');
      return;
    }

    setIsBooking(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/create-checkout-session`, {
        experienceId: experience.id,
        experienceTitle: experience.title,
        price: calculateTotal(),
        participants: bookingData.participants,
        customerEmail: bookingData.customerEmail,
        customerName: bookingData.customerName,
        customerPhone: bookingData.customerPhone,
        bookingDate: bookingData.bookingDate,
        specialRequests: bookingData.specialRequests,
      });

      // Redirect to Stripe Checkout
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Error al procesar la reserva. Por favor intenta de nuevo.');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando experiencia...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Experiencia no encontrada</h2>
            <button
              onClick={() => navigate('/experiencias')}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Ver todas las experiencias →
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
        {/* Hero Image */}
        <div className="h-96 relative">
          <img
            src={resolveImageUrl(experience.main_image) || FALLBACK_IMAGE}
            alt={experience.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== FALLBACK_IMAGE) {
                target.src = FALLBACK_IMAGE;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center gap-2 text-orange-600 mb-4">
                  <MapPin size={20} />
                  <span className="font-medium">{experience.province}</span>
                  {experience.city && <span>• {experience.city}</span>}
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">{experience.title}</h1>

                {(socialProofLoading || socialProof) && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {socialProofLoading && (
                      <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                        Cargando actividad...
                      </span>
                    )}
                    {!!socialProof?.bookingsLast24h && (
                      <span className="text-xs px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                        {socialProof.bookingsLast24h} reservas hoy
                      </span>
                    )}
                    {!!socialProof?.uniqueCustomersLast24h && (
                      <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {socialProof.uniqueCustomersLast24h} personas reservaron en 24h
                      </span>
                    )}
                    {!!socialProof?.bookingsLast7d && (
                      <span className="text-xs px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                        {socialProof.bookingsLast7d} reservas en 7 días
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-6 text-gray-600 mb-6">
                  {experience.duration && (
                    <div className="flex items-center gap-2">
                      <Clock size={18} />
                      <span>{experience.duration}</span>
                    </div>
                  )}
                  {experience.min_group_size && (
                    <div className="flex items-center gap-2">
                      <Users size={18} />
                      <span>Mín. {experience.min_group_size} personas</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Descripción</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {experience.long_description || experience.description}
                  </p>
                </div>

                {experience.included && Array.isArray(experience.included) && experience.included.length > 0 && (
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Qué incluye</h2>
                    <ul className="space-y-2">
                      {experience.included.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="text-green-600 mt-1 flex-shrink-0" size={18} />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {experience.requirements && (
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Requisitos</h2>
                    <p className="text-gray-700">{experience.requirements}</p>
                  </div>
                )}

                {experience.cancellation_policy && (
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Política de cancelación</h2>
                    <p className="text-gray-700">{experience.cancellation_policy}</p>
                  </div>
                )}
              </div>

              {/* Reviews */}
              <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Reseñas</h2>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500">Compra verificada</span>
                          <span className="text-sm font-semibold text-orange-600">{review.rating} / 5</span>
                        </div>
                        <p className="text-gray-700">{review.comment || 'Sin comentario'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Aún no hay reseñas para esta experiencia.</p>
                )}
              </div>
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <div className="mb-6">
                  <span className="text-3xl font-bold text-orange-600">€{experience.price_numeric}</span>
                  {experience.price_per_person && (
                    <span className="text-gray-600 ml-2">/persona</span>
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="text-orange-600 font-semibold">1. Datos</span>
                    <span>2. Pago</span>
                    <span>3. Confirmación</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-orange-600 rounded-full"></div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Compra rápida, sin registro obligatorio.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      value={bookingData.customerName}
                      onChange={(e) => setBookingData({ ...bookingData, customerName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={bookingData.customerEmail}
                      onChange={(e) => setBookingData({ ...bookingData, customerEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={bookingData.customerPhone}
                      onChange={(e) => setBookingData({ ...bookingData, customerPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="+34 600 000 000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha deseada
                    </label>
                    <input
                      type="date"
                      value={bookingData.bookingDate}
                      onChange={(e) => setBookingData({ ...bookingData, bookingDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de personas
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setBookingData({ ...bookingData, participants: Math.max(1, bookingData.participants - 1) })}
                        className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-semibold text-lg">{bookingData.participants}</span>
                      <button
                        onClick={() => setBookingData({ ...bookingData, participants: bookingData.participants + 1 })}
                        className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Peticiones especiales
                    </label>
                    <textarea
                      value={bookingData.specialRequests}
                      onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={3}
                      placeholder="Alergias, preferencias, etc."
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 my-6 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Total</span>
                    <span className="text-2xl font-bold text-gray-900">€{calculateTotal().toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleBooking}
                    disabled={isBooking}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBooking ? 'Procesando...' : 'Reservar ahora'}
                  </button>
                  <div className="mt-3 text-xs text-gray-500 text-center">
                    Pago seguro con Stripe. Recibirás confirmación por email.
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-gray-500">
                    <span>SSL seguro</span>
                    <span>Apple Pay</span>
                    <span>Google Pay</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ExperienceDetailPage;
