import { useEffect } from 'react';
import { Restaurant, Language } from '../types';
import { t } from '../utils/translations';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface MenuPreviewProps {
  restaurant: Restaurant;
  language: Language;
  onClose: () => void;
  focusItemId?: string;
}

export function MenuPreview({ restaurant, language, onClose, focusItemId }: MenuPreviewProps) {
  useEffect(() => {
    if (!focusItemId) return;
    const element = document.getElementById(`menu-item-${focusItemId}`);
    if (!element) return;

    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.classList.add('ring-2', 'ring-cyan-400', 'ring-offset-2', 'ring-offset-blue-50');

    const timeout = window.setTimeout(() => {
      element.classList.remove('ring-2', 'ring-cyan-400', 'ring-offset-2', 'ring-offset-blue-50');
    }, 2200);

    return () => {
      window.clearTimeout(timeout);
      element.classList.remove('ring-2', 'ring-cyan-400', 'ring-offset-2', 'ring-offset-blue-50');
    };
  }, [focusItemId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gray-400">{restaurant.name}</p>
            <h1 className="text-2xl font-semibold text-gray-900">{t('menu', language)}</h1>
          </div>
          <Button variant="outline" onClick={onClose}>
            {t('back', language)}
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {restaurant.menu.food.map((item) => (
            <Card
              key={item.id}
              id={`menu-item-${item.id}`}
              className="p-4 space-y-2 scroll-mt-16 transition-shadow"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-gray-400">{t('food', language)}</p>
              <h3 className="text-lg font-semibold text-gray-900">
                {item.name[language] || item.name.en}
              </h3>
              <p className="text-sm text-gray-600">
                {item.description[language] || item.description.en}
              </p>
            </Card>
          ))}
          {restaurant.menu.drinks.map((item) => (
            <Card
              key={item.id}
              id={`menu-item-${item.id}`}
              className="p-4 space-y-2 scroll-mt-16 transition-shadow"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-gray-400">{t('drinks', language)}</p>
              <h3 className="text-lg font-semibold text-gray-900">
                {item.name[language] || item.name.en}
              </h3>
              <p className="text-sm text-gray-600">
                {item.description[language] || item.description.en}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
