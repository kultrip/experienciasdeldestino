import React from 'react';
import { Phone, Mail, Clock } from 'lucide-react';
import { contactInfo } from '../mock/mockData';
import logo from '../assets/logo.svg';

const Header = () => {
  return (
    <>
      {/* Top bar */}
      <div className="bg-orange-50 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-6">
              <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors">
                <Phone size={14} />
                <span>{contactInfo.phone}</span>
              </a>
              <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors">
                <Mail size={14} />
                <span>{contactInfo.email}</span>
              </a>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={14} />
                <span>{contactInfo.hours}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-gray-700 hover:text-orange-600 transition-colors">Iniciar Sesión</button>
              <span className="text-gray-300">|</span>
              <button className="text-gray-700 hover:text-orange-600 transition-colors">Registrarse</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <img src={logo} alt="Experiencias del Destino" className="h-12" />
            </div>
            <nav className="flex items-center gap-8">
              <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">Inicio</a>
              <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">Experiencias</a>
              <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">Sobre Nosotros</a>
              <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">Contacto</a>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;