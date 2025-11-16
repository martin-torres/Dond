import { Clock, MapPin, Phone } from 'lucide-react';
import { Restaurant, Language } from '../types/restaurant';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface RestaurantInfoProps {
  restaurant: Restaurant;
  language: Language;
  onContinue: () => void;
}

export function RestaurantInfo({ restaurant, language, onContinue }: RestaurantInfoProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Restaurant Image */}
        <Card className="overflow-hidden">
          <div className="aspect-video bg-gray-200">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          </div>
        </Card>

        {/* Restaurant Details */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('welcomeTo', language)}</h1>
              <h2 className="text-2xl font-semibold text-blue-600 mb-3">{restaurant.name}</h2>
              <p className="text-gray-600 leading-relaxed">
                {restaurant.description[language]}
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-3 text-gray-600">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="text-sm">{restaurant.address}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <Phone className="w-5 h-5 text-blue-600" />
                <span className="text-sm">{restaurant.phone}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm">
                  {t('estimatedWait', language)}: {restaurant.waitTime} {t('minutes', language)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Continue Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
          <div className="max-w-2xl mx-auto">
            <Button 
              onClick={onContinue}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              size="lg"
            >
              {t('continue', language)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}