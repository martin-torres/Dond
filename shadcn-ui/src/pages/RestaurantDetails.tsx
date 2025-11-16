import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Phone, MapPin, Users } from 'lucide-react';
import { mockRestaurants } from '../data/mockData';
import { useTranslation } from '../lib/translations';

interface RestaurantDetailsProps {
  language: string;
}

const RestaurantDetails: React.FC<RestaurantDetailsProps> = ({ language }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('about');
  const t = useTranslation(language);

  const restaurant = mockRestaurants.find(r => r.id === id);

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{t.error}</h2>
          <button
            onClick={() => navigate('/restaurants')}
            className="text-blue-600 hover:text-blue-800"
          >
            {t.back}
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'about', label: t.about },
    { id: 'menu', label: t.menu },
    { id: 'reservations', label: t.reservations },
    { id: 'contact', label: t.contact }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative">
        <div className="aspect-video bg-gray-200">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <button
          onClick={() => navigate('/restaurants')}
          className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            restaurant.isOpen 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {restaurant.isOpen ? t.openNow : t.closed}
          </span>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="bg-white px-4 py-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{restaurant.name}</h1>
            <p className="text-gray-600">{restaurant.cuisine}</p>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="text-lg font-semibold text-gray-800">{restaurant.rating}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{t.waitTime}: {restaurant.waitTime} {t.minutes}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{t.rating}: {restaurant.rating}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/reservation/${restaurant.id}`)}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {t.makeReservation}
          </button>
          <button
            onClick={() => navigate(`/menu/${restaurant.id}`)}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            {t.viewMenu}
          </button>
          <button
            onClick={() => navigate(`/waitlist/${restaurant.id}`)}
            className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            {t.joinWaitlist}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white px-4 py-6">
        {activeTab === 'about' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">{t.about}</h3>
            <p className="text-gray-600 leading-relaxed">{restaurant.description}</p>
          </div>
        )}

        {activeTab === 'menu' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">{t.menu}</h3>
            <button
              onClick={() => navigate(`/menu/${restaurant.id}`)}
              className="w-full bg-blue-50 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-100 transition-colors"
            >
              {t.viewMenu}
            </button>
          </div>
        )}

        {activeTab === 'reservations' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">{t.reservations}</h3>
            <button
              onClick={() => navigate(`/reservation/${restaurant.id}`)}
              className="w-full bg-green-50 text-green-600 py-3 rounded-lg font-medium hover:bg-green-100 transition-colors"
            >
              {t.makeReservation}
            </button>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">{t.contact}</h3>
            
            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">{t.phone}</p>
                <p className="text-gray-800">{restaurant.phone}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">{t.address}</p>
                <p className="text-gray-800">{restaurant.address}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">{t.hours}</p>
                <p className="text-gray-800">{restaurant.hours}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetails;