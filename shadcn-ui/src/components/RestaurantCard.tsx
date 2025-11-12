import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, MapPin } from 'lucide-react';
import { Restaurant } from '@/data/mockData';
import { useLanguage } from '@/hooks/useLanguage';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onSelect: (restaurant: Restaurant) => void;
}

export default function RestaurantCard({ restaurant, onSelect }: RestaurantCardProps) {
  const { t } = useLanguage();

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 w-full"
      onClick={() => onSelect(restaurant)}
    >
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="w-full sm:w-32 h-32 sm:h-24 flex-shrink-0">
            <img 
              src={restaurant.image} 
              alt={restaurant.name}
              className="w-full h-full object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"
            />
          </div>
          
          {/* Content */}
          <div className="flex-1 p-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1 line-clamp-1">
                  {restaurant.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{restaurant.cuisine}</p>
              </div>
              <Badge variant="secondary" className="self-start flex-shrink-0">
                {restaurant.priceRange}
              </Badge>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-medium">{restaurant.rating}</span>
              </div>
              
              <div className="flex items-center gap-1 text-blue-600">
                <Clock className="w-4 h-4" />
                <span>{restaurant.waitTime} {t('minutes')}</span>
              </div>
              
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{restaurant.distance}km {t('away')}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}