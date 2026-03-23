import { Link } from 'react-router-dom';
import { Phone, Mail, Clock, User, LogOut, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const Header = () => {
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <div className="bg-orange-50 border-b border-orange-100 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-6">
              <a href="tel:+34900300111" className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors">
                <Phone size={14} />
                <span>+34 900 300 111</span>
              </a>
              <a href="mailto:info@experienciasdeldestino.com" className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors">
                <Mail size={14} />
                <span>info@experienciasdeldestino.com</span>
              </a>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={14} />
                <span>Lun-Vie 09:00-18:00</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user && profile ? (
                <>
                  <Link to="/mensajes" className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors">
                    <MessageSquare size={16} />
                    <span>Mensajes</span>
                  </Link>
                  <Link to="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors">
                    <User size={16} />
                    <span>{profile.full_name || profile.email}</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Salir</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-orange-600 transition-colors">Iniciar Sesión</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center">
              <div className="text-2xl font-bold text-orange-600">
                <div className="leading-tight">
                  <div>EXPERIENCIAS</div>
                  <div className="text-sm font-normal">del Destino</div>
                </div>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">Inicio</Link>
              <Link to="/experiencias" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">Experiencias</Link>
              <Link to="/sobre-nosotros" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">Sobre Nosotros</Link>
              <Link to="/contacto" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">Contacto</Link>
              {user && profile && (
                <>
                  <Link to="/mensajes" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
                    Mensajes
                  </Link>
                  <Link to="/dashboard" className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium">
                    Dashboard
                  </Link>
                </>
              )}
            </nav>
            <button
              type="button"
              aria-label="Abrir menú"
              onClick={() => setMobileOpen((open) => !open)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <span className="sr-only">Abrir menú</span>
              <div className="space-y-1.5">
                <span className="block w-5 h-0.5 bg-gray-700"></span>
                <span className="block w-5 h-0.5 bg-gray-700"></span>
                <span className="block w-5 h-0.5 bg-gray-700"></span>
              </div>
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-3 space-y-2">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600"
              >
                Inicio
              </Link>
              <Link
                to="/experiencias"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600"
              >
                Experiencias
              </Link>
              <Link
                to="/sobre-nosotros"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600"
              >
                Sobre Nosotros
              </Link>
              <Link
                to="/contacto"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600"
              >
                Contacto
              </Link>
              {user && profile ? (
                <div className="pt-2 border-t border-gray-100">
                  <Link
                    to="/mensajes"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  >
                    Mensajes
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={async () => {
                      await handleSignOut();
                      setMobileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
