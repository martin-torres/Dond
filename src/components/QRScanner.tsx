import { QrCode } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Language, Restaurant } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { PageShell } from './PageShell';
import { fetchRestaurants } from '../data/restaurants';
import { LiveDataUnavailable } from './LiveDataUnavailable';

interface QRScannerProps {
  language: Language;
  onScan: (restaurantId: string) => void;
}

export function QRScanner({ language, onScan }: QRScannerProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveUnavailable, setLiveUnavailable] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const res = await fetchRestaurants();
      if (!mounted) return;
      setLoading(false);
      if (res.liveDataUnavailable) {
        setRestaurants([]);
        setLiveUnavailable(true);
        setErrorMessage(res.error ?? null);
      } else {
        setRestaurants(res.data);
        setLiveUnavailable(false);
        setErrorMessage(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

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
          {loading && <p className="text-center text-gray-500 text-sm">Loading restaurants…</p>}

          {!loading && liveUnavailable && <LiveDataUnavailable message={errorMessage ?? undefined} />}

          {!loading && !liveUnavailable && restaurants.length === 0 && (
            <p className="text-center text-gray-500 text-sm">No restaurants available.</p>
          )}

          {!loading && !liveUnavailable && restaurants.length > 0 && (
            <>
              <p className="text-center text-gray-500 text-sm">{t('simulateScan', language)}:</p>
              {restaurants.map((restaurant) => (
                <Button key={restaurant.id} onClick={() => onScan(restaurant.id)} className="w-full" variant="outline">
                  <QrCode className="w-4 h-4 mr-2" />
                  {restaurant.name}
                </Button>
              ))}
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}
