import { QrCode } from 'lucide-react';
import { Language, Restaurant } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { PageShell } from './PageShell';
import { getCompleteRestaurant, getRestaurant } from '../api/restaurantsApi';
import { useEffect, useState } from 'react';

interface QRScannerProps {
  language: Language;
  onScan: (restaurantId: string) => void;
}

export function QRScanner({ language, onScan }: QRScannerProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRestaurantId, setCurrentRestaurantId] = useState<string>('rest-one-maui');

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setLoading(true);
        console.log('QR Scanner: Loading restaurant data...');

        // Get restaurantId from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const restaurantId = urlParams.get('restaurantId') || 'rest-one-maui'; // Default to maui
        setCurrentRestaurantId(restaurantId);

        console.log('QR Scanner: Loading restaurant:', restaurantId);

        // Try to get complete restaurant data (with tables and menu)
        let restaurant = await getCompleteRestaurant(restaurantId);
        console.log('QR Scanner: Complete restaurant data:', restaurant);

        // If complete data fails, try to get just the basic restaurant info
        if (!restaurant) {
          console.log('QR Scanner: Complete data failed, trying basic restaurant info...');
          restaurant = await getRestaurant(restaurantId);

          if (restaurant) {
            // Add empty arrays for missing data so it doesn't break the UI
            restaurant.tables = [];
            restaurant.menu = { food: [], drinks: [] };
            restaurant.promos = [];
            console.log('QR Scanner: Basic restaurant loaded with empty tables/menu');
          }
        }

        if (restaurant) {
          setRestaurants([restaurant]);
          console.log('QR Scanner: Restaurant loaded successfully');
        } else {
          console.error('QR Scanner: No restaurant data returned');
          setError(`Restaurant "${restaurantId}" not found in database`);
        }
      } catch (err) {
        console.error('QR Scanner: Error loading restaurants:', err);
        setError(`Failed to load restaurant data: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
          {!loading && !error && restaurants.map((restaurant) => (
            <div key={restaurant.id} className="space-y-2">
              <Button
                onClick={() => onScan(restaurant.id)}
                className="w-full"
                variant="outline"
              >
                <QrCode className="w-4 h-4 mr-2" />
                {typeof restaurant.name === 'string' ? restaurant.name : (restaurant.name as any)?.[language] || (restaurant.name as any)?.en || 'Restaurant'}
              </Button>

              <div className="space-y-3">
                <p className="text-center text-gray-500 text-sm uppercase tracking-[0.25em]">
                  Staff access
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" className="w-full">
                    <a href={`/kitchen?restaurantId=${restaurant.slug || currentRestaurantId}`}>Kitchen</a>
                  </Button>

                  <Button asChild variant="outline" className="w-full">
                    <a href={`/bar?restaurantId=${restaurant.slug || currentRestaurantId}`}>Bar</a>
                  </Button>

                  <Button asChild variant="outline" className="w-full">
                    <a href={`/foh?restaurantId=${restaurant.slug || currentRestaurantId}`}>FOH</a>
                  </Button>

                  <Button asChild variant="outline" className="w-full">
                    <a href={`/manager?restaurantId=${restaurant.slug || currentRestaurantId}`}>Manager</a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
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
