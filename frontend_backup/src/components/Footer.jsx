import React from 'react';
import { footerLinks, contactInfo } from '../mock/mockData';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Experiencias del Destino</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Tu puerta de entrada a las experiencias más auténticas de Galicia.
            </p>
          </div>
          
          {/* Experiencias */}
          <div>
            <h4 className="text-white font-semibold mb-4">Experiencias</h4>
            <ul className="space-y-2">
              {footerLinks.experiencias.map((link, index) => (
                <li key={index}>
                  <a href={link.url} className="text-sm hover:text-orange-500 transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Destinos */}
          <div>
            <h4 className="text-white font-semibold mb-4">Destinos</h4>
            <ul className="space-y-2">
              {footerLinks.destinos.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.url} 
                    className={`text-sm transition-colors ${
                      link.disabled ? 'text-gray-600 cursor-not-allowed' : 'hover:text-orange-500'
                    }`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contacto */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={`tel:${contactInfo.phone}`} className="hover:text-orange-500 transition-colors">
                  {contactInfo.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${contactInfo.email}`} className="hover:text-orange-500 transition-colors">
                  {contactInfo.email}
                </a>
              </li>
              <li className="text-gray-400">{contactInfo.hours}</li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2024 Experiencias del Destino. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;