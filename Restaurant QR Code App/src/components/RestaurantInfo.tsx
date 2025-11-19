import { MapPin, Clock, Users, Tag } from 'lucide-react';
import { Restaurant, Language } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface RestaurantInfoProps {
  restaurant: Restaurant;
  language: Language;
  onContinue: () => void;
}

export function RestaurantInfo({ restaurant, language, onContinue }: RestaurantInfoProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Restaurant Header */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-gray-900 mb-2">{restaurant.name}</h1>
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{restaurant.address}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-gray-900">{t('hours', language)}</p>
                  <p className="text-gray-600">
                    {restaurant.hours.open} - {restaurant.hours.close}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-gray-900">{t('waitTime', language)}</p>
                  <p className="text-gray-600">
                    {restaurant.waitTime} {t('minutes', language)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t">
              <MapPin className="w-5 h-5 text-green-600" />
              <p className="text-gray-600">
                {t('distance', language)}: {restaurant.distance} {t('meters', language)}
              </p>
            </div>
          </div>
        </Card>

        {/* Promotions */}
        {restaurant.promos.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-orange-600" />
              <h2 className="text-gray-900">{t('todaysPromos', language)}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {restaurant.promos.map((promo) => (
                <Card
                  key={promo.id}
                  className="overflow-hidden border-2 border-orange-200 hover:border-orange-400 transition-all hover:shadow-lg"
                >
                  {promo.imageUrl && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <ImageWithFallback
                        src={promo.imageUrl}
                        alt={promo.title[language]}
                        className="w-full h-full object-cover"
                      />
                      {promo.discount > 0 && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-orange-600 text-white text-lg px-4 py-2 shadow-lg">
                            {promo.discount}% {t('off', language)}
                          </Badge>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="mb-1">{promo.title[language]}</h3>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    {!promo.imageUrl && (
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="text-gray-900">{promo.title[language]}</h3>
                        {promo.discount > 0 && (
                          <Badge className="bg-orange-600 text-white flex-shrink-0">
                            {promo.discount}% {t('off', language)}
                          </Badge>
                        )}
                      </div>
                    )}
                    <p className="text-gray-600">{promo.description[language]}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Fixed bottom button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
          <div className="max-w-2xl mx-auto">
            <Button onClick={onContinue} className="w-full" size="lg">
              {t('viewMenu', language)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}