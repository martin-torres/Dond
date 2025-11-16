import { useState } from 'react';
import { Star, Clock, AlertTriangle } from 'lucide-react';
import { MenuItem, Language } from '../types/restaurant';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface DessertOfferModalProps {
  language: Language;
  desserts: MenuItem[];
  onResponse: (wantsDessert: boolean) => void;
}

export function DessertOfferModal({ language, desserts, onResponse }: DessertOfferModalProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleResponse = (wantsDessert: boolean) => {
    setIsVisible(false);
    setTimeout(() => onResponse(wantsDessert), 300);
  };

  const getText = (key: string) => {
    const texts = {
      en: {
        title: "Before You Order...",
        subtitle: "Limited Desserts Available!",
        message: "We have exclusive desserts with very limited availability each day. Would you like to secure yours now before ordering food?",
        featured: "Today's Featured Desserts:",
        orderNow: "Yes, Order Desserts First",
        skipDesserts: "Skip Desserts, Order Food",
        limitedAvailability: "Limited Availability",
        lastChance: "Last chance to order - these sell out quickly!"
      },
      es: {
        title: "Antes de Ordenar...",
        subtitle: "¡Postres Limitados Disponibles!",
        message: "Tenemos postres exclusivos con disponibilidad muy limitada cada día. ¿Te gustaría asegurar el tuyo ahora antes de ordenar comida?",
        featured: "Postres Destacados de Hoy:",
        orderNow: "Sí, Ordenar Postres Primero",
        skipDesserts: "Omitir Postres, Ordenar Comida",
        limitedAvailability: "Disponibilidad Limitada",
        lastChance: "¡Última oportunidad de ordenar - se agotan rápidamente!"
      }
    };
    return texts[language as keyof typeof texts]?.[key as keyof typeof texts['en']] || texts.en[key as keyof typeof texts['en']];
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={`max-w-md w-full bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 transform transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <div className="p-6 text-center">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-bold text-gray-900">{getText('title')}</h2>
              <Star className="w-6 h-6 text-amber-500" />
            </div>
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full inline-block mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium text-sm">{getText('subtitle')}</span>
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {getText('message')}
            </p>
          </div>

          {/* Featured Desserts */}
          <div className="mb-6">
            <h3 className="font-semibold text-amber-800 mb-3 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              {getText('featured')}
            </h3>
            <div className="space-y-3">
              {desserts.slice(0, 2).map((dessert) => (
                <div key={dessert.id} className="bg-white rounded-lg p-3 border border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex-shrink-0 overflow-hidden">
                      <img
                        src={dessert.image}
                        alt={dessert.name[language]}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-medium text-gray-900 text-sm">{dessert.name[language]}</h4>
                      <p className="text-xs text-gray-600 line-clamp-1">{dessert.description[language]}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-bold text-amber-600">${dessert.price}</span>
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          {getText('limitedAvailability')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-red-800 text-xs font-medium">
              {getText('lastChance')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => handleResponse(true)}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium"
              size="lg"
            >
              <Star className="w-4 h-4 mr-2" />
              {getText('orderNow')}
            </Button>
            <Button
              onClick={() => handleResponse(false)}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {getText('skipDesserts')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}