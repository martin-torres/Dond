// src/staff/SeedTablesToSupabase.tsx
import { useMemo, useState } from 'react';
import { mockRestaurants } from '../data/mockRestaurants';
import { upsertRestaurantTables, type RestaurantTableRow } from '../api/restaurantTablesApi';

type Props = {
  // Optional: if you already know which restaurant this owner screen is for
  restaurantId?: string;
  // Optional: hide the UI unless you explicitly allow it (manager-only gate)
  enabled?: boolean;
};

export function SeedTablesToSupabase(props: Props) {
  const enabled = props.enabled ?? false;

  const defaultRestaurantId = useMemo(() => {
    if (props.restaurantId) return props.restaurantId;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get('restaurantId');
      if (fromUrl) return fromUrl;
    }
    return mockRestaurants[0]?.id ?? '';
  }, [props.restaurantId]);

  const [restaurantId, setRestaurantId] = useState<string>(defaultRestaurantId);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>('');

  const selectedRestaurant = useMemo(
    () => mockRestaurants.find((r) => r.id === restaurantId) ?? null,
    [restaurantId]
  );

  if (!enabled) return null;

  const buildRows = (): RestaurantTableRow[] => {
    if (!selectedRestaurant) return [];
    return selectedRestaurant.tables.map((t) => ({
      id: t.id, // MUST match orders.table_id everywhere
      restaurant_id: selectedRestaurant.id,
      display_name: `${(t.location ?? 'Table').toString().replace(/^\w/, (c: string) => c.toUpperCase())} ${t.number}`,
      table_number: t.number ?? null,
      seats: t.seats ?? null,
      location: t.location ?? null,
      section: null,
      available: t.available ?? true,
      visible_to_customers: false, // management can enable later
      x: t.x ?? null,
      y: t.y ?? null,
    }));
  };

  const handleSeed = async () => {
    setMessage('');
    if (!selectedRestaurant) {
      setMessage('No restaurant selected.');
      return;
    }

    const rows = buildRows();
    if (rows.length === 0) {
      setMessage('No tables found to upload.');
      return;
    }

    setBusy(true);
    try {
      await upsertRestaurantTables(rows);
      console.log('✅ Seeded restaurant_tables to Supabase', {
        restaurantId: selectedRestaurant.id,
        count: rows.length,
      });
      setMessage(`Seeded ${rows.length} tables to Supabase for ${selectedRestaurant.id}`);
    } catch (err) {
      console.error('❌ Failed seeding restaurant_tables', err);
      setMessage('Failed to seed tables. Check console for error details.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, marginBottom: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Manager Tools</div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontSize: 12, opacity: 0.85 }}>Restaurant</label>
        <select
          value={restaurantId}
          onChange={(e) => setRestaurantId(e.target.value)}
          disabled={busy}
          style={{ padding: '6px 8px' }}
        >
          {mockRestaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name?.en ?? r.id}
            </option>
          ))}
        </select>

        <button
          onClick={handleSeed}
          disabled={busy || !selectedRestaurant}
          style={{ padding: '6px 10px', cursor: busy ? 'not-allowed' : 'pointer' }}
        >
          {busy ? 'Seeding…' : 'Seed tables → Supabase'}
        </button>
      </div>

      {message && <div style={{ marginTop: 8, fontSize: 12 }}>{message}</div>}
      <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
        This uploads tables from mockRestaurants into Supabase restaurant_tables. It does not expose tables to customers.
      </div>
    </div>
  );
}
