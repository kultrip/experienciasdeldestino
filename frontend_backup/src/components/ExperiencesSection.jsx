import React from 'react';
import { experiences } from '../mock/mockData';

const ExperiencesSection = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Todas las Experiencias</h2>
      <p className="text-gray-600 mb-8">Descubre los tesoros ocultos del noroeste de España con nuestras experiencias cuidadosamente seleccionadas</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experiences.map((experience) => (
          <div
            key={experience.id}
            className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={experience.image}
                alt={experience.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-bold text-orange-600">
                {experience.price}€
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span className="text-orange-600 font-medium">{experience.province}</span>
                <span>•</span>
                <span>{experience.category}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{experience.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{experience.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm font-medium text-gray-700">{experience.rating}</span>
                </div>
                <button className="text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors">
                  Ver más →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperiencesSection;