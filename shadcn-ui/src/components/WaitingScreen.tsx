import { Clock, Coffee } from 'lucide-react';
import { Language } from '../types/restaurant';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface WaitingScreenProps {
  language: Language;
  estimatedWaitTime: number;
  onTableReady: () => void;
  onOrderDrinks: () => void;
}

export function WaitingScreen({ 
  language, 
  estimatedWaitTime, 
  onTableReady, 
  onOrderDrinks 
}: WaitingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6 flex flex-col justify-center min-h-screen">
        <Card className="p-8 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Clock className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Table Being Prepared</h1>
          <p className="text-gray-600 mb-6">
            {t('estimatedWait', language)}: <span className="font-semibold text-orange-600">{estimatedWaitTime} {t('minutes', language)}</span>
          </p>
        </Card>

        <Card className="p-6">
          <div className="text-center space-y-4">
            <Coffee className="w-16 h-16 text-blue-600 mx-auto" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">While You Wait</h2>
              <p className="text-gray-600 mb-4">
                {t('orderDrinks', language)}
              </p>
            </div>
            <Button 
              onClick={onOrderDrinks}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              size="lg"
            >
              <Coffee className="w-5 h-5 mr-2" />
              {t('drinks', language)} Menu
            </Button>
          </div>
        </Card>

        {/* Demo: Simulate table ready */}
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="text-center">
            <p className="text-sm text-green-700 mb-3">Demo: Simulate table ready</p>
            <Button 
              onClick={onTableReady}
              variant="outline"
              className="border-green-500 text-green-700 hover:bg-green-100"
            >
              {t('tableReady', language)}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}