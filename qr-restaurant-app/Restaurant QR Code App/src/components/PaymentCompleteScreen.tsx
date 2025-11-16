import { CheckCircle, Star } from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';

interface PaymentCompleteScreenProps {
  language: Language;
  onFinish: () => void;
}

export function PaymentCompleteScreen({ language, onFinish }: PaymentCompleteScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-16 h-16 text-white" />
        </div>

        <div className="space-y-3">
          <h1 className="text-gray-900">{t('paymentComplete', language)}</h1>
          <p className="text-gray-600">{t('thankYou', language)}</p>
        </div>

        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-8 h-8 text-yellow-500 fill-yellow-500" />
          ))}
        </div>

        <Button onClick={onFinish} size="lg" className="w-full">
          Done
        </Button>
      </div>
    </div>
  );
}
