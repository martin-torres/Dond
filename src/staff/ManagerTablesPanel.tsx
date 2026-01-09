import { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  fetchRestaurantTables,
  upsertRestaurantTables,
  type RestaurantTableRow,
} from '../api/restaurantTablesApi';

type Props = {
  enabled: boolean; // only show after PIN unlock
};

export function ManagerTablesPanel({ enabled }: Props) {
  const restaurantId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    return params.get('restaurantId') ?? '';
  }, []);

  const [rows, setRows] = useState<RestaurantTableRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  // Add form
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newSeats, setNewSeats] = useState<number>(4);
  const [newLocation, setNewLocation] = useState('main');

  const load = async () => {
    setMsg('');
    if (!restaurantId) {
      setRows([]);
      setMsg('Missing restaurantId in URL. Example: /manager?restaurantId=rest-one-maui');
      return;
    }
    setBusy(true);
    try {
      const data = await fetchRestaurantTables(restaurantId);
      setRows(data);
    } catch (e) {
      setMsg('Failed to load restaurant tables (see console).');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, restaurantId]);

  if (!enabled) return null;

  const toggleVisible = async (id: string) => {
    const target = rows.find((r) => r.id === id);
    if (!target) return;

    const updated: RestaurantTableRow = {
      ...target,
      visible_to_customers: !target.visible_to_customers,
    };

    // Optimistic UI
    setRows((prev) => prev.map((r) => (r.id === id ? updated : r)));

    try {
      await upsertRestaurantTables([updated]);
    } catch (e) {
      // rollback if error
      setRows((prev) => prev.map((r) => (r.id === id ? target : r)));
      setMsg('Failed to update. Check console.');
    }
  };
   
    const updateRowField = (id: string, patch: Partial<RestaurantTableRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const saveRow = async (id: string) => {
    setMsg('');
    const row = rows.find((r) => r.id === id);
    if (!row) return;

    setBusy(true);
    try {
      await upsertRestaurantTables([row]);
      setMsg(`Saved ${row.display_name}`);
      setMsg(`Saved ${row.display_name}`);
    } catch (e) {
      console.error('Failed to save table row', e);
      setMsg('Failed to save table (see console).');
    } finally {
      setBusy(false);
    }
  };

  const addTable = async () => {
    setMsg('');
    if (!restaurantId) {
      setMsg('Missing restaurantId in URL.');
      return;
    }
    const id = newId.trim();
    const display = newName.trim();
    if (!id || !display) {
      setMsg('Table ID and Display Name are required.');
      return;
    }

    const row: RestaurantTableRow = {
      id,
      restaurant_id: restaurantId,
      display_name: display,
      table_number: null,
      seats: Number.isFinite(newSeats) ? newSeats : 4,
      location: newLocation || null,
      section: null,
      // REMOVED: available - now derived from orders + payment status (canonical)
      visible_to_customers: false,
      x: null,
      y: null,
    };

    setBusy(true);
    try {
      await upsertRestaurantTables([row]);
      setNewId('');
      setNewName('');
      await load();
      setMsg(`Added table ${row.id}`);
    } catch (e) {
      setMsg('Failed to add table (see console).');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-4 space-y-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Manager</p>
          <h2 className="text-lg font-semibold text-gray-900">Tables</h2>
          <p className="text-sm text-gray-600">
            Restaurant: <span className="font-mono">{restaurantId || '(missing)'}</span>
          </p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={busy}>
          Refresh
        </Button>
      </div>

      {msg && <div className="text-sm text-rose-700">{msg}</div>}

      <div className="rounded-md border p-3 space-y-2">
        <div className="text-sm font-semibold">Add Table</div>
        <div className="grid gap-2 md:grid-cols-4">
          <input
            className="rounded-md border px-3 py-2"
            placeholder="table_id (e.g. bar-a1)"
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
          />
          <input
            className="rounded-md border px-3 py-2"
            placeholder="Display name (e.g. Bar A1)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            className="rounded-md border px-3 py-2"
            type="number"
            min={1}
            placeholder="Seats"
            value={newSeats}
            onChange={(e) => setNewSeats(parseInt(e.target.value || '4', 10))}
          />
          <input
            className="rounded-md border px-3 py-2"
            placeholder="Location (e.g. patio)"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
          />
        </div>
        <Button onClick={() => void addTable()} disabled={busy}>
          Add
        </Button>
      </div>

      <div className="space-y-2">
        {rows.length === 0 ? (
          <div className="text-sm text-gray-500">No tables found.</div>
        ) : (
          rows.map((r) => (
            <div
              key={r.id}
              className="rounded-md border p-3 bg-white space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-gray-500 font-mono">{r.id}</div>
                  <div className="text-xs text-gray-500">
                    restaurant_id: <span className="font-mono">{r.restaurant_id}</span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap justify-end">
                  <Button
                    variant="outline"
                    onClick={() => void saveRow(r.id)}
                    disabled={busy}
                  >
                    Save
                  </Button>

                  <Button
                    variant={r.visible_to_customers ? 'default' : 'outline'}
                    onClick={() => void toggleVisible(r.id)}
                    disabled={busy}
                  >
                    {r.visible_to_customers ? 'Visible to customers' : 'Hidden from customers'}
                  </Button>
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-4">
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Display name</div>
                  <input
                    className="w-full rounded-md border px-3 py-2"
                    value={r.display_name ?? ''}
                    onChange={(e) => updateRowField(r.id, { display_name: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Location</div>
                  <input
                    className="w-full rounded-md border px-3 py-2"
                    value={r.location ?? ''}
                    onChange={(e) => updateRowField(r.id, { location: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Seats</div>
                  <input
                    className="w-full rounded-md border px-3 py-2"
                    type="number"
                    min={0}
                    value={r.seats ?? 0}
                    onChange={(e) =>
                      updateRowField(r.id, { seats: parseInt(e.target.value || '0', 10) })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-gray-500">Table number</div>
                  <input
                    className="w-full rounded-md border px-3 py-2"
                    type="number"
                    value={r.table_number ?? ''}
                    onChange={(e) =>
                      updateRowField(r.id, {
                        table_number:
                          e.target.value === '' ? null : parseInt(e.target.value, 10),
                      })
                    }
                  />
                </div>
              </div>

              {/* REMOVED: Available checkbox - availability is now derived from orders + payment status */}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
