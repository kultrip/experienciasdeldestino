import React from 'react';
import { MapPin } from 'lucide-react';
import { featuredDestinations } from '../mock/mockData';

const DestinationCards = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Destinos Destacados</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredDestinations.map((destination) => (
          <div
            key={destination.id}
            className="group relative h-64 rounded-xl overflow-hidden cursor-pointer shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105"
          >
            <img
              src={destination.image}
              alt={destination.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center gap-1 text-orange-400 text-sm mb-2">
                <MapPin size={14} />
                <span className="font-medium">{destination.location}</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">{destination.name}</h3>
              <p className="text-sm text-gray-200">{destination.experiences} experiencias</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DestinationCards;