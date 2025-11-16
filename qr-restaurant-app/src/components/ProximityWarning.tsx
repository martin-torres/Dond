import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/translations';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

interface ProximityWarningProps {
  distance: number;
  language: Language;
  drinkTotal?: number;
  onChargeAndRelease?: () => void;
}

export function ProximityWarning({ distance, language, drinkTotal = 0, onChargeAndRelease }: ProximityWarningProps) {
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (distance > 25 && !hasTriggered && onChargeAndRelease) {
      setHasTriggered(true);
      // Simulate charging card and releasing table
      setTimeout(() => {
        onChargeAndRelease();
      }, 2000);
    }
  }, [distance, hasTriggered, onChargeAndRelease]);

  if (distance <= 25) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-pulse">
      <Alert className="bg-orange-600 text-white border-orange-700">
        <AlertTriangle className="w-5 h-5" />
        <AlertTitle>{t('proximityWarning', language)}</AlertTitle>
        <AlertDescription className="text-white/90">
          <p>{t('proximityMessage', language)}</p>
          <p className="mt-1">
            {t('distance', language)}: {distance} {t('meters', language)}
          </p>
          {drinkTotal > 0 && hasTriggered && (
            <p className="mt-2 font-semibold">
              ⚠️ Charging ${drinkTotal.toFixed(2)} to card and releasing table...
            </p>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}