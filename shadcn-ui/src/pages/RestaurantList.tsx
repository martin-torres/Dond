import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import RestaurantCard from '@/components/RestaurantCard';
import LocationPicker from '@/components/LocationPicker';
import { mockRestaurants, Restaurant } from '@/data/mockData';
import { useLanguage } from '@/hooks/useLanguage';

export default function RestaurantList() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [currentLocation, setCurrentLocation] = useState('Current Location');

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    localStorage.setItem('selectedRestaurant', JSON.stringify(restaurant));
    navigate(`/restaurant/${restaurant.id}`);
  };

  const handleLocationChange = (address: string) => {
    setCurrentLocation(address);
    // In a real app, this would filter restaurants based on location
    setRestaurants(mockRestaurants);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="w-full max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/')}
              className="flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              {t('nearbyRestaurants')}
            </h1>
          </div>
          
          <div className="w-full">
            <LocationPicker onLocationChange={handleLocationChange} />
          </div>
        </div>
      </div>

      {/* Restaurant List */}
      <div className="w-full max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onSelect={handleRestaurantSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}