import React from 'react';
import { Search, MapPin, Users } from 'lucide-react';
import { provinces } from '../mock/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Input } from './ui/input';

const SearchBar = ({ searchQuery, setSearchQuery, selectedProvince, setSelectedProvince }) => {
  return (
    <div className="bg-white shadow-md sticky top-20 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          {/* Search input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="¿Qué experiencia buscas?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base border-gray-300"
            />
          </div>
          
          {/* Province selector */}
          <Select value={selectedProvince} onValueChange={setSelectedProvince}>
            <SelectTrigger className="w-64 h-12 border-gray-300">
              <div className="flex items-center gap-2">
                <MapPin className="text-gray-500" size={18} />
                <SelectValue placeholder="Todas las provincias" />
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-80">
              <SelectItem value="all">Todas las provincias</SelectItem>
              {provinces.map((province) => (
                <SelectItem key={province} value={province}>
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Precio button */}
          <Button variant="outline" className="h-12 px-6 border-gray-300">
            Precio
          </Button>
          
          {/* Grupo button */}
          <Button variant="outline" className="h-12 px-6 border-gray-300">
            <Users size={18} className="mr-2" />
            Grupo
          </Button>
          
          {/* Search button */}
          <Button className="h-12 px-8 bg-orange-600 hover:bg-orange-700 text-white">
            Buscar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;