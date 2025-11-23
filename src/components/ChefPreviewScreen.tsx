import { useMemo, useEffect, useState } from 'react';
import { Restaurant, Language, MenuItem, OrderItem } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Plus, Minus, ShoppingCart } from 'lucide-react';

type HighlightCategory = 'food' | 'drinks';

interface ChefPreviewScreenProps {
  restaurant: Restaurant;
  language: Language;
  focusCategory?: HighlightCategory;
  onClose: () => void;
  onBrowseFullMenu: (initialTab?: HighlightCategory) => void;
  onSelectTable?: () => void;
  onPlaceOrder: (items: OrderItem[]) => void;
}

const normalize = (text: string) => text.toLowerCase();

const matchesCategory = (category: string, keywords: string[]) => {
  const lower = normalize(category || '');
  return keywords.some((keyword) => lower.includes(keyword));
};

const pickItems = (
  items: MenuItem[],
  keywords: string[],
  fallback: MenuItem[],
  limit: number
) => {
  const filtered = items.filter((item) => matchesCategory(item.category, keywords));
  if (filtered.length >= limit) {
    return filtered.slice(0, limit);
  }
  return [...new Set([...filtered, ...fallback])].slice(0, limit);
};

const formatPrice = (price: number) => `$${price.toFixed(2)}`;

export function ChefPreviewScreen({
  restaurant,
  language,
  focusCategory = 'food',
  onClose,
  onBrowseFullMenu,
  onSelectTable,
  onPlaceOrder,
}: ChefPreviewScreenProps) {
  const foodItems = restaurant.menu.food;
  const drinkItems = restaurant.menu.drinks;
  const [cart, setCart] = useState<Map<string, number>>(new Map());

  const appetizers = useMemo(
    () => pickItems(foodItems, ['antoj', 'starter', 'entr', 'app'], foodItems.slice(0, 4), 3),
    [foodItems]
  );
  const mains = useMemo(
    () =>
      pickItems(
        foodItems,
        ['main', 'plato', 'taco', 'burger', 'bowls'],
        foodItems.slice(2),
        3
      ),
    [foodItems]
  );
  const desserts = useMemo(
    () => pickItems(foodItems, ['dess', 'sweet', 'postre'], foodItems.slice(-3), 2),
    [foodItems]
  );
  const drinks = useMemo(
    () => pickItems(drinkItems, ['cocktail', 'drink', 'agua', 'slush'], drinkItems.slice(0, 4), 3),
    [drinkItems]
  );
  const backgroundGradient = 'from-blue-50 to-purple-50';
  const sectionTitleClass = 'text-sm uppercase tracking-[0.3em] text-gray-400';
  const chefBadgeClass = 'text-[10px]';
  const sectionGridClass = 'grid gap-3 sm:grid-cols-2';
  const itemCardClass =
    'relative overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow transition hover:-translate-y-0.5 hover:shadow-lg';
  const itemImageClass = 'h-32 w-full object-cover';
  const shellCardClass = 'p-6 space-y-6 bg-white/90 border-white/70 shadow-lg backdrop-blur';

  useEffect(() => {
    const targetId =
      focusCategory === 'drinks'
        ? 'chef-preview-drinks'
        : focusCategory === 'food'
        ? 'chef-preview-food'
        : null;
    if (!targetId) return;
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [focusCategory]);

  const addToCart = (itemId: string) => {
    setCart((prev) => {
      const next = new Map(prev);
      next.set(itemId, (next.get(itemId) || 0) + 1);
      return next;
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const next = new Map(prev);
      const current = next.get(itemId) || 0;
      if (current > 1) {
        next.set(itemId, current - 1);
      } else {
        next.delete(itemId);
      }
      return next;
    });
  };

  const handlePlaceOrder = () => {
    const orderItems: OrderItem[] = [];
    cart.forEach((qty, itemId) => {
      const menuItem = [...restaurant.menu.food, ...restaurant.menu.drinks].find(
        (item) => item.id === itemId
      );
      if (menuItem && qty > 0) {
        orderItems.push({ menuItem, quantity: qty });
      }
    });
    if (orderItems.length === 0) return;
    onPlaceOrder(orderItems);
  };

  const renderSection = (title: string, items: MenuItem[], tab: HighlightCategory) => (
    <div className="space-y-3" key={title}>
      <div className="flex items-center justify-between">
        <h2 className={sectionTitleClass}>{title}</h2>
        <Badge variant="outline" className={chefBadgeClass}>
          Chef’s pick
        </Badge>
      </div>
      <div className={sectionGridClass}>
        {items.map((item) => {
          const quantity = cart.get(item.id) || 0;
          const name = item.name[language] || item.name.en;
          const description = item.description[language] || item.description.en;
          return (
            <Card key={item.id} className={itemCardClass}>
              <img
                src={item.image}
                alt={name}
                className={itemImageClass}
                loading="lazy"
              />
              <div className="p-3 space-y-1">
                <p className="text-sm font-semibold text-gray-900">{name}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{description}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPrice(item.price)}
                  </span>
                  {quantity === 0 ? (
                    <Button size="sm" onClick={() => addToCart(item.id)}>
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
            </Card>
          );
        })}
      </div>
    </div>
  );

  const totalItems = Array.from(cart.values()).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Array.from(cart.entries()).reduce((sum, [itemId, qty]) => {
    const item = [...restaurant.menu.food, ...restaurant.menu.drinks].find((i) => i.id === itemId);
    return sum + (item?.price || 0) * qty;
  }, 0);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgroundGradient} p-4 pb-32`}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-400">
              {t('guestGreeting', language)}, {t('seatLabelMe', language)}
            </p>
            <h1 className="text-3xl font-semibold text-gray-900">
              {t('guestPrompt', language)}
            </h1>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            {t('back', language)}
          </Button>
        </div>

        <Card className={shellCardClass} id="chef-preview-food">
          {renderSection(t('specialsAppetizers', language), appetizers, 'food')}
          {renderSection(t('specialsMains', language), mains, 'food')}
          {renderSection(t('specialsDesserts', language), desserts, 'food')}
          <div id="chef-preview-drinks">
            {renderSection(t('specialsDrinks', language), drinks, 'drinks')}
          </div>
        </Card>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            className="w-full sm:flex-1"
            onClick={() => onBrowseFullMenu(focusCategory ?? 'food')}
          >
            {t('guestBrowseMenu', language)}
          </Button>
          <Button
            variant="outline"
            className="w-full sm:flex-1"
            onClick={onSelectTable ?? onClose}
          >
            {onSelectTable ? t('selectTable', language) : t('back', language)}
          </Button>
        </div>
      </div>
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="max-w-2xl mx-auto p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-900">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <span>
                  {totalItems} {totalItems === 1 ? t('item', language) : t('items', language)}
                </span>
              </div>
              <span className="text-gray-900">${totalPrice.toFixed(2)}</span>
            </div>
            <Button className="w-full" size="lg" onClick={() => handlePlaceOrder(foodItems.concat(drinkItems), focusCategory)}>
              {t('placeOrder', language)}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
