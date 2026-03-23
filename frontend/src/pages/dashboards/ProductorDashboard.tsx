import { useState, useEffect } from 'react';
import { MapPin, DollarSign, Calendar, TrendingUp, Plus, Upload } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CreateExperienceModal from '../../components/CreateExperienceModal';
import TemplateUploadModal from '../../components/TemplateUploadModal';
import { useAuth } from '../../contexts/AuthContext';
import { getMyExperiences } from '../../services/experienceService';
import { getAllBookings } from '../../services/bookingService';
import type { Experience, Booking } from '../../types';

const ProductorDashboard = () => {
  const { profile, user } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const experiencesData = await getMyExperiences(user!.id);
      const bookingsData = await getAllBookings();

      setExperiences(experiencesData);
      // Filter bookings for my experiences
      const myExperienceIds = experiencesData.map(e => e.id);
      const myBookings = bookingsData.filter(b => myExperienceIds.includes(b.experience_id));
      setBookings(myBookings);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRevenue = () => {
    return bookings
      .filter((b) => b.payment_status === 'paid')
      .reduce((sum, b) => sum + b.total_amount, 0);
  };

  const calculateMyShare = () => {
    return calculateRevenue() * 0.50; // 50% for Productor
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1">
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">Dashboard Productor</h1>
            <p className="text-orange-100">Bienvenido, {profile?.full_name || profile?.email}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="text-green-600" size={24} />
              </div>
              <p className="text-gray-600 text-sm">Mis Experiencias</p>
              <p className="text-3xl font-bold text-gray-900">{experiences.length}</p>
              <p className="text-sm text-gray-500 mt-1">{experiences.filter(e => e.status === 'published').length} publicadas</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="text-purple-600" size={24} />
              </div>
              <p className="text-gray-600 text-sm">Reservas</p>
              <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
              <p className="text-sm text-gray-500 mt-1">{bookings.filter(b => b.payment_status === 'paid').length} confirmadas</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="text-orange-600" size={24} />
              </div>
              <p className="text-gray-600 text-sm">Mis Ingresos (50%)</p>
              <p className="text-3xl font-bold text-gray-900">€{calculateMyShare().toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">Total: €{calculateRevenue().toFixed(2)}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
              <p className="text-gray-600 text-sm">Tasa de Conversión</p>
              <p className="text-3xl font-bold text-gray-900">-</p>
              <p className="text-sm text-gray-500 mt-1">Próximamente</p>
            </div>
          </div>

          {/* Quick Action */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Crea tu primera experiencia</h2>
                <p className="text-gray-600">Comparte tus experiencias únicas con viajeros de todo el mundo</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="border border-orange-600 text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Upload size={20} />
                  <span>Subir Template</span>
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus size={20} />
                  <span>Nueva Experiencia</span>
                </button>
              </div>
            </div>
          </div>

          {/* Experiences List */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Mis Experiencias</h2>
            {experiences.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experiences.map((exp) => (
                  <div key={exp.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-40 bg-gray-200">
                      <img
                        src={exp.main_image || 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600'}
                        alt={exp.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${exp.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {exp.status}
                        </span>
                        <span className="text-lg font-bold text-orange-600">€{exp.price_numeric}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">{exp.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{exp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No tienes experiencias aún</p>
                <button className="text-orange-600 hover:text-orange-700 font-medium">
                  Crear mi primera experiencia →
                </button>
              </div>
            )}
          </div>

          {/* Recent Bookings */}
          {bookings.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Reservas Recientes</h2>
              <div className="space-y-3">
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{booking.customer_name || booking.customer_email}</p>
                      <p className="text-sm text-gray-600">{booking.experience?.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">€{booking.total_amount.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {booking.payment_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      <CreateExperienceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadDashboardData();
          alert('¡Experiencia creada exitosamente!');
        }}
      />
      <TemplateUploadModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSuccess={() => {
          loadDashboardData();
          alert('¡Experiencia creada desde template!');
        }}
      />
    </div>
  );
};

export default ProductorDashboard;
