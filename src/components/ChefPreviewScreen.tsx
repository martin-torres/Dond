import { useMemo, useEffect } from 'react';
import { Restaurant, Language, MenuItem } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

type HighlightCategory = 'food' | 'drinks';

interface ChefPreviewScreenProps {
  restaurant: Restaurant;
  language: Language;
  focusCategory?: HighlightCategory;
  onClose: () => void;
  onSelectItem: (itemId: string, tab: HighlightCategory) => void;
  onBrowseFullMenu: () => void;
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
  onSelectItem,
  onBrowseFullMenu,
}: ChefPreviewScreenProps) {
  const foodItems = restaurant.menu.food;
  const drinkItems = restaurant.menu.drinks;

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

  const renderSection = (title: string, items: MenuItem[], tab: HighlightCategory) => (
    <div className="space-y-3" key={title}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm uppercase tracking-[0.3em] text-gray-400">{title}</h2>
        <Badge variant="outline" className="text-[10px]">
          Chef’s pick
        </Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectItem(item.id, tab)}
            className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow transition hover:-translate-y-0.5 hover:shadow-lg"
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
                <span className="text-sm font-semibold text-gray-900">
                  {formatPrice(item.price)}
                </span>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4 pb-32">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gray-400">
              {t('guestGreeting', language)}, {t('seatLabelMe', language)}
            </p>
            <h1 className="text-3xl font-semibold text-gray-900">
              {t('guestPrompt', language)}
            </h1>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-gray-600 hover:text-gray-900">
            {t('back', language)}
          </Button>
        </div>

        <Card className="p-6 space-y-6" id="chef-preview-food">
          {renderSection(t('specialsAppetizers', language), appetizers, 'food')}
          {renderSection(t('specialsMains', language), mains, 'food')}
          {renderSection(t('specialsDesserts', language), desserts, 'food')}
          <div id="chef-preview-drinks">
            {renderSection(t('specialsDrinks', language), drinks, 'drinks')}
          </div>
        </Card>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="w-full sm:flex-1" onClick={() => onBrowseFullMenu()}>
            {t('guestBrowseMenu', language)}
          </Button>
          <Button
            variant="outline"
            className="w-full sm:flex-1"
            onClick={onClose}
          >
            {t('back', language)}
          </Button>
        </div>
      </div>
    </div>
  );
}
