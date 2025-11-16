import { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart, Star, ArrowLeft } from 'lucide-react';
import { MenuItem, Language, OrderItem } from '../types/restaurant';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface MenuDisplayProps {
  drinks: MenuItem[];
  food: MenuItem[];
  language: Language;
  onPlaceOrder: (items: OrderItem[]) => void;
  isDrinksOnly?: boolean;
  isDessertsOnly?: boolean;
}

export function MenuDisplay({ 
  drinks, 
  food, 
  language, 
  onPlaceOrder, 
  isDrinksOnly = false,
  isDessertsOnly = false 
}: MenuDisplayProps) {
  const [activeTab, setActiveTab] = useState<'desserts' | 'food' | 'drinks'>('drinks');
  const [cart, setCart] = useState<Map<string, number>>(new Map());

  // Separate desserts from other food items
  const desserts = food.filter(item => item.category === 'Desserts');
  const mainFood = food.filter(item => item.category !== 'Desserts');

  // Set initial tab based on mode
  useEffect(() => {
    if (isDrinksOnly) {
      setActiveTab('drinks');
    } else if (isDessertsOnly) {
      setActiveTab('desserts');
    } else {
      setActiveTab('drinks'); // Default to drinks for regular food ordering
    }
  }, [isDrinksOnly, isDessertsOnly]);

  const getCurrentItems = () => {
    if (activeTab === 'drinks') return drinks;
    if (activeTab === 'desserts') return desserts;
    return mainFood;
  };

  const items = getCurrentItems();

  const addToCart = (itemId: string) => {
    setCart(prev => {
      const newCart = new Map(prev);
      newCart.set(itemId, (newCart.get(itemId) || 0) + 1);
      return newCart;
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = new Map(prev);
      const current = newCart.get(itemId) || 0;
      if (current > 1) {
        newCart.set(itemId, current - 1);
      } else {
        newCart.delete(itemId);
      }
      return newCart;
    });
  };

  const handlePlaceOrder = () => {
    const orderItems: OrderItem[] = [];
    const allItems = [...drinks, ...food];
    
    cart.forEach((quantity, itemId) => {
      const menuItem = allItems.find(i => i.id === itemId);
      if (menuItem) {
        orderItems.push({ menuItem, quantity });
      }
    });

    onPlaceOrder(orderItems);
  };

  const totalItems = Array.from(cart.values()).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Array.from(cart.entries()).reduce((sum, [itemId, qty]) => {
    const item = [...drinks, ...food].find(i => i.id === itemId);
    return sum + (item?.price || 0) * qty;
  }, 0);

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const getHeaderTitle = () => {
    if (isDrinksOnly) {
      return language === 'es' ? 'Bebidas Mientras Esperas' : 'Drinks While You Wait';
    }
    if (isDessertsOnly) {
      return language === 'es' ? 'Postres Exclusivos' : 'Exclusive Desserts';
    }
    return language === 'es' ? 'Menú Principal' : 'Main Menu';
  };

  const getHeaderSubtitle = () => {
    if (isDrinksOnly) {
      return language === 'es' ? 'Disfruta mientras esperas tu mesa' : 'Enjoy while waiting for your table';
    }
    if (isDessertsOnly) {
      return language === 'es' ? 'Disponibilidad muy limitada - ¡ordena ahora!' : 'Very limited availability - order now!';
    }
    return language === 'es' ? 'Bebidas y comida' : 'Drinks and food';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-32">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`${
          isDessertsOnly ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-blue-600 to-purple-600'
        } text-white p-6 text-center`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            {isDessertsOnly && <Star className="w-6 h-6" />}
            <h1 className="text-2xl font-bold">{getHeaderTitle()}</h1>
            {isDessertsOnly && <Star className="w-6 h-6" />}
          </div>
          <p className="text-sm opacity-90">{getHeaderSubtitle()}</p>
          {isDessertsOnly && (
            <div className="mt-3 bg-white/20 rounded-lg p-2">
              <p className="text-xs font-medium">
                {language === 'es' 
                  ? '⚠️ Solo quedan pocas porciones disponibles hoy'
                  : '⚠️ Only a few portions available today'
                }
              </p>
            </div>
          )}
        </div>

        {/* Tabs - only show if not in single mode */}
        {!isDrinksOnly && !isDessertsOnly && (
          <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
            <div className="flex">
              <button
                onClick={() => setActiveTab('drinks')}
                className={`flex-1 py-4 font-medium transition-colors ${
                  activeTab === 'drinks'
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {t('drinks', language)}
              </button>
              <button
                onClick={() => setActiveTab('food')}
                className={`flex-1 py-4 font-medium transition-colors ${
                  activeTab === 'food'
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {t('food', language)}
              </button>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="p-4 space-y-4">
          {items.map((item) => {
            const quantity = cart.get(item.id) || 0;
            
            return (
              <Card key={item.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${
                isDessertsOnly ? 'border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50' : ''
              }`}>
                <div className="flex gap-4 p-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name[language]}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">{item.name[language]}</h3>
                      {isDessertsOnly && (
                        <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-100">
                          <Star className="w-3 h-3 mr-1" />
                          {language === 'es' ? 'Limitado' : 'Limited'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description[language]}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-lg font-bold ${
                        isDessertsOnly ? 'text-amber-600' : 'text-blue-600'
                      }`}>
                        {formatPrice(item.price)}
                      </span>
                      
                      {quantity === 0 ? (
                        <Button
                          onClick={() => addToCart(item.id)}
                          size="sm"
                          className={`${
                            isDessertsOnly 
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' 
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                          } text-white`}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          {t('addToOrder', language)}
                        </Button>
                      ) : (
                        <div className={`flex items-center gap-2 ${
                          isDessertsOnly ? 'bg-amber-100' : 'bg-blue-100'
                        } rounded-lg px-3 py-2`}>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-full hover:bg-gray-100 transition-colors shadow-sm"
                          >
                            <Minus className={`w-4 h-4 ${
                              isDessertsOnly ? 'text-amber-600' : 'text-blue-600'
                            }`} />
                          </button>
                          <span className={`${
                            isDessertsOnly ? 'text-amber-600' : 'text-blue-600'
                          } font-medium min-w-[2rem] text-center`}>
                            {quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item.id)}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-full hover:bg-gray-100 transition-colors shadow-sm"
                          >
                            <Plus className={`w-4 h-4 ${
                              isDessertsOnly ? 'text-amber-600' : 'text-blue-600'
                            }`} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Fixed bottom cart */}
        {totalItems > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
            <div className="max-w-4xl mx-auto p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">
                    {totalItems} {totalItems === 1 ? t('item', language) : t('items', language)}
                  </span>
                </div>
                <span className="text-xl font-bold text-gray-900">{formatPrice(totalPrice)}</span>
              </div>
              <Button 
                onClick={handlePlaceOrder} 
                className={`w-full ${
                  isDessertsOnly 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                } text-white`}
                size="lg"
              >
                {isDessertsOnly ? (
                  <>
                    <Star className="w-4 h-4 mr-2" />
                    {language === 'es' ? 'Confirmar Postres' : 'Confirm Desserts'}
                  </>
                ) : (
                  t('placeOrder', language)
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}