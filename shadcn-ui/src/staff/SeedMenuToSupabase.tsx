import { useMemo, useState } from 'react';
import { mockRestaurants } from '../data/mockRestaurants';
import type { Restaurant, Language } from '../types';
import { upsertRestaurantMenuItems, type RestaurantMenuItemRow } from '../api/restaurantMenuApi';

const normalize = (v?: string | null) => (v ?? '').trim().toLowerCase();

const defaultStationForDrink = (category?: string | null) => {
  const c = normalize(category);

  // FOH drinks
  if (
    c.includes('refresco') ||
    c.includes('refrescos') ||
    c.includes('soda') ||
    c.includes('water') ||
    c.includes('agua')
  ) {
    return { station: 'foh' as const, station_label: 'soda' };
  }

  // Everything else drink -> BAR
  return { station: 'bar' as const, station_label: 'prepared' };
};

const defaultStationForFood = () => {
  // Your choice: ALL food -> kitchen
  return { station: 'kitchen' as const, station_label: 'dishes' };
};

export const SeedMenuToSupabase = ({ enabled }: { enabled: boolean }) => {
  const restaurants = useMemo(() => mockRestaurants ?? [], []);
  const [restaurantId, setRestaurantId] = useState<string>(restaurants[0]?.id ?? '');
  const activeRestaurant = useMemo(
    () => restaurants.find((r) => r.id === restaurantId) ?? null,
    [restaurants, restaurantId]
  );

  const [busy, setBusy] = useState(false);

  if (!enabled) return null;

  const buildRows = (restaurant: Restaurant): RestaurantMenuItemRow[] => {
    const rows: RestaurantMenuItemRow[] = [];

    const pushItem = (
      kind: 'food' | 'drink',
      item: {
        id: string;
        name: Record<Language, string>;
        description: Record<Language, string>;
        price: number;
        category: string;
        image?: string;
      },
      sort: number
    ) => {
      const routing =
        kind === 'drink' ? defaultStationForDrink(item.category) : defaultStationForFood();

      rows.push({
        id: item.id,
        restaurant_id: restaurant.id,
        kind,
        category: item.category ?? null,
        station: routing.station,
        station_label: routing.station_label ?? null,
        name: item.name,
        description: item.description ?? null,
        price: Number(item.price ?? 0),
        image_url: item.image ?? null,
        is_active: true,
        sort_order: sort,
      });
    };

    let sort = 0;
    (restaurant.menu?.drinks ?? []).forEach((d) => pushItem('drink', d as unknown, sort++));
    (restaurant.menu?.food ?? []).forEach((f) => pushItem('food', f as unknown, sort++));

    return rows;
  };

  const onSeed = async () => {
    alert('Seeding menu… (if you see this, the button click IS wired)');
    if (!activeRestaurant) {
      alert('No restaurant selected.');
      return;
    }

    setBusy(true);
    try {
      const rows = buildRows(activeRestaurant);
      await upsertRestaurantMenuItems(rows);
      alert(`✅ Seeded ${rows.length} menu items to Supabase for ${activeRestaurant.name}`);
    } catch (e) {
      console.error('Seed menu failed:', e);
      alert('❌ Failed to seed menu. Open DevTools Console to see the error.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div>
        <p className="text-sm font-semibold text-slate-900">Seed menu → Supabase</p>
        <p className="text-sm text-slate-600 mt-1">
          One-time import from mockRestaurants into Supabase restaurant_menu_items.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-700">
          Restaurant
          <select
            className="ml-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
          >
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 disabled:opacity-50"
          onClick={onSeed}
          disabled={!restaurantId || busy}
        >
          {busy ? 'Seeding…' : 'Seed menu'}
        </button>
      </div>

    </div>
  );
};
