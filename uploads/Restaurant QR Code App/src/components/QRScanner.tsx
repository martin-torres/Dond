import { QrCode } from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { mockRestaurants } from '../data/mockRestaurants';

interface QRScannerProps {
  language: Language;
  onScan: (restaurantId: string) => void;
}

export function QRScanner({ language, onScan }: QRScannerProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center animate-pulse">
            <QrCode className="w-20 h-20 text-white" />
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-gray-900">{t('scanQR', language)}</h1>
            <p className="text-gray-600">{t('scanInstructions', language)}</p>
          </div>

          <div className="w-full h-px bg-gray-200" />

          <div className="w-full space-y-3">
            <p className="text-center text-gray-500">{t('simulateScan', language)}:</p>
            {mockRestaurants.map((restaurant) => (
              <Button
                key={restaurant.id}
                onClick={() => onScan(restaurant.id)}
                className="w-full"
                variant="outline"
              >
                <QrCode className="w-4 h-4 mr-2" />
                {restaurant.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
