import { UtensilsCrossed, Plus } from 'lucide-react';
import { Language, OrderItem } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { PageShell } from './PageShell';
import { BottomActionBar } from './BottomActionBar';

interface DiningScreenProps {
  language: Language;
  currentOrders: OrderItem[];
  tableNumber?: number;
  onContinueOrdering: () => void;
  onFinalizeOrder: () => void;
  onOpenPromoMenu: () => void;
}

export function DiningScreen({ 
  language, 
  currentOrders, 
  tableNumber,
  onContinueOrdering,
  onFinalizeOrder,
  onOpenPromoMenu,
}: DiningScreenProps) {
  const total = currentOrders.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity, 
    0
  );
  const hasTable = typeof tableNumber === 'number';
  const heading = hasTable ? `Table #${tableNumber}` : t('yourOrder', language);
  const subheading = hasTable ? 'Enjoy your meal!' : t('orderConfirmationSubtext', language);

  return (
    <>
      <PageShell paddedForActionBar className="justify-start">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <UtensilsCrossed className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">{heading}</h1>
            <p className="text-sm text-gray-600">{subheading}</p>
          </div>

          <Card className="p-6 space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">{t('yourOrder', language)}</h2>
            {currentOrders.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.quantity}x {item.menuItem.name[language]}
                  </p>
                  <p className="text-sm text-gray-600">{item.menuItem.category}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  ${(item.menuItem.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}

            <div className="border-t pt-3 flex justify-between">
              <span className="text-sm font-medium text-gray-900">{t('subtotal', language)}</span>
              <span className="text-sm font-semibold text-gray-900">${total.toFixed(2)}</span>
            </div>
            <p className="text-center text-sm text-gray-600 mt-4">
              {t('placeFinalOrder', language)}
            </p>
          </Card>
        </div>
      </PageShell>

      <BottomActionBar>
        <Button onClick={onFinalizeOrder} className="w-full sm:flex-1" size="lg">
          {t('placeFinalOrderButton', language)}
        </Button>
        <Button
          onClick={onContinueOrdering}
          variant="outline"
          className="w-full sm:flex-1"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('continueOrdering', language)}
        </Button>
        <Button onClick={onOpenPromoMenu} className="w-full sm:flex-1" size="lg" variant="ghost">
          {t('todaysPromos', language)}
        </Button>
      </BottomActionBar>
    </>
  );
}
