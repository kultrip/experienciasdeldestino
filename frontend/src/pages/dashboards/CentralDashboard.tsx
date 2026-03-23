import { useState, useEffect } from 'react';
import { Users, MapPin, DollarSign, Calendar, Plus, TrendingUp } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { getAllUsers } from '../../services/userService';
import { generateEmbeddingsForExperiences, getAllExperiences } from '../../services/experienceService';
import { getAllBookings } from '../../services/bookingService';
import type { UserProfile, Experience, Booking } from '../../types';
import axios from 'axios';

const DEFAULT_LOCAL_BACKEND = 'http://localhost:8001';
const RAW_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const isLocalhost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const BACKEND_URL = RAW_BACKEND_URL || (isLocalhost ? DEFAULT_LOCAL_BACKEND : '');

const provinces = [
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

const CentralDashboard = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [embedLoading, setEmbedLoading] = useState(false);
  const [embedMessage, setEmbedMessage] = useState('');
  const [embedError, setEmbedError] = useState('');
  const [inviteForm, setInviteForm] = useState({
    full_name: '',
    email: '',
    role: 'delegado',
    province: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [usersData, experiencesData, bookingsData] = await Promise.all([
        getAllUsers(),
        getAllExperiences(),
        getAllBookings()
      ]);
      setUsers(usersData);
      setExperiences(experiencesData);
      setBookings(bookingsData);
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      if (error?.message || error?.details) {
        console.error('Dashboard error detail:', {
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          code: error?.code,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    setInviteError('');
    setInviteSuccess('');

    if (!inviteForm.full_name.trim()) {
      setInviteError('El nombre es obligatorio.');
      return;
    }
    if (!inviteForm.email.trim()) {
      setInviteError('El email es obligatorio.');
      return;
    }
    if (!inviteForm.province.trim()) {
      setInviteError('La provincia es obligatoria.');
      return;
    }

    setInviteLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/admin/invite-user`, {
        email: inviteForm.email.trim(),
        role: inviteForm.role,
        province: inviteForm.province,
        full_name: inviteForm.full_name.trim()
      });
      setInviteSuccess('Invitación enviada correctamente.');
      setInviteLink(response?.data?.inviteLink || '');
      setInviteForm({
        full_name: '',
        email: '',
        role: 'delegado',
        province: ''
      });
      await loadDashboardData();
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteSuccess('');
        setInviteLink('');
      }, 1200);
    } catch (error) {
      console.error('Error inviting user:', error);
      const status = (error as any)?.response?.status;
      const code = (error as any)?.response?.data?.code;
      const detail = (error as any)?.response?.data?.detail;
      if (status === 409 || code === 'email_exists') {
        setInviteError('Este email ya existe en el sistema.');
      } else if (status === 400) {
        setInviteError('Datos inválidos. Revisa los campos.');
      } else {
        setInviteError(detail ? `No se pudo enviar la invitación. ${detail}` : 'No se pudo enviar la invitación. Intenta de nuevo.');
      }
    } finally {
      setInviteLoading(false);
    }
  };

  const handleGenerateEmbeddings = async () => {
    setEmbedError('');
    setEmbedMessage('');
    setEmbedLoading(true);
    try {
      const result = await generateEmbeddingsForExperiences({ onlyMissing: true, limit: 300 });
      const errorCount = result.errors?.length || 0;
      setEmbedMessage(
        `Embeddings generados. Actualizados: ${result.updated}. Omitidos: ${result.skipped}.` +
          (errorCount ? ` Errores: ${errorCount}.` : '')
      );
    } catch (error: any) {
      console.error('Error generating embeddings:', error);
      setEmbedError(error?.message || 'No se pudieron generar embeddings.');
    } finally {
      setEmbedLoading(false);
    }
  };

  const calculateTotalRevenue = () => {
    return bookings
      .filter((b) => b.payment_status === 'paid')
      .reduce((sum, b) => sum + b.total_amount, 0);
  };

  const calculateCentralShare = () => {
    return calculateTotalRevenue() * 0.20; // 20% for Central
  };

  const delegadoCount = users.filter((u) => u.role === 'delegado').length;
  const productorCount = users.filter((u) => u.role === 'productor').length;

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
            <h1 className="text-3xl font-bold mb-2">Dashboard Central</h1>
            <p className="text-orange-100">Bienvenido, {profile?.full_name || profile?.email}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Búsqueda Inteligente</h2>
              <p className="text-sm text-gray-600">
                Genera embeddings para nuevas experiencias publicadas para mejorar la búsqueda por intención.
              </p>
              {embedMessage && <p className="text-sm text-green-700 mt-2">{embedMessage}</p>}
              {embedError && <p className="text-sm text-red-600 mt-2">{embedError}</p>}
            </div>
            <button
              type="button"
              onClick={handleGenerateEmbeddings}
              disabled={embedLoading}
              className="h-11 px-5 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-medium"
            >
              {embedLoading ? 'Generando...' : 'Generar Embeddings'}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
              <p className="text-gray-600 text-sm">Total Usuarios</p>
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              <p className="text-sm text-gray-500 mt-1">{delegadoCount} delegados, {productorCount} productores</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="text-green-600" size={24} />
                </div>
              </div>
              <p className="text-gray-600 text-sm">Experiencias</p>
              <p className="text-3xl font-bold text-gray-900">{experiences.length}</p>
              <p className="text-sm text-gray-500 mt-1">{experiences.filter(e => e.status === 'published').length} publicadas</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="text-purple-600" size={24} />
                </div>
              </div>
              <p className="text-gray-600 text-sm">Reservas</p>
              <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
              <p className="text-sm text-gray-500 mt-1">{bookings.filter(b => b.payment_status === 'paid').length} pagadas</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-orange-600" size={24} />
                </div>
              </div>
              <p className="text-gray-600 text-sm">Ingresos Central (20%)</p>
              <p className="text-3xl font-bold text-gray-900">€{calculateCentralShare().toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">Total: €{calculateTotalRevenue().toFixed(2)}</p>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reservas Recientes</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cliente</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Experiencia</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 10).map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm">{booking.customer_name || booking.customer_email}</td>
                      <td className="py-3 px-4 text-sm">{booking.experience?.title || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm">{new Date(booking.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${booking.payment_status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {booking.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-semibold">€{booking.total_amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Plus className="text-orange-600" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Invitar Usuario</h3>
              <p className="text-sm text-gray-600">Invita nuevos delegados o productores</p>
            </button>

            <button className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Ver Reportes</h3>
              <p className="text-sm text-gray-600">Análisis y estadísticas detalladas</p>
            </button>

            <button className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-blue-600" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Gestionar Usuarios</h3>
              <p className="text-sm text-gray-600">Administra perfiles y permisos</p>
            </button>
          </div>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Invitar Usuario</h2>
              <button
                type="button"
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteError('');
                  setInviteSuccess('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                <input
                  type="text"
                  value={inviteForm.full_name}
                  onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="Nombre y apellidos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                >
                  <option value="delegado">Delegado</option>
                  <option value="productor">Productor</option>
                  <option value="central">Central</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provincia *</label>
                <select
                  value={inviteForm.province}
                  onChange={(e) => setInviteForm({ ...inviteForm, province: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                >
                  <option value="">Selecciona una provincia</option>
                  {provinces.map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              {inviteError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {inviteError}
                </div>
              )}
              {inviteSuccess && (
                <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  {inviteSuccess}
                </div>
              )}
              {inviteLink && (
                <div className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  Enlace de invitación (por si no llega el email):
                  <div className="mt-1 break-all text-orange-600">{inviteLink}</div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteError('');
                  setInviteSuccess('');
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleInviteUser}
                disabled={inviteLoading}
                className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60"
              >
                {inviteLoading ? 'Enviando...' : 'Enviar invitación'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CentralDashboard;
