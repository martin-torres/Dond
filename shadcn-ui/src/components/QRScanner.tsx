import { QrCode } from 'lucide-react';
import { Language } from '../types/restaurant';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { mockRestaurants } from '../data/mockRestaurants';

interface QRScannerProps {
  language: Language;
  onScan: (restaurantId: string) => void;
}

export function QRScanner({ language, onScan }: QRScannerProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Animated QR Code Icon */}
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center animate-pulse shadow-lg">
            <QrCode className="w-20 h-20 text-white" />
          </div>
          
          {/* Title and Instructions */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">{t('scanQR', language)}</h1>
            <p className="text-gray-600 text-sm">{t('scanInstructions', language)}</p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gray-200" />

          {/* Demo Restaurant Selection */}
          <div className="w-full space-y-3">
            <p className="text-center text-sm text-gray-500">{t('simulateScan', language)}:</p>
            {mockRestaurants.map((restaurant) => (
              <Button
                key={restaurant.id}
                onClick={() => onScan(restaurant.id)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                size="lg"
              >
                <QrCode className="w-4 h-4 mr-2" />
                {restaurant.name}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}