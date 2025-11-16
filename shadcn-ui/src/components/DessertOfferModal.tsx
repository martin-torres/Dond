import { useState } from 'react';
import { Star, Clock, AlertTriangle, Plus, Minus } from 'lucide-react';
import { MenuItem, Language, OrderItem } from '../types/restaurant';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface DessertOfferModalProps {
  language: Language;
  desserts: MenuItem[];
  onResponse: (wantsDessert: boolean, dessertOrders?: OrderItem[]) => void;
}

export function DessertOfferModal({ language, desserts, onResponse }: DessertOfferModalProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [dessertQuantities, setDessertQuantities] = useState<Map<string, number>>(new Map());

  const handleResponse = (wantsDessert: boolean) => {
    setIsVisible(false);
    
    if (wantsDessert && dessertQuantities.size > 0) {
      const dessertOrders: OrderItem[] = [];
      dessertQuantities.forEach((quantity, dessertId) => {
        const dessert = desserts.find(d => d.id === dessertId);
        if (dessert && quantity > 0) {
          dessertOrders.push({ menuItem: dessert, quantity });
        }
      });
      setTimeout(() => onResponse(true, dessertOrders), 300);
    } else {
      setTimeout(() => onResponse(false), 300);
    }
  };

  const updateQuantity = (dessertId: string, change: number) => {
    setDessertQuantities(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(dessertId) || 0;
      const newQuantity = Math.max(0, current + change);
      
      if (newQuantity === 0) {
        newMap.delete(dessertId);
      } else {
        newMap.set(dessertId, newQuantity);
      }
      
      return newMap;
    });
  };

  const getText = (key: string) => {
    const texts = {
      en: {
        title: "Before You Order...",
        subtitle: "Delicious Desserts Always Sell Out!",
        message: "Would you like to order yours now?",
        remaining: "slices remaining",
        orderNow: "Add to My Order",
        skipDesserts: "Skip Desserts, Order Food & Drinks",
        confirmOrder: "Confirm Dessert Order",
        total: "Total"
      },
      es: {
        title: "Antes de Ordenar...",
        subtitle: "¡Los Postres Están Deliciosos y Siempre Se Nos Acaban!",
        message: "¿Quieres pedir el tuyo ahora?",
        remaining: "rebanadas restantes",
        orderNow: "Agregar a Mi Orden",
        skipDesserts: "Omitir Postres, Ordenar Bebidas y Comida",
        confirmOrder: "Confirmar Orden de Postres",
        total: "Total"
      }
    };
    return texts[language as keyof typeof texts]?.[key as keyof typeof texts['en']] || texts.en[key as keyof typeof texts['en']];
  };

  const totalAmount = Array.from(dessertQuantities.entries()).reduce((sum, [dessertId, quantity]) => {
    const dessert = desserts.find(d => d.id === dessertId);
    return sum + (dessert?.price || 0) * quantity;
  }, 0);

  const hasSelectedDesserts = dessertQuantities.size > 0;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
      <Card className={`max-w-sm w-full bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 transform transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <div className="p-4 text-center">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-gray-900">{getText('title')}</h2>
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-2 rounded-full inline-block mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium text-sm">{getText('subtitle')}</span>
              </div>
            </div>
            <p className="text-gray-700 text-sm">
              {getText('message')}
            </p>
          </div>

          {/* Dessert Selection */}
          <div className="space-y-3 mb-4">
            {desserts.map((dessert) => {
              const quantity = dessertQuantities.get(dessert.id) || 0;
              const remainingSlices = dessert.id === 'dessert-1' ? 4 : 6; // Mock remaining count
              
              return (
                <div key={dessert.id} className="bg-white rounded-lg p-3 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex-shrink-0 overflow-hidden">
                      <img
                        src={dessert.image}
                        alt={dessert.name[language]}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-medium text-gray-900 text-sm leading-tight">{dessert.name[language]}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">{dessert.description[language]}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-amber-600 text-sm">${dessert.price}</span>
                          <p className="text-xs text-red-600 font-medium">
                            {remainingSlices} {getText('remaining')}
                          </p>
                        </div>
                        
                        {quantity === 0 ? (
                          <Button
                            onClick={() => updateQuantity(dessert.id, 1)}
                            size="sm"
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs px-2 py-1 h-7"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            {getText('orderNow')}
                          </Button>
                        ) : (
                          <div className="flex items-center gap-1 bg-amber-100 rounded-lg px-2 py-1">
                            <button
                              onClick={() => updateQuantity(dessert.id, -1)}
                              className="w-6 h-6 flex items-center justify-center bg-white rounded-full hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="w-3 h-3 text-amber-600" />
                            </button>
                            <span className="text-amber-600 font-medium text-sm min-w-[1.5rem] text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(dessert.id, 1)}
                              className="w-6 h-6 flex items-center justify-center bg-white rounded-full hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="w-3 h-3 text-amber-600" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          {hasSelectedDesserts && (
            <div className="bg-amber-100 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-amber-800">{getText('total')}:</span>
                <span className="font-bold text-amber-800 text-lg">${totalAmount}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {hasSelectedDesserts && (
              <Button
                onClick={() => handleResponse(true)}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium text-sm"
                size="lg"
              >
                <Star className="w-4 h-4 mr-2" />
                {getText('confirmOrder')} (${totalAmount})
              </Button>
            )}
            <Button
              onClick={() => handleResponse(false)}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
            >
              {getText('skipDesserts')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}