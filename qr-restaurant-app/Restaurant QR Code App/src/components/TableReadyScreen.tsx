import { PartyPopper } from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';

interface TableReadyScreenProps {
  language: Language;
  tableNumber: number;
  onProceed: () => void;
}

export function TableReadyScreen({ language, tableNumber, onProceed }: TableReadyScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
          <PartyPopper className="w-16 h-16 text-white" />
        </div>

        <div className="space-y-3">
          <h1 className="text-gray-900">{t('tableReady', language)}</h1>
          <p className="text-gray-600">
            Table #{tableNumber}
          </p>
        </div>

        <Button onClick={onProceed} size="lg" className="w-full">
          {t('orderFood', language)}
        </Button>
      </div>
    </div>
  );
}
