import React from 'react';
import { Sunset, UtensilsCrossed, BookOpen, Mountain, Landmark, Compass } from 'lucide-react';
import { popularCategories } from '../mock/mockData';

const PopularCategories = () => {
  const getIcon = (iconName) => {
    const icons = {
      Sunset: Sunset,
      UtensilsCrossed: UtensilsCrossed,
      BookOpen: BookOpen,
      Mountain: Mountain,
      Landmark: Landmark,
      Compass: Compass
    };
    const Icon = icons[iconName] || Compass;
    return <Icon size={32} />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Categorías Populares</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {popularCategories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-xl p-6 text-center cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
              {getIcon(category.icon)}
            </div>
            <p className="text-sm font-medium text-gray-700">{category.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularCategories;