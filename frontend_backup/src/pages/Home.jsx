import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Search, Users } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import SearchBar from '../components/SearchBar';
import CategoryFilters from '../components/CategoryFilters';
import DestinationCards from '../components/DestinationCards';
import PopularCategories from '../components/PopularCategories';
import HelpSection from '../components/HelpSection';
import ExperiencesSection from '../components/ExperiencesSection';
import { provinces } from '../mock/mockData';

const Home = () => {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen">
      <HeroSection 
        selectedProvince={selectedProvince}
        setSelectedProvince={setSelectedProvince}
      />
      
      <SearchBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedProvince={selectedProvince}
        setSelectedProvince={setSelectedProvince}
      />
      
      <CategoryFilters 
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      
      <div className="bg-gray-50">
        <DestinationCards />
        <PopularCategories />
        <ExperiencesSection />
      </div>
      
      <HelpSection />
    </div>
  );
};

export default Home;