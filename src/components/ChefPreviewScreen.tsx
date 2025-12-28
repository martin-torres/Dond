import { useMemo, useEffect, useState } from 'react';
import { Restaurant, Language, MenuItem, OrderItem } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Plus, Minus, ShoppingCart, ArrowLeft, ChevronLeft } from 'lucide-react';
import { PageShell } from './PageShell';
import { BottomActionBar } from './BottomActionBar';
import { StageGraphicSlot } from './StageGraphicSlot';

type HighlightCategory = 'food' | 'drinks';

interface ChefPreviewScreenProps {
  restaurant: Restaurant;
  language: Language;
  focusCategory?: HighlightCategory;
  onClose: () => void;
  onBrowseFullMenu: (initialTab?: HighlightCategory) => void;
  onSelectTable?: () => void;
  onReserveTable: (items: OrderItem[]) => void;
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

const selectSectionItems = (
  source: MenuItem[],
  keywords: string[],
  fallback: MenuItem[],
  limit: number,
  usedIds: Set<string>
) => {
  const candidates = pickItems(source, keywords, fallback, limit * 2);
  const unique: MenuItem[] = [];

  for (const item of candidates) {
    if (usedIds.has(item.id)) continue;
    unique.push(item);
    usedIds.add(item.id);
    if (unique.length === limit) break;
  }

  // If we still need more, pull from the source list in order
  if (unique.length < limit) {
    for (const item of source) {
      if (usedIds.has(item.id)) continue;
      unique.push(item);
      usedIds.add(item.id);
      if (unique.length === limit) break;
    }
  }

  return unique;
};

const formatPrice = (price: number) => `$${price.toFixed(2)}`;

export function ChefPreviewScreen({
  restaurant,
  language,
  focusCategory = 'food',
  onClose,
  onBrowseFullMenu,
  onSelectTable,
  onReserveTable,
}: ChefPreviewScreenProps) {
  const foodItems = restaurant.menu?.food || [];
  const drinkItems = restaurant.menu?.drinks || [];
  const [cart, setCart] = useState<Map<string, number>>(new Map());

  // Fresh per-render so language changes don't reuse a mutated set and hide items.
  const usedIds = useMemo(() => new Set<string>(), [restaurant.id, language]);

  const appetizers = useMemo(
    () =>
      selectSectionItems(
        foodItems,
        ['antoj', 'starter', 'entr', 'app'],
        foodItems.slice(0, 4),
        3,
        usedIds
      ),
    [foodItems, usedIds]
  );
  const mains = useMemo(
    () =>
      selectSectionItems(
        foodItems,
        ['main', 'plato', 'taco', 'burger', 'bowls'],
        foodItems.slice(2),
        3,
        usedIds
      ),
    [foodItems, usedIds]
  );
  const desserts = useMemo(
    () =>
      selectSectionItems(foodItems, ['dess', 'sweet', 'postre'], foodItems.slice(-3), 2, usedIds),
    [foodItems, usedIds]
  );
  const drinks = useMemo(
    () =>
      selectSectionItems(
        drinkItems,
        ['cocktail', 'drink', 'agua', 'slush'],
        drinkItems.slice(0, 4),
        3,
        usedIds
      ),
    [drinkItems, usedIds]
  );
  const sectionTitleClass = 'text-xl font-semibold text-gray-900';
  const chefBadgeClass = 'text-[10px]';
  const sectionGridClass = 'grid gap-3 sm:grid-cols-2';
  const itemCardClass =
    'relative overflow-hidden rounded-xl border border-gray-200 bg-white/90 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md';
  const itemImageClass = 'h-32 w-full object-cover';
  const shellCardClass =
    'p-6 md:p-8 space-y-6 bg-white/95 border border-gray-200 shadow-sm rounded-2xl';

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
      const menuItem = [...(restaurant.menu?.food || []), ...(restaurant.menu?.drinks || [])].find(
        (item) => item.id === itemId
      );
      if (menuItem && qty > 0) {
        orderItems.push({ menuItem, quantity: qty });
      }
    });
    if (orderItems.length === 0) return;
    onReserveTable(orderItems);
  };

  const renderSection = (title: string, items: MenuItem[], _tab: HighlightCategory) => (
    <div className="space-y-3" key={title}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Chef’s picks</p>
          <h2 className={sectionTitleClass}>{title}</h2>
        </div>
        <Badge variant="secondary" className={chefBadgeClass}>
          {t('featured', language)}
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
    const item = [...(restaurant.menu?.food || []), ...(restaurant.menu?.drinks || [])].find((i) => i.id === itemId);
    return sum + (item?.price || 0) * qty;
  }, 0);

  return (
    <>
      <PageShell
        width="xl"
        className="justify-start"
        paddedForActionBar={totalItems > 0}
        headerSlot={
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-700 hover:text-gray-900 rounded-full border border-gray-200 bg-white/70 shadow-sm px-3"
              aria-label={t('back', language)}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <StageGraphicSlot label={t('todaysPromos', language)} tone="rose">
              🍽️
            </StageGraphicSlot>
            <div className="w-20" aria-hidden />
          </div>
        }
      >
        <Card className={shellCardClass} id="chef-preview-food">
          {renderSection(t('specialsAppetizers', language), appetizers, 'food')}
          {renderSection(t('specialsMains', language), mains, 'food')}
          {renderSection(t('specialsDesserts', language), desserts, 'food')}
          <div id="chef-preview-drinks">
            {renderSection(t('specialsDrinks', language), drinks, 'drinks')}
          </div>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            className="w-full sm:flex-1"
            onClick={() => onBrowseFullMenu(focusCategory ?? 'food')}
            variant="outline"
          >
            {t('guestBrowseMenu', language)}
          </Button>
          <Button className="w-full sm:flex-1" onClick={onSelectTable ?? onClose}>
            {onSelectTable ? t('selectTable', language) : t('back', language)}
          </Button>
        </div>
      </PageShell>

      {totalItems > 0 && (
        <BottomActionBar innerClassName="items-start sm:items-center">
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <div className="flex items-center gap-2 text-gray-900">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              <span>
                {totalItems} {totalItems === 1 ? t('item', language) : t('items', language)}
              </span>
            </div>
            <span className="text-gray-900 font-semibold">${totalPrice.toFixed(2)}</span>
          </div>
          <Button className="w-full sm:flex-1" size="lg" onClick={() => handlePlaceOrder()}>
            {t('selectTable', language)}
          </Button>
        </BottomActionBar>
      )}
    </>
  );
}
