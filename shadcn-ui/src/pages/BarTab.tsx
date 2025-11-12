import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Minus, Wine } from 'lucide-react';
import { Restaurant, OrderItem } from '@/data/mockData';
import { useLanguage } from '@/hooks/useLanguage';

interface BarMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface BarMenuCategory {
  id: string;
  name: string;
  items: BarMenuItem[];
}

const barMenu: BarMenuCategory[] = [
  {
    id: 'cocktails',
    name: 'Cocktails',
    items: [
      { id: 'mojito', name: 'Mojito', description: 'Rum, mint, lime, soda water', price: 12.99 },
      { id: 'margarita', name: 'Margarita', description: 'Tequila, lime juice, triple sec', price: 13.99 },
      { id: 'old-fashioned', name: 'Old Fashioned', description: 'Whiskey, bitters, sugar, orange', price: 14.99 }
    ]
  },
  {
    id: 'wine',
    name: 'Wine',
    items: [
      { id: 'red-wine', name: 'House Red Wine', description: 'Glass of our signature red blend', price: 9.99 },
      { id: 'white-wine', name: 'House White Wine', description: 'Glass of crisp white wine', price: 9.99 },
      { id: 'prosecco', name: 'Prosecco', description: 'Glass of Italian sparkling wine', price: 11.99 }
    ]
  },
  {
    id: 'beer',
    name: 'Beer',
    items: [
      { id: 'craft-beer', name: 'Local Craft Beer', description: 'Rotating selection of local brews', price: 6.99 },
      { id: 'imported-beer', name: 'Imported Beer', description: 'Premium imported lager', price: 7.99 }
    ]
  }
];

export default function BarTab() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [barOrder, setBarOrder] = useState<OrderItem[]>([]);
  const [barTotal, setBarTotal] = useState(0);

  useEffect(() => {
    const savedRestaurant = localStorage.getItem('selectedRestaurant');
    if (savedRestaurant) {
      setRestaurant(JSON.parse(savedRestaurant));
    }
  }, []);

  useEffect(() => {
    const total = barOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setBarTotal(total);
  }, [barOrder]);

  const addToBarOrder = (menuItem: BarMenuItem) => {
    setBarOrder(prev => {
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

  const removeFromBarOrder = (menuItemId: string) => {
    setBarOrder(prev => {
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
    const item = barOrder.find(item => item.menuItemId === menuItemId);
    return item ? item.quantity : 0;
  };

  const handleTabCheckout = () => {
    localStorage.setItem('currentOrder', JSON.stringify(barOrder));
    localStorage.setItem('orderTotal', barTotal.toString());
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
            <Wine className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              {t('barMenu')} - {restaurant.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Early Arrival Perks</h3>
          <p className="text-sm text-blue-700">
            Your table will be ready soon! Enjoy drinks at the bar while you wait. 
            Your bar tab will be added to your final bill.
          </p>
        </div>

        {barMenu.map((category) => (
          <div key={category.id} className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{category.name}</h2>
            <div className="space-y-4">
              {category.items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <span className="font-bold text-purple-600">${item.price}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    
                    {getItemQuantity(item.id) > 0 ? (
                      <div className="flex items-center gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromBarOrder(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-semibold min-w-[2rem] text-center">
                          {getItemQuantity(item.id)}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => addToBarOrder(item)}
                          className="h-8 w-8 p-0 bg-purple-600 hover:bg-purple-700"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => addToBarOrder(item)}
                        className="h-8 bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('addToTab')}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bar Tab Summary - Fixed Bottom */}
      {barOrder.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="max-w-md mx-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wine className="w-5 h-5 text-purple-600" />
                <span className="font-semibold">{t('currentTab')}</span>
              </div>
              <span className="font-bold text-lg">${barTotal.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                className="h-12"
              >
                Continue to Table
              </Button>
              <Button onClick={handleTabCheckout} className="h-12 bg-purple-600 hover:bg-purple-700">
                Pay Tab Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}