import { QrCode } from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { mockRestaurants } from '../data/mockRestaurants';
import { PageShell } from './PageShell';

interface QRScannerProps {
  language: Language;
  onScan: (restaurantId: string) => void;
}

export function QRScanner({ language, onScan }: QRScannerProps) {
  return (
    <PageShell
      headerSlot={
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center animate-pulse">
            <QrCode className="w-20 h-20 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-gray-900">{t('scanQR', language)}</h1>
            <p className="text-sm text-gray-600">{t('scanInstructions', language)}</p>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="w-full h-px bg-gray-100" />

        <div className="w-full space-y-3">
          <p className="text-center text-gray-500 text-sm">
            {t('simulateScan', language)}:
          </p>
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

        <div className="w-full h-px bg-gray-100" />
        <div className="space-y-3">
          <p className="text-center text-gray-500 text-sm uppercase tracking-[0.25em]">
            Staff access
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" className="w-full">
              <a href="/kitchen">Kitchen</a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href="/bar">Bar</a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href="/foh">FOH</a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href="/manager">Manager</a>
            </Button>
          </div>
          <p className="text-center text-xs text-gray-400">
            Use a staff QR (or the buttons above) to open staff screens.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
