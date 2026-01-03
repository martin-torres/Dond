import { Language, OrderItem } from '../types';
import { t, localizeCategory } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { PageShell } from './PageShell';
import { BottomActionBar } from './BottomActionBar';
import { RequestModal } from './RequestModal';
import { Bell } from 'lucide-react';
import { useState } from 'react';

interface OrderSummaryScreenProps {
  language: Language;
  tableNumber?: string | number;
  items: OrderItem[];
  onContinueOrdering: () => void;
  deliveredIds?: Set<string>;
  onRequestItem?: (requestType: 'server' | 'condiments' | 'water' | 'bill' | 'issue') => void;
  viewMode?: 'customer' | 'staff';
}

const formatPrice = (price: number) => `$${price.toFixed(2)}`;

export function OrderSummaryScreen({
  language,
  tableNumber,
  items,
  onContinueOrdering,
  deliveredIds,
  onRequestItem,
  viewMode = 'customer',
}: OrderSummaryScreenProps) {
  const [showRequestModal, setShowRequestModal] = useState(false);
  
  // Inline calculations (as approved)
  const subtotal = items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );
  const taxRate = 0.089999; // 8.999% tax rate from database
  const tax = subtotal * taxRate;
  const tip = subtotal * 0.15; // 15% default tip
  const total = subtotal + tax + tip;
  
  const seenIds = new Set<string>();

  return (
    <>
      {/* Staff View Header */}
      {viewMode === 'staff' && (
        <div className="fixed top-4 left-4 z-50">
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            STAFF VIEW
          </div>
        </div>
      )}

      {/* Bell button for service requests */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          onClick={() => setShowRequestModal(true)}
          className="rounded-full border border-gray-200 bg-white/90 shadow-sm px-3"
          aria-label="Request assistance"
        >
          <Bell className="w-5 h-5" />
        </Button>
      </div>

      <PageShell paddedForActionBar className="justify-start">
        <div className="space-y-6">
          <div className="text-center space-y-2 mt-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow">
              <span className="text-2xl">🍽️</span>
            </div>
            <p className="text-sm text-gray-600">
              {tableNumber
                ? `${t('tableReady', language).replace('!', '')} ${tableNumber}`
                : t('yourOrder', language)}
            </p>
            <h1 className="text-xl font-semibold text-gray-900">
              {viewMode === 'staff' ? 'Staff Bill View' : t('yourOrder', language)}
            </h1>
            {viewMode === 'staff' ? (
              <p className="text-sm text-gray-600">Complete bill summary with taxes, tip, and totals</p>
            ) : (
              <p className="text-sm text-gray-600">{t('orderSubmitBody', language)}</p>
            )}
          </div>

          <Card className={`p-6 shadow-lg ${viewMode === 'staff' ? 'border-2 border-red-200' : ''}`}>
            <div className="space-y-4">
              {items.map((item) => {
                const name =
                  item.menuItem.name.es ||
                  item.menuItem.name.en ||
                  Object.values(item.menuItem.name)[0];
                const category = item.menuItem.category || '';
                const localizedCategory = category ? localizeCategory(category, language) : '';
                const lineTotal = item.menuItem.price * item.quantity;
                const hasBeenSeen = seenIds.has(item.menuItem.id);
                const isDelivered = deliveredIds?.has(item.menuItem.id) || hasBeenSeen;
                seenIds.add(item.menuItem.id);
                return (
                  <div
                    key={`${item.menuItem.id}-${item.quantity}`}
                    className={`flex items-start justify-between rounded-xl p-3 border ${
                      isDelivered ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {item.quantity}x {name}
                      </p>
                      {localizedCategory && (
                        <p className="text-xs text-gray-500">{localizedCategory}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPrice(lineTotal)}
                    </span>
                  </div>
                );
              })}
              
              {/* Staff View: Complete bill summary */}
              {viewMode === 'staff' && (
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tax (8.999%)</span>
                    <span className="font-semibold">{formatPrice(tax)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tip (15%)</span>
                    <span className="font-semibold">{formatPrice(tip)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-lg font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{formatPrice(total)}</span>
                  </div>
                </div>
              )}
              
              {/* Customer View: Subtotal only */}
              {viewMode === 'customer' && (
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-sm text-gray-900 font-semibold">
                  <span>{t('subtotal', language)}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </PageShell>

      <BottomActionBar>
        {viewMode === 'staff' ? (
          <div className="flex gap-4 w-full">
            <Button variant="outline" className="flex-1" onClick={onContinueOrdering}>
              + Continue Ordering
            </Button>
            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => onRequestItem?.('bill')} size="lg">
              Process Payment
            </Button>
          </div>
        ) : (
          <div className="flex gap-4 w-full">
            <Button variant="outline" className="w-full sm:flex-1" onClick={onContinueOrdering}>
              + {t('continueOrdering', language)}
            </Button>
            <Button className="w-full sm:flex-1" onClick={() => onRequestItem?.('bill')} size="lg">
              {t('requestBill', language)}
            </Button>
          </div>
        )}
      </BottomActionBar>

      <RequestModal
        open={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onRequestItem={onRequestItem || (() => {})}
      />
    </>
  );
}
