// src/staff/SeedTablesToSupabase.tsx
import { useMemo, useState, useEffect } from 'react';
import { upsertRestaurantTables, type RestaurantTableRow } from '../api/restaurantTablesApi';
import { getAllRestaurants, getCompleteRestaurant } from '../api/restaurantsApi';
import { type Restaurant, type Language } from '../types';

type Props = {
  // Optional: if you already know which restaurant this owner screen is for
  restaurantId?: string;
  // Optional: hide the UI unless you explicitly allow it (manager-only gate)
  enabled?: boolean;
};

export function SeedTablesToSupabase(props: Props) {
  const enabled = props.enabled ?? false;

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>('');

  // Load all restaurants on mount
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const allRestaurants = await getAllRestaurants();
        setRestaurants(allRestaurants);

        // Set default restaurant ID
        if (props.restaurantId) {
          setRestaurantId(props.restaurantId);
        } else if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const fromUrl = params.get('restaurantId');
          if (fromUrl) {
            setRestaurantId(fromUrl);
          } else if (allRestaurants.length > 0) {
            setRestaurantId(allRestaurants[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load restaurants:', error);
        setMessage('Failed to load restaurants');
      } finally {
        setLoading(false);
      }
    };

    if (enabled) {
      loadRestaurants();
    }
  }, [enabled, props.restaurantId]);

  const selectedRestaurant = useMemo(() => {
    return restaurants.find(r => r.id === restaurantId) || null;
  }, [restaurants, restaurantId]);

  if (!enabled) return null;
  if (loading) return <div>Loading restaurants...</div>;

  const buildRows = (): RestaurantTableRow[] => {
    if (!selectedRestaurant) return [];

    // For seeding, we need to create mock tables since real restaurants might not have tables yet
    // This creates a basic set of tables for testing
    // NOTE: available is now derived from orders + payment status, not stored
    const mockTables = [
      { id: 'table-1', number: 1, seats: 2, location: 'patio', x: 10, y: 10 },
      { id: 'table-2', number: 2, seats: 4, location: 'patio', x: 30, y: 10 },
      { id: 'table-3', number: 3, seats: 4, location: 'window', x: 50, y: 10 },
      { id: 'table-4', number: 4, seats: 6, location: 'middle', x: 30, y: 40 },
    ];

    return mockTables.map((t) => ({
      id: t.id,
      restaurant_id: selectedRestaurant.id,
      restaurant_slug: selectedRestaurant.slug || selectedRestaurant.id, // Include the text identifier
      display_name: `${t.location.charAt(0).toUpperCase() + t.location.slice(1)} ${t.number}`,
      table_number: t.number,
      seats: t.seats,
      location: t.location,
      section: null,
      // REMOVED: available - now derived from orders + payment status (canonical)
      visible_to_customers: false, // management can enable later
      x: t.x,
      y: t.y,
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
      setMessage(`Seeded ${rows.length} tables to Supabase for ${selectedRestaurant.name || selectedRestaurant.id}`);
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
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name || r.id}
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
        This creates sample tables for the selected restaurant in Supabase. Tables are not visible to customers until enabled in the floor plan editor.
      </div>
    </div>
  );
}
