import { useState, useEffect } from 'react';
import { MapPin, DollarSign, Calendar, Users, Plus } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { getMyExperiences } from '../../services/experienceService';
import { getAllBookings } from '../../services/bookingService';
import type { Experience, Booking } from '../../types';

const DelegadoDashboard = () => {
  const { profile, user } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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
    return calculateRevenue() * 0.30; // 30% for Delegado
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
            <h1 className="text-3xl font-bold mb-2">Dashboard Delegado</h1>
            <p className="text-orange-100">Provincia: {profile?.province}</p>
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
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="text-purple-600" size={24} />
              </div>
              <p className="text-gray-600 text-sm">Reservas</p>
              <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="text-orange-600" size={24} />
              </div>
              <p className="text-gray-600 text-sm">Mi Comisión (30%)</p>
              <p className="text-3xl font-bold text-gray-900">€{calculateMyShare().toFixed(2)}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-blue-600" size={24} />
              </div>
              <p className="text-gray-600 text-sm">Productores</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
          </div>

          {/* Experiences */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Mis Experiencias</h2>
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <Plus size={18} />
                <span>Nueva Experiencia</span>
              </button>
            </div>
            {experiences.length > 0 ? (
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{exp.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{exp.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">{exp.province}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${exp.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {exp.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600">€{exp.price_numeric}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No tienes experiencias aún. ¡Crea tu primera experiencia!</p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DelegadoDashboard;