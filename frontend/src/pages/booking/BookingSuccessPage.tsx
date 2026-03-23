import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import axios from 'axios';

const DEFAULT_LOCAL_BACKEND = 'http://localhost:8001';
const RAW_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const isLocalhost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const BACKEND_URL = isLocalhost ? DEFAULT_LOCAL_BACKEND : (RAW_BACKEND_URL || '')

const BookingSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      confirmPayment(sessionId);
    }
  }, [sessionId]);

  const confirmPayment = async (sessionId: string) => {
    try {
      await axios.post(`${BACKEND_URL}/api/confirm-payment`, { sessionId });
    } catch (error) {
      console.error('Error confirming payment:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="text-green-600" size={40} />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Reserva Confirmada!</h1>
          <p className="text-gray-600 mb-8">
            Hemos enviado los detalles de tu reserva a tu email.
            Te esperamos para disfrutar de esta experiencia única.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Volver al inicio
            </button>
            <button
              onClick={() => navigate('/experiencias')}
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
            >
              Ver más experiencias
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
