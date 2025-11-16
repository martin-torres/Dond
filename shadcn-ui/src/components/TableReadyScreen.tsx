import { CheckCircle } from 'lucide-react';
import { Language } from '../types/restaurant';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface TableReadyScreenProps {
  language: Language;
  tableNumber: number;
  onProceed: () => void;
}

export function TableReadyScreen({ language, tableNumber, onProceed }: TableReadyScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle className="w-14 h-14 text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('tableReady', language)}
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Table #{tableNumber}
        </p>
        
        <Button 
          onClick={onProceed} 
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white" 
          size="lg"
        >
          {t('proceedToTable', language)}
        </Button>
      </Card>
    </div>
  );
}