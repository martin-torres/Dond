import { QrCode } from 'lucide-react';
import { Language, Restaurant } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { PageShell } from './PageShell';
import { getAllRestaurants } from '../api/restaurantsApi';
import { useEffect, useState } from 'react';

interface QRScannerProps {
  language: Language;
  onScan: (restaurantId: string) => void;
}

export function QRScanner({ language, onScan }: QRScannerProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setLoading(true);
        console.log('QR Scanner: Loading all restaurants from database...');

        // Fetch ALL restaurants from Supabase
        const allRestaurants = await getAllRestaurants();
        console.log('QR Scanner: Found restaurants:', allRestaurants.length);

        if (allRestaurants.length === 0) {
          setError('No restaurants found in database. Please add restaurants first.');
          console.error('QR Scanner: No restaurants in database');
        } else {
          setRestaurants(allRestaurants);
          console.log('QR Scanner: Loaded restaurants:', allRestaurants.map(r => ({ id: r.id, slug: r.slug, name: r.name })));
        }
      } catch (err) {
        console.error('QR Scanner: Error loading restaurants:', err);
        setError(`Failed to load restaurants: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
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
          <p className="text-center text-gray-500 text-sm">
            {loading ? 'Loading restaurants...' : error ? error : t('simulateScan', language) + ':'}
          </p>
          
          {!loading && !error && restaurants.length > 0 && (
            <div className="space-y-3">
              <p className="text-center text-gray-700 font-medium text-sm">
                Select a Restaurant:
              </p>
              {restaurants.map((restaurant) => (
                <div key={restaurant.id} className="space-y-2">
                  <Button
                    onClick={() => onScan(restaurant.slug || restaurant.id)}
                    className="w-full"
                    variant="outline"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    {typeof restaurant.name === 'string' 
                      ? restaurant.name 
                      : (restaurant.name as Record<string, string>)?.[language] || (restaurant.name as Record<string, string>)?.en || 'Restaurant'}
                  </Button>

                  <div className="space-y-3">
                    <p className="text-center text-gray-500 text-sm uppercase tracking-[0.25em]">
                      Staff access
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button asChild variant="outline" className="w-full">
                        <a href={`/kitchen?restaurantId=${restaurant.slug || restaurant.id}`}>Kitchen</a>
                      </Button>

                      <Button asChild variant="outline" className="w-full">
                        <a href={`/bar?restaurantId=${restaurant.slug || restaurant.id}`}>Bar</a>
                      </Button>

                      <Button asChild variant="outline" className="w-full">
                        <a href={`/foh?restaurantId=${restaurant.slug || restaurant.id}`}>FOH</a>
                      </Button>

                      <Button asChild variant="outline" className="w-full">
                        <a href={`/manager?restaurantId=${restaurant.slug || restaurant.id}`}>Manager</a>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-full h-px bg-gray-100" />
        <div className="space-y-3">
          <p className="text-center text-xs text-gray-400">
            Use a staff QR (or the buttons above) to open staff screens.
          </p>
        </div>
      </div>
    </PageShell>
  );
}