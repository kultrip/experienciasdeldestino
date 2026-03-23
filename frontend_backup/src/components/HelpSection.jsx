import React from 'react';
import { Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import { contactInfo } from '../mock/mockData';
import { Button } from './ui/button';

const HelpSection = () => {
  return (
    <div className="bg-orange-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">¿Necesitas Ayuda?</h2>
          <p className="text-gray-600">Nuestro equipo está aquí para ayudarte a planificar tu experiencia perfecta</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-lg">
              <Phone size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Llámanos</h3>
            <p className="text-orange-600 font-bold text-lg mb-1">{contactInfo.phone}</p>
            <p className="text-sm text-gray-600">Llamada gratuita</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-lg">
              <Mail size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Escríbenos</h3>
            <p className="text-orange-600 font-bold text-lg mb-1">{contactInfo.email}</p>
            <p className="text-sm text-gray-600">Respuesta en 24h</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-lg">
              <Clock size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Horario</h3>
            <p className="text-orange-600 font-bold text-lg mb-1">{contactInfo.hours}</p>
            <p className="text-sm text-gray-600">Atención personalizada</p>
          </div>
        </div>
        
        <div className="text-center">
          <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
            <MessageCircle className="mr-2" size={20} />
            Contactar Ahora
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HelpSection;