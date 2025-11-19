import { useMemo } from 'react';
import { Restaurant, Language, MenuItem, OrderItem } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface GuestOrderingScreenProps {
  restaurant: Restaurant;
  language: Language;
  guestIndex: number;
  guestName?: string;
  selections: OrderItem[];
  onAddItem: (menuItem: MenuItem) => void;
  onDone: () => void;
  onSkip: () => void;
  onOpenFullMenu: () => void;
}

const normalize = (text: string) => text.toLowerCase();

const matchesCategory = (category: string, keywords: string[]) => {
  const lower = normalize(category || '');
  return keywords.some((keyword) => lower.includes(keyword));
};

const pickItems = (items: MenuItem[], keywords: string[], fallback: MenuItem[], limit: number) => {
  const filtered = items.filter((item) => matchesCategory(item.category, keywords));
  if (filtered.length >= limit) {
    return filtered.slice(0, limit);
  }
  return [...new Set([...filtered, ...fallback])].slice(0, limit);
};

const formatPrice = (price: number) => `$${price.toFixed(2)}`;

export function GuestOrderingScreen({
  restaurant,
  language,
  guestIndex,
  guestName,
  selections,
  onAddItem,
  onDone,
  onSkip,
  onOpenFullMenu,
}: GuestOrderingScreenProps) {
  const seatLabel = guestName?.trim() || `${t('seat', language)} ${guestIndex + 1}`;

  const foodItems = restaurant.menu.food;
  const drinkItems = restaurant.menu.drinks;

  const appetizers = useMemo(
    () =>
      pickItems(
        foodItems,
        ['antoj', 'starter', 'entr', 'app'],
        foodItems.slice(0, 4),
        3
      ),
    [foodItems]
  );
  const mains = useMemo(
    () => pickItems(foodItems, ['main', 'plato', 'taco', 'burger', 'bowls'], foodItems.slice(2), 3),
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

  const renderSection = (title: string, items: MenuItem[]) => (
    <div className="space-y-3" key={title}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm uppercase tracking-[0.3em] text-gray-400">{title}</h2>
        <Badge variant="outline" className="text-[10px]">
          Chef’s pick
        </Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onAddItem(item)}
            className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow transition hover:translate-y-[-2px] hover:shadow-lg"
          >
            <img
              src={item.image}
              alt={item.name[language] || item.name.en}
              className="h-32 w-full object-cover"
              loading="lazy"
            />
            <div className="p-3 space-y-1">
              <p className="text-sm font-semibold text-gray-900">
                {item.name[language] || item.name.en}
              </p>
              <p className="text-xs text-gray-500 line-clamp-2">
                {item.description[language] || item.description.en}
              </p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-semibold text-gray-900">{formatPrice(item.price)}</span>
                <Badge variant="default" className="text-[10px] bg-slate-900">
                  + Add
                </Badge>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 pb-32">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">{t('guestGreeting', language)}, {seatLabel}</p>
          <h1 className="text-3xl font-semibold text-gray-900">{t('guestPrompt', language)}</h1>
        </div>

        <Card className="p-6 space-y-6 bg-white/90 border-white/70 shadow-lg backdrop-blur">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {renderSection(t('specialsAppetizers', language), appetizers)}
              {renderSection(t('specialsMains', language), mains)}
              {renderSection(t('specialsDesserts', language), desserts)}
              {renderSection(t('specialsDrinks', language), drinks)}
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border p-4 bg-white">
                <p className="text-sm font-semibold text-gray-900 mb-2">{seatLabel}</p>
                <p className="text-xs text-gray-500 mb-3">Current selection</p>
                <div className="space-y-2 max-h-64 overflow-auto pr-2">
                  {selections.length === 0 && (
                    <p className="text-xs text-gray-400">No items added yet.</p>
                  )}
                  {selections.map((order, index) => (
                    <div
                      key={`${order.menuItem.id}-${index}`}
                      className="rounded-xl border border-slate-100 px-3 py-2 text-sm flex items-center justify-between"
                    >
                      <span>{order.menuItem.name[language] || order.menuItem.name.en}</span>
                      <span className="text-xs text-gray-500">{formatPrice(order.menuItem.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={onDone}>{t('guestDone', language)}</Button>
                <Button variant="outline" onClick={onSkip}>
                  {t('guestSkip', language)}
                </Button>
                <Button variant="ghost" onClick={onOpenFullMenu}>
                  {t('guestBrowseMenu', language)}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
