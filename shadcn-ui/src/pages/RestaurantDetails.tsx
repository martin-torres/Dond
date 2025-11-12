import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Star, MapPin, Phone } from 'lucide-react';
import TableLayout from '@/components/TableLayout';
import { Restaurant, Table } from '@/data/mockData';
import { useLanguage } from '@/hooks/useLanguage';

export default function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    const savedRestaurant = localStorage.getItem('selectedRestaurant');
    if (savedRestaurant) {
      setRestaurant(JSON.parse(savedRestaurant));
    }
  }, []);

  const handleTableSelect = (table: Table) => {
    localStorage.setItem('selectedTable', JSON.stringify(table));
    navigate(`/reservation/${restaurant?.id}`);
  };

  const handleViewMenu = () => {
    navigate(`/menu/${restaurant?.id}`);
  };

  const handleBarTab = () => {
    navigate(`/bar-tab/${restaurant?.id}`);
  };

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Restaurant not found</h2>
          <Button onClick={() => navigate('/restaurants')}>
            Back to Restaurants
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="w-full max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/restaurants')}
              className="flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              {restaurant.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Restaurant Image */}
        <div className="aspect-video rounded-lg overflow-hidden">
          <img 
            src={restaurant.image} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Restaurant Info */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{restaurant.name}</h2>
                <p className="text-gray-600">{restaurant.cuisine}</p>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1 self-start">
                {restaurant.priceRange}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                  <span className="font-semibold text-sm sm:text-base">{restaurant.rating}</span>
                </div>
                <p className="text-xs text-gray-500">{t('rating')}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-semibold text-sm sm:text-base">{restaurant.waitTime}m</span>
                </div>
                <p className="text-xs text-gray-500">{t('waitTime')}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-semibold text-sm sm:text-base">{restaurant.distance}km</span>
                </div>
                <p className="text-xs text-gray-500">{t('distance')}</p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="break-words">{restaurant.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{restaurant.phone}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button onClick={handleViewMenu} className="h-12 w-full">
            {t('viewMenu')}
          </Button>
          <Button onClick={handleBarTab} variant="outline" className="h-12 w-full">
            {t('barMenu')}
          </Button>
        </div>

        {/* Table Layout */}
        <div className="w-full">
          <TableLayout 
            tables={restaurant.tables} 
            onTableSelect={handleTableSelect}
          />
        </div>
      </div>
    </div>
  );
}