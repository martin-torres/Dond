import { UtensilsCrossed, Plus } from 'lucide-react';
import { Language, OrderItem } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 pb-32">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            <UtensilsCrossed className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900">{heading}</h1>
          <p className="text-gray-600">{subheading}</p>
        </div>

        <Card className="p-6">
          <h2 className="text-gray-900 mb-4">{t('yourOrder', language)}</h2>
          <div className="space-y-3">
            {currentOrders.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-gray-900">
                    {item.quantity}x {item.menuItem.name[language]}
                  </p>
                  <p className="text-gray-600">{item.menuItem.category}</p>
                </div>
                <p className="text-gray-900">
                  ${(item.menuItem.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
            
            <div className="border-t pt-3 flex justify-between">
              <span className="text-gray-900">{t('subtotal', language)}</span>
              <span className="text-gray-900">${total.toFixed(2)}</span>
            </div>
            <p className="text-center text-sm text-gray-600 mt-4">
              {t('placeFinalOrder', language)}
            </p>
          </div>
        </Card>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
          <div className="max-w-2xl mx-auto space-y-2">
            <Button 
              onClick={onFinalizeOrder}
              className="w-full"
              size="lg"
            >
              {t('placeFinalOrderButton', language)}
            </Button>
            <Button 
              onClick={onContinueOrdering}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('continueOrdering', language)}
            </Button>
            <Button 
              onClick={onOpenPromoMenu}
              className="w-full"
              size="lg"
              variant="ghost"
            >
              {t('todaysPromos', language)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
