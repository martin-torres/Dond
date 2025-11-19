import { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { MenuItem, Language, OrderItem } from '../types';
import { t, localizeText } from '../utils/translations';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

type TabType = 'drinks' | 'food';

interface MenuDisplayProps {
  drinks: MenuItem[];
  food: MenuItem[];
  language: Language;
  onPlaceOrder: (items: OrderItem[]) => void;
  isDrinksOnly?: boolean;
  focusItemId?: string;
  onBack?: () => void;
  initialTab?: TabType;
}

export function MenuDisplay({
  drinks,
  food,
  language,
  onPlaceOrder,
  isDrinksOnly = false,
  focusItemId,
  onBack,
  initialTab = 'food',
}: MenuDisplayProps) {
  const [activeTab, setActiveTab] = useState<TabType>(isDrinksOnly ? 'drinks' : initialTab);
  const [cart, setCart] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (!isDrinksOnly) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isDrinksOnly]);

  const items = activeTab === 'drinks' ? drinks : food;

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

  useEffect(() => {
    if (!focusItemId) return;
    const element = document.getElementById(`menu-item-${focusItemId}`);
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.classList.add('ring-2', 'ring-sky-400', 'ring-offset-2', 'ring-offset-blue-50');
    const timeout = window.setTimeout(() => {
      element.classList.remove('ring-2', 'ring-sky-400', 'ring-offset-2', 'ring-offset-blue-50');
    }, 2200);
    return () => {
      window.clearTimeout(timeout);
      element.classList.remove('ring-2', 'ring-sky-400', 'ring-offset-2', 'ring-offset-blue-50');
    };
  }, [focusItemId]);

  const totalItems = Array.from(cart.values()).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Array.from(cart.entries()).reduce((sum, [itemId, qty]) => {
    const item = [...drinks, ...food].find(i => i.id === itemId);
    return sum + (item?.price || 0) * qty;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-32">
      <div className="max-w-4xl mx-auto">
        {onBack && (
          <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center">
            <Button variant="ghost" onClick={onBack} className="text-gray-700">
              {t('back', language)}
            </Button>
          </div>
        )}
        {/* Tabs */}
        {!isDrinksOnly && (
          <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
            <div className="flex">
              <button
                onClick={() => setActiveTab('food')}
                className={`flex-1 py-4 transition-colors ${
                  activeTab === 'food'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                {t('food', language)}
              </button>
              <button
                onClick={() => setActiveTab('drinks')}
                className={`flex-1 py-4 transition-colors ${
                  activeTab === 'drinks'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                {t('drinks', language)}
              </button>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="p-4 space-y-4">
          {items.map((item) => {
            const quantity = cart.get(item.id) || 0;
            const itemName = localizeText(item.name, language);
            const itemDescription = localizeText(item.description, language);
            
            return (
              <Card
                key={item.id}
                id={`menu-item-${item.id}`}
                className={`overflow-hidden transition-shadow ${
                  focusItemId === item.id ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-blue-50 shadow-lg' : ''
                }`}
              >
                <div className="flex gap-4 p-4">
                  <ImageWithFallback
                    src={item.image}
                    alt={itemName}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 mb-1">{itemName}</h3>
                    <p className="text-gray-600 mb-2 line-clamp-2">{itemDescription}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600">${item.price.toFixed(2)}</span>
                      
                      {quantity === 0 ? (
                        <Button
                          onClick={() => addToCart(item.id)}
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          {t('addToOrder', language)}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 bg-blue-100 rounded-lg px-2 py-1">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-7 h-7 flex items-center justify-center bg-white rounded hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-blue-600 min-w-[2rem] text-center">{quantity}</span>
                          <button
                            onClick={() => addToCart(item.id)}
                            className="w-7 h-7 flex items-center justify-center bg-white rounded hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
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
                  <span className="text-gray-900">
                    {totalItems} {totalItems === 1 ? t('item', language) : t('items', language)}
                  </span>
                </div>
                <span className="text-gray-900">${totalPrice.toFixed(2)}</span>
              </div>
              <Button onClick={handlePlaceOrder} className="w-full" size="lg">
                {t('placeOrder', language)}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
