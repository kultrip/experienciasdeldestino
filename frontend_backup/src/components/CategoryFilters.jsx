import React from 'react';
import { Filter, Gamepad2, Gift, Wine, MapPin, Activity } from 'lucide-react';
import { categories } from '../mock/mockData';
import { Button } from './ui/button';

const CategoryFilters = ({ selectedCategory, setSelectedCategory }) => {
  const getIcon = (iconName) => {
    const icons = {
      Filter: Filter,
      Gamepad2: Gamepad2,
      Gift: Gift,
      Wine: Wine,
      MapPin: MapPin,
      Activity: Activity
    };
    const Icon = icons[iconName] || Filter;
    return <Icon size={18} />;
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              className={`
                flex items-center gap-2 whitespace-nowrap h-10 px-4 rounded-full transition-all
                ${selectedCategory === category.id 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white border-orange-600' 
                  : 'bg-white hover:bg-orange-50 text-gray-700 border-gray-300 hover:border-orange-300'
                }
              `}
            >
              {getIcon(category.icon)}
              <span>{category.name}</span>
              {category.count && (
                <span className={`text-xs ml-1 ${
                  selectedCategory === category.id ? 'text-orange-100' : 'text-gray-500'
                }`}>
                  ({category.count})
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilters;