import { AlertTriangle, MapPin } from 'lucide-react';
import { Language } from '../types/restaurant';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface ProximityWarningProps {
  distance: number;
  language: Language;
  drinkTotal: number;
  onChargeAndRelease: () => void;
}

export function ProximityWarning({ distance, language, drinkTotal, onChargeAndRelease }: ProximityWarningProps) {
  if (distance <= 50) return null; // Only show warning when far from restaurant

  const getText = (key: string) => {
    const texts = {
      en: {
        warning: 'You are moving away from the restaurant',
        message: 'Your drinks will be charged if you leave the area',
        chargeAndRelease: 'Charge Drinks & Release Table',
        distance: 'Distance'
      },
      es: {
        warning: 'Te estás alejando del restaurante',
        message: 'Tus bebidas serán cobradas si sales del área',
        chargeAndRelease: 'Cobrar Bebidas y Liberar Mesa',
        distance: 'Distancia'
      }
    };
    return texts[language as keyof typeof texts]?.[key as keyof typeof texts['en']] || texts.en[key as keyof typeof texts['en']];
  };

  return (
    <Card className="fixed top-20 left-4 right-4 z-40 bg-red-50 border-red-200 shadow-lg">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold text-red-900">{getText('warning')}</h3>
        </div>
        <p className="text-sm text-red-800 mb-3">{getText('message')}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <MapPin className="w-4 h-4" />
            <span>{getText('distance')}: {distance}m</span>
          </div>
          <Button
            onClick={onChargeAndRelease}
            variant="destructive"
            size="sm"
          >
            {getText('chargeAndRelease')} (${drinkTotal.toFixed(2)})
          </Button>
        </div>
      </div>
    </Card>
  );
}