import { useState } from 'react';
import { QrCode, Smartphone } from 'lucide-react';
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
  const [isScanning, setIsScanning] = useState(false);

  const handleSimulateScan = () => {
    setIsScanning(true);
    // Simulate scanning delay
    setTimeout(() => {
      setIsScanning(false);
      onScan(mockRestaurants[0].id);
    }, 2000);
  };

  const getText = (key: string) => {
    const texts = {
      en: {
        scanQR: 'Scan QR Code',
        scanInstructions: 'Point your camera at the QR code to get started',
        simulateScan: 'Simulate QR Scan',
        scanning: 'Scanning...',
        demo: 'Demo Mode'
      },
      es: {
        scanQR: 'Escanear Código QR',
        scanInstructions: 'Apunta tu cámara al código QR para comenzar',
        simulateScan: 'Simular Escaneo QR',
        scanning: 'Escaneando...',
        demo: 'Modo Demo'
      }
    };
    return texts[language as keyof typeof texts]?.[key as keyof typeof texts['en']] || texts.en[key as keyof typeof texts['en']];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-3">
      <div className="max-w-sm w-full space-y-6">
        {/* QR Scanner Area */}
        <Card className="p-6 text-center">
          <div className="mb-6">
            <div className={`w-48 h-48 mx-auto border-4 border-dashed rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isScanning 
                ? 'border-green-400 bg-green-50 animate-pulse' 
                : 'border-blue-400 bg-blue-50'
            }`}>
              {isScanning ? (
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-green-600 font-medium text-sm">{getText('scanning')}</p>
                </div>
              ) : (
                <QrCode className="w-20 h-20 text-blue-400" />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">{getText('scanQR')}</h1>
              <p className="text-sm text-gray-600 leading-relaxed px-2">
                {getText('scanInstructions')}
              </p>
            </div>

            <Button
              onClick={handleSimulateScan}
              disabled={isScanning}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              size="lg"
            >
              {isScanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {getText('scanning')}
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4 mr-2" />
                  {getText('simulateScan')}
                </>
              )}
            </Button>

            {/* Demo indicator */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              <span>{getText('demo')}</span>
            </div>
          </div>
        </Card>

        {/* Restaurant Options for Demo */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">
            {language === 'es' ? 'Restaurantes Disponibles' : 'Available Restaurants'}
          </h3>
          <div className="space-y-2">
            {mockRestaurants.map((restaurant) => (
              <button
                key={restaurant.id}
                onClick={() => onScan(restaurant.id)}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <p className="font-medium text-sm text-gray-900">{restaurant.name}</p>
                <p className="text-xs text-gray-600 truncate">{restaurant.address}</p>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}