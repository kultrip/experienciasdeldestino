import React from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { provinces } from '../mock/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const HeroSection = ({ selectedProvince, setSelectedProvince }) => {
  return (
    <div 
      className="relative h-[600px] flex items-center justify-center"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1659003608484-dae8f0a45a14?w=1920)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-900/40 via-orange-800/50 to-orange-900/60"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-6xl font-bold mb-4 tracking-tight">
          Experiencias del Destino
        </h1>
        <p className="text-2xl mb-2 font-light">Plus</p>
        <p className="text-xl mb-8">Descubre experiencias únicas en toda España</p>
        
        <div className="mt-12">
          <p className="text-lg mb-4">Selecciona tu provincia para comenzar</p>
          <div className="max-w-md mx-auto">
            <Select value={selectedProvince} onValueChange={setSelectedProvince}>
              <SelectTrigger className="w-full h-14 bg-white text-gray-900 text-lg border-none shadow-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="text-orange-600" size={20} />
                  <SelectValue placeholder="Selecciona una provincia" />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {provinces.map((province) => (
                  <SelectItem key={province} value={province} className="text-base">
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;