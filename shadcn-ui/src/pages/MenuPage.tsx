import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, ShoppingCart } from 'lucide-react';
import { mockRestaurants, mockMenuItems, MenuItem } from '../data/mockData';
import { useTranslation } from '../lib/translations';

interface MenuPageProps {
  language: string;
}

const MenuPage: React.FC<MenuPageProps> = ({ language }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('appetizers');
  const [cart, setCart] = useState<MenuItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const t = useTranslation(language);

  const restaurant = mockRestaurants.find(r => r.id === id);
  const menuItems = mockMenuItems[id || ''] || [];

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{t.error}</h2>
          <button
            onClick={() => navigate('/restaurants')}
            className="text-blue-600 hover:text-blue-800"
          >
            {t.back}
          </button>
        </div>
      </div>
    );
  }

  const categories = [
    { id: 'appetizers', label: t.appetizers },
    { id: 'mainCourses', label: t.mainCourses },
    { id: 'desserts', label: t.desserts },
    { id: 'beverages', label: t.beverages }
  ];

  const filteredItems = menuItems.filter(item => item.category === activeCategory);

  const addToCart = (item: MenuItem) => {
    setCart([...cart, item]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  const formatPrice = (price: number) => {
    // For Rupestre Bar Culinario (Mexican restaurant), show prices in MXN
    if (restaurant.id === '1') {
      return `$${price} MXN`;
    }
    return `$${price}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(`/restaurant/${id}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="ml-3">
            <h1 className="text-xl font-semibold text-gray-800">{restaurant.name}</h1>
            <p className="text-sm text-gray-600">{t.menu}</p>
          </div>
        </div>
        
        {cart.length > 0 && (
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cart.length}
            </span>
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeCategory === category.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 py-6 space-y-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="flex">
              <div className="flex-1 p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-3 leading-relaxed">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-green-600">
                    {formatPrice(item.price)}
                  </span>
                  <button
                    onClick={() => addToCart(item)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">{t.addToOrder}</span>
                  </button>
                </div>
              </div>
              {item.image && (
                <div className="w-24 h-24 bg-gray-200 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Cart Overlay */}
      {showCart && cart.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-h-96 rounded-t-xl overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">{t.viewOrder}</h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-4 max-h-64 overflow-y-auto">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-800">{t.orderTotal}:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatPrice(getTotalPrice())}
                </span>
              </div>
              <button
                onClick={() => navigate('/payment', { state: { cart, restaurant, total: getTotalPrice() } })}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                {t.placeOrder}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;