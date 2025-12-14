import { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '../components/ui/card';
import { supabase } from '../lib/supabaseClient';
import {
  fetchRestaurantTables,
  upsertRestaurantTables,
  type RestaurantTableRow,
} from '../api/restaurantTablesApi';
import {
  fetchRestaurantFloorPlan,
  upsertRestaurantFloorPlan,
  type RestaurantFloorPlanRow,
} from '../api/restaurantFloorPlanApi';

type Props = { restaurantId: string };

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const getId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `tbl-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const FloorPlanCanvasEditor = ({ restaurantId }: Props) => {
  const [plan, setPlan] = useState<RestaurantFloorPlanRow | null>(null);
  const [rows, setRows] = useState<RestaurantTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const effectivePlan = useMemo(
    () =>
      plan ?? {
        restaurant_id: restaurantId,
        grid_size: 10,
        canvas_w: 100,
        canvas_h: 100,
      },
    [plan, restaurantId]
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!restaurantId) return;
      setLoading(true);
      try {
        const [p, t] = await Promise.all([
          fetchRestaurantFloorPlan(restaurantId),
          fetchRestaurantTables(restaurantId),
        ]);
        if (cancelled) return;
        setPlan(p);
        setRows(t);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  const snap = (value: number) => {
    const g = Math.max(1, effectivePlan.grid_size || 1);
    return Math.round(value / g) * g;
  };

  const markDirty = (id: string) => {
    setDirtyIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const updateRow = (id: string, patch: Partial<RestaurantTableRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    markDirty(id);
  };

  const addTable = () => {
    const id = getId();
    const next: RestaurantTableRow = {
      id,
      restaurant_id: restaurantId,
      display_name: `Table ${rows.length + 1}`,
      table_number: null,
      seats: 4,
      location: null,
      section: null,
      available: true,
      visible_to_customers: false,
      x: 10,
      y: 10,
    };
    setRows((prev) => [next, ...prev]);
    markDirty(id);
  };

  const deleteTable = async (id: string) => {
    if (!confirm('Delete this table?')) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    setDirtyIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    const { error } = await supabase.from('restaurant_tables').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete table', error);
      alert('Failed to delete table in Supabase.');
    }
  };

  const save = async () => {
    try {
      await upsertRestaurantFloorPlan({
        restaurant_id: restaurantId,
        grid_size: effectivePlan.grid_size,
        canvas_w: effectivePlan.canvas_w,
        canvas_h: effectivePlan.canvas_h,
      });

      const dirty = rows.filter((r) => dirtyIds.has(r.id));
      await upsertRestaurantTables(dirty.length ? dirty : rows);

      setDirtyIds(new Set());
      alert('Saved.');
    } catch (e) {
      console.error('Save failed', e);
      alert('Save failed. Check connection and try again.');
    }
  };

  if (!restaurantId) {
    return (
      <Card className="p-4 border border-slate-200 shadow-sm">
        <p className="text-sm text-gray-700">
          Missing restaurantId. Open:
        </p>
        <p className="text-sm font-semibold mt-1">
          /manager/edit?restaurantId=YOUR_RESTAURANT_ID
        </p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-4 border border-slate-200 shadow-sm">
        <p className="text-sm text-gray-600">Loading floor plan editor…</p>
      </Card>
    );
  }

  const canvasStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: 520,
    borderRadius: 16,
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    backgroundSize: `${effectivePlan.grid_size}px ${effectivePlan.grid_size}px`,
    backgroundImage:
      'linear-gradient(to right, rgba(148,163,184,0.25) 1px, transparent 1px),' +
      'linear-gradient(to bottom, rgba(148,163,184,0.25) 1px, transparent 1px)',
  };

  return (
    <Card className="p-4 border border-slate-200 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Floor plan</p>
          <h3 className="text-lg font-semibold text-gray-900">Drag tables • Snap to grid</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addTable}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50"
          >
            + Add table
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            Save
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
        <label className="flex items-center gap-2">
          Grid
          <input
            type="number"
            min={1}
            value={effectivePlan.grid_size}
            onChange={(e) =>
              setPlan((prev) => ({
                ...(prev ?? { restaurant_id: restaurantId, canvas_w: 100, canvas_h: 100, grid_size: 10 }),
                grid_size: Number(e.target.value || 10),
              }))
            }
            className="w-20 rounded-lg border border-slate-200 px-2 py-1"
          />
        </label>

        <label className="flex items-center gap-2">
          Canvas W
          <input
            type="number"
            min={10}
            value={effectivePlan.canvas_w}
            onChange={(e) =>
              setPlan((prev) => ({
                ...(prev ?? { restaurant_id: restaurantId, canvas_w: 100, canvas_h: 100, grid_size: 10 }),
                canvas_w: Number(e.target.value || 100),
              }))
            }
            className="w-24 rounded-lg border border-slate-200 px-2 py-1"
          />
        </label>

        <label className="flex items-center gap-2">
          Canvas H
          <input
            type="number"
            min={10}
            value={effectivePlan.canvas_h}
            onChange={(e) =>
              setPlan((prev) => ({
                ...(prev ?? { restaurant_id: restaurantId, canvas_w: 100, canvas_h: 100, grid_size: 10 }),
                canvas_h: Number(e.target.value || 100),
              }))
            }
            className="w-24 rounded-lg border border-slate-200 px-2 py-1"
          />
        </label>

        <span className="text-xs text-slate-500">Unsaved: {dirtyIds.size}</span>
      </div>

      <div ref={canvasRef} style={canvasStyle}>
        {rows.map((r) => {
          const x = r.x ?? 0;
          const y = r.y ?? 0;
          const seats = r.seats ?? 4;

          const size = seats <= 2 ? 52 : seats <= 4 ? 68 : seats <= 6 ? 84 : 96;

          const left = clamp(x, 0, Math.max(0, effectivePlan.canvas_w - size));
          const top = clamp(y, 0, Math.max(0, effectivePlan.canvas_h - size));
          const isDirty = dirtyIds.has(r.id);

          const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
            (e.currentTarget as any).setPointerCapture?.(e.pointerId);

            const startX = e.clientX;
            const startY = e.clientY;
            const startLeft = left;
            const startTop = top;

            const handleMove = (ev: PointerEvent) => {
              const dx = ev.clientX - startX;
              const dy = ev.clientY - startY;
              updateRow(r.id, { x: snap(startLeft + dx), y: snap(startTop + dy) });
            };

            const handleUp = () => {
              window.removeEventListener('pointermove', handleMove);
              window.removeEventListener('pointerup', handleUp);
            };

            window.addEventListener('pointermove', handleMove);
            window.addEventListener('pointerup', handleUp);
          };

          return (
            <button
              key={r.id}
              type="button"
              onPointerDown={onPointerDown}
              style={{
                position: 'absolute',
                left,
                top,
                width: size,
                height: size,
                borderRadius: 14,
                border: `2px solid ${r.available ? '#16a34a' : '#f97373'}`,
                background: r.available ? '#dcfce7' : '#fee2e2',
                color: r.available ? '#14532d' : '#991b1b',
                boxShadow: isDirty ? '0 0 0 4px rgba(16,185,129,0.35)' : '0 6px 16px rgba(15,23,42,0.10)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 8,
                cursor: 'grab',
                userSelect: 'none',
              }}
              title="Drag to move"
            >
              <div className="flex items-center justify-between gap-2">
                <div style={{ fontWeight: 800, fontSize: 12, lineHeight: 1.1 }}>{r.display_name}</div>
                <button
                  type="button"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    void deleteTable(r.id);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  title="Delete"
                >
                  ✕
                </button>
              </div>

              <div style={{ fontSize: 11, opacity: 0.85 }}>{seats} seats</div>
            </button>
          );
        })}
      </div>
    </Card>
  );
};
