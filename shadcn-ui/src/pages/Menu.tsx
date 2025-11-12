import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Restaurant, MenuItem, OrderItem } from '@/data/mockData';
import { useLanguage } from '@/hooks/useLanguage';

export default function Menu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);

  useEffect(() => {
    const savedRestaurant = localStorage.getItem('selectedRestaurant');
    if (savedRestaurant) {
      setRestaurant(JSON.parse(savedRestaurant));
    }
  }, []);

  useEffect(() => {
    const total = order.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setOrderTotal(total);
  }, [order]);

  const addToOrder = (menuItem: MenuItem) => {
    setOrder(prev => {
      const existingItem = prev.find(item => item.menuItemId === menuItem.id);
      if (existingItem) {
        return prev.map(item =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, {
          menuItemId: menuItem.id,
          quantity: 1,
          price: menuItem.price
        }];
      }
    });
  };

  const removeFromOrder = (menuItemId: string) => {
    setOrder(prev => {
      const existingItem = prev.find(item => item.menuItemId === menuItemId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(item =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prev.filter(item => item.menuItemId !== menuItemId);
      }
    });
  };

  const getItemQuantity = (menuItemId: string) => {
    const item = order.find(item => item.menuItemId === menuItemId);
    return item ? item.quantity : 0;
  };

  const handleCheckout = () => {
    localStorage.setItem('currentOrder', JSON.stringify(order));
    localStorage.setItem('orderTotal', orderTotal.toString());
    navigate(`/payment/${restaurant?.id}`);
  };

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(`/restaurant/${restaurant.id}`)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              {t('menu')} - {restaurant.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {restaurant.menu.map((category) => (
          <div key={category.id} className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{category.name}</h2>
            <div className="space-y-4">
              {category.items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      {item.image && (
                        <div className="w-24 h-24 flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <span className="font-bold text-green-600">${item.price}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                        
                        {getItemQuantity(item.id) > 0 ? (
                          <div className="flex items-center gap-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromOrder(item.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="font-semibold min-w-[2rem] text-center">
                              {getItemQuantity(item.id)}
                            </span>
                            <Button
                              size="sm"
                              onClick={() => addToOrder(item)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => addToOrder(item)}
                            className="h-8"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            {t('addToOrder')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary - Fixed Bottom */}
      {order.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="max-w-md mx-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">{t('currentOrder')}</span>
              </div>
              <span className="font-bold text-lg">${orderTotal.toFixed(2)}</span>
            </div>
            <Button onClick={handleCheckout} className="w-full h-12">
              {t('continue')} ({order.reduce((sum, item) => sum + item.quantity, 0)} items)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}