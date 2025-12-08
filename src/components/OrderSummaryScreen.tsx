import { Language, OrderItem } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { PageShell } from './PageShell';
import { BottomActionBar } from './BottomActionBar';

interface OrderSummaryScreenProps {
  language: Language;
  tableNumber?: string | number;
  items: OrderItem[];
  onContinueOrdering: () => void;
  onRequestBill: () => void;
  onContinueToOptions: () => void;
}

const formatPrice = (price: number) => `$${price.toFixed(2)}`;

export function OrderSummaryScreen({
  language,
  tableNumber,
  items,
  onContinueOrdering,
  onRequestBill,
  onContinueToOptions,
}: OrderSummaryScreenProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  return (
    <>
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
            <h1 className="text-xl font-semibold text-gray-900">{t('yourOrder', language)}</h1>
            <p className="text-sm text-gray-600">{t('orderSubmitBody', language)}</p>
          </div>

          <Card className="p-6 shadow-lg">
            <div className="space-y-4">
              {items.map((item) => {
                const name = item.menuItem.name[language] || item.menuItem.name.en;
                const category = item.menuItem.category || '';
                const lineTotal = item.menuItem.price * item.quantity;
                return (
                  <div
                    key={`${item.menuItem.id}-${item.quantity}`}
                    className="flex items-start justify-between rounded-xl bg-gray-50 p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {item.quantity}x {name}
                      </p>
                      {category && <p className="text-xs text-gray-500">{category}</p>}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPrice(lineTotal)}
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-sm text-gray-900 font-semibold">
                <span>{t('subtotal', language)}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>
          </Card>
        </div>
      </PageShell>

      <BottomActionBar>
        <Button variant="outline" className="w-full sm:flex-1" onClick={onContinueOrdering}>
          + {t('continueOrdering', language)}
        </Button>
        <Button className="w-full sm:flex-1" onClick={onRequestBill} size="lg">
          {t('requestBill', language)}
        </Button>
        <Button
          variant="ghost"
          className="w-full sm:flex-1 text-gray-700"
          onClick={onContinueToOptions}
        >
          {t('postOrderHeading', language)}
        </Button>
      </BottomActionBar>
    </>
  );
}
