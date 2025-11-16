import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Clock, MapPin } from 'lucide-react';
import { mockRestaurants } from '../data/mockData';
import { useTranslation } from '../lib/translations';

interface RestaurantListProps {
  language: string;
}

const RestaurantList: React.FC<RestaurantListProps> = ({ language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const t = useTranslation(language);

  const filteredRestaurants = mockRestaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{t.nearbyRestaurants}</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t.searchRestaurants}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Restaurant List */}
      <div className="px-4 py-6 space-y-4">
        {filteredRestaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/restaurant/${restaurant.id}`)}
          >
            <div className="aspect-video bg-gray-200 relative">
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  restaurant.isOpen 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {restaurant.isOpen ? t.openNow : t.closed}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{restaurant.name}</h3>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">{restaurant.rating}</span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{restaurant.cuisine}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{restaurant.waitTime} {t.minutes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate max-w-32">{restaurant.address.split(',')[0]}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/menu/${restaurant.id}`);
                    }}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    {t.viewMenu}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/reservation/${restaurant.id}`);
                    }}
                    className="px-3 py-1 bg-green-100 text-green-600 rounded-md text-sm font-medium hover:bg-green-200 transition-colors"
                  >
                    {t.makeReservation}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantList;