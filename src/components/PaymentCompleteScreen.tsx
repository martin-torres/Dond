import { CheckCircle, Star } from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { PageShell } from './PageShell';
import { BottomActionBar } from './BottomActionBar';

interface PaymentCompleteScreenProps {
  language: Language;
  onFinish: () => void;
}

export function PaymentCompleteScreen({ language, onFinish }: PaymentCompleteScreenProps) {
  return (
    <>
      <PageShell
        paddedForActionBar
        headerSlot={
          <div className="max-w-md w-full text-center space-y-6 mx-auto">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-gray-900">{t('paymentComplete', language)}</h1>
              <p className="text-sm text-gray-600">{t('thankYou', language)}</p>
            </div>

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              ))}
            </div>
          </div>
        }
      />

      <BottomActionBar>
        <Button onClick={onFinish} size="lg" className="w-full sm:flex-1">
          Done
        </Button>
      </BottomActionBar>
    </>
  );
}
