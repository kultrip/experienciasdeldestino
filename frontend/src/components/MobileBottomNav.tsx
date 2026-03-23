import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, Phone, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const hideOn = ['/dashboard', '/login', '/auth'];
  if (hideOn.some((path) => location.pathname.startsWith(path))) {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-4">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-2 text-xs ${isActive('/') ? 'text-orange-600' : 'text-gray-600'}`}
        >
          <Home size={18} />
          <span>Inicio</span>
        </Link>
        <Link
          to="/experiencias"
          className={`flex flex-col items-center justify-center py-2 text-xs ${isActive('/experiencias') ? 'text-orange-600' : 'text-gray-600'}`}
        >
          <MapPin size={18} />
          <span>Explorar</span>
        </Link>
        <Link
          to="/contacto"
          className={`flex flex-col items-center justify-center py-2 text-xs ${isActive('/contacto') ? 'text-orange-600' : 'text-gray-600'}`}
        >
          <Phone size={18} />
          <span>Contacto</span>
        </Link>
        <Link
          to={user ? '/dashboard' : '/login'}
          className="flex flex-col items-center justify-center py-2 text-xs text-gray-600"
        >
          <User size={18} />
          <span>{user ? 'Panel' : 'Login'}</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
