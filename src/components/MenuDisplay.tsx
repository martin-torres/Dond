import { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart, Armchair, ChevronLeft, Receipt, Bell } from 'lucide-react';
import { MenuItem, Language, OrderItem } from '../types';
import { t, localizeText, localizeCategory } from '../utils/translations';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PageShell } from './PageShell';
import { BottomActionBar } from './BottomActionBar';
import { RequestModal } from './RequestModal';
type TabType = 'drinks' | 'food';

// Menu display: shows items and, when no table is selected, surfaces a bottom bar prompting table selection.
interface MenuDisplayProps {
  drinks: MenuItem[];
  food: MenuItem[];
  language: Language;
  onPlaceOrder: (items: OrderItem[]) => void;
  isDrinksOnly?: boolean;
  focusItemId?: string;
  onBack?: () => void;
  initialTab?: TabType;
  onNext?: () => void;
  showSeatPrompt?: boolean;
  onChooseSeat?: () => void;
  onRequestItem?: (requestType: 'server' | 'condiments' | 'water' | 'bill' | 'issue') => void;
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
  onNext,
  showSeatPrompt = false,
  onChooseSeat,
  onRequestItem,
}: MenuDisplayProps) {
  const [activeTab, setActiveTab] = useState<TabType>(isDrinksOnly ? 'drinks' : initialTab);
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [showRequestModal, setShowRequestModal] = useState(false);

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
    <>
      <PageShell
        width="lg"
        className="justify-start"
        paddedForActionBar={totalItems > 0 || showSeatPrompt}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            {onBack ? (
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-gray-700 hover:text-gray-900 rounded-full border border-gray-200 bg-white/70 shadow-sm px-3"
                aria-label={t('back', language)}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            ) : (
              <span className="w-20" aria-hidden />
            )}

            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              activeTab === 'drinks' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
            }`}>
              <span>{activeTab === 'drinks' ? '🍸' : '🍽️'}</span>
              <span>{activeTab === 'drinks' ? t('drinks', language) : t('food', language)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRequestModal(true)}
                className="text-gray-700 hover:text-gray-900 rounded-full border border-gray-200 bg-white/70 shadow-sm px-3"
                aria-label="Request assistance"
              >
                <Bell className="w-5 h-5" />
              </Button>

              {onNext ? (
                <Button variant="outline" onClick={onNext} className="hidden sm:inline-flex">
                  {showSeatPrompt ? <Armchair className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
                </Button>
              ) : (
                <span className="w-20" aria-hidden />
              )}
            </div>
          </div>

          {!isDrinksOnly && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setActiveTab('food')}
                variant={activeTab === 'food' ? 'default' : 'outline'}
                className="w-full"
              >
                {t('food', language)}
              </Button>
              <Button
                onClick={() => setActiveTab('drinks')}
                variant={activeTab === 'drinks' ? 'default' : 'outline'}
                className="w-full"
              >
                {t('drinks', language)}
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {items.map((item) => {
              const quantity = cart.get(item.id) || 0;
              const itemName = localizeText(item.name, language);
              const itemDescription = localizeText(item.description, language);
              
              return (
                <Card
                  key={item.id}
                  id={`menu-item-${item.id}`}
                  className={`border border-gray-200 bg-white/90 shadow-sm rounded-xl overflow-hidden transition hover:shadow-md ${
                    focusItemId === item.id ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-blue-50 shadow-lg' : ''
                  }`}
                >
                  <div className="flex gap-4 p-4">
                    <ImageWithFallback
                      src={item.image}
                      alt={itemName}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 flex-1">{itemName}</h3>
                        <Badge variant="secondary" className="capitalize">
                          {localizeCategory(item.category, language)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{itemDescription}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-blue-600 font-semibold">${item.price.toFixed(2)}</span>
                        
                        {quantity === 0 ? (
                          <Button
                            onClick={() => addToCart(item.id)}
                            size="sm"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            {t('addToOrder', language)}
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-2 py-1">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-7 h-7 flex items-center justify-center bg-white rounded hover:bg-gray-100"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-blue-600 min-w-[2rem] text-center font-semibold">{quantity}</span>
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
        </div>
      </PageShell>

      {showSeatPrompt && (
        <BottomActionBar innerClassName='items-center justify-between gap-3 sm:flex-row'>
          <div className='flex-1' />
          <Button
            className='w-full sm:w-auto'
            size='lg'
            onClick={onChooseSeat}
            disabled={!onChooseSeat}
          >
            {t('chooseSeatCta', language)}
          </Button>
        </BottomActionBar>
      )}

      {!showSeatPrompt && totalItems > 0 && (
        <BottomActionBar innerClassName='items-start sm:items-center'>
          <div className='flex items-center justify-between w-full sm:w-auto gap-3'>
            <div className='flex items-center gap-2'>
              <ShoppingCart className='w-5 h-5 text-blue-600' />
              <span className='text-gray-900'>
                {totalItems} {totalItems === 1 ? t('item', language) : t('items', language)}
              </span>
            </div>
            <span className='text-gray-900 font-semibold'>${totalPrice.toFixed(2)}</span>
          </div>
          <Button onClick={handlePlaceOrder} className='w-full sm:flex-1' size='lg'>
            {t('placeOrder', language)}
          </Button>
        </BottomActionBar>
      )}

      <RequestModal
        open={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onRequestItem={onRequestItem || (() => {})}
      />
    </>
  );
}
