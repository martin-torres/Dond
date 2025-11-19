import { Language } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface OrderConfirmationScreenProps {
  language: Language;
  onContinueOrdering: () => void;
  onViewCurrentOrders: () => void;
}

export function OrderConfirmationScreen({ language, onContinueOrdering, onViewCurrentOrders }: OrderConfirmationScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-azure-100 p-4 pb-32">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="p-6 text-center space-y-4 bg-white/90 border border-slate-100 shadow-lg">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-500">
            {t('orderConfirmationTitle', language)}
          </p>
          <h1 className="text-2xl font-semibold text-gray-900">
            {t('orderConfirmationBody', language)}
          </h1>
          <p className="text-sm text-gray-500">
            {t('orderConfirmationSubtext', language)}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="w-full sm:flex-1 bg-gray-900 text-white hover:bg-gray-800"
              onClick={onContinueOrdering}
            >
              {t('orderConfirmationContinue', language)}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:flex-1 border-gray-300 text-gray-900 hover:bg-gray-50"
              onClick={onViewCurrentOrders}
            >
              {t('orderConfirmationView', language)}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
