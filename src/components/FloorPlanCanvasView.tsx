import { useEffect, useMemo, useState } from 'react';
import { Card } from './ui/card';
import { fetchRestaurantFloorPlan, type RestaurantFloorPlanRow } from '../api/restaurantFloorPlanApi';
import { fetchRestaurantTables, type RestaurantTableRow } from '../api/restaurantTablesApi';

type Props = {
  restaurantId?: string;
  title?: string;
  selectedTableId?: string | null;
  onSelectTableId?: (tableId: string) => void;
  onlyVisibleToCustomers?: boolean;
  variant?: 'customer' | 'ops';
  activeTableIds?: string[];
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const FloorPlanCanvasView = ({
  restaurantId: restaurantIdProp,
  title = 'Floor plan',
  selectedTableId,
  onSelectTableId,
  onlyVisibleToCustomers = false,
  variant = 'customer',
  activeTableIds = [],
}: Props) => {

  const restaurantId = useMemo(() => {
    if (restaurantIdProp) return restaurantIdProp;
    if (typeof window === 'undefined') return 'rest-one-maui';
    return new URLSearchParams(window.location.search).get('restaurantId') ?? 'rest-one-maui';
  }, [restaurantIdProp]);

  const [plan, setPlan] = useState<RestaurantFloorPlanRow | null>(null);
  const [rows, setRows] = useState<RestaurantTableRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  const visibleRows = useMemo(() => {
    const base = rows ?? [];
    return base;
  }, [rows]);

  if (!restaurantId) {
    return (
      <Card className="p-4 border border-slate-200 shadow-sm">
        <p className="text-sm text-gray-700">Missing restaurantId.</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-4 border border-slate-200 shadow-sm">
        <p className="text-sm text-gray-600">Loading floor plan…</p>
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
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{title}</p>
        <h3 className="text-lg font-semibold text-gray-900">View only</h3>
      </div>

      <div style={canvasStyle}>
        {visibleRows.map((r) => {
          const x = r.x ?? 0;
          const y = r.y ?? 0;
          const seats = r.seats ?? 4;

                    const baseSize = seats <= 2 ? 52 : seats <= 4 ? 68 : seats <= 6 ? 84 : 96;
          const isActive = activeTableIds.includes(r.id);

          let size = baseSize;
          let opacity = 1;

          // Ops mode: bigger tiles, dim + shrink inactive tables
          if (variant === 'ops') {
            const activeSize = Math.max(140, Math.round(baseSize * 2.0));
            const inactiveSize = Math.max(90, Math.round(baseSize * 1.2));
            size = isActive ? activeSize : inactiveSize;
            opacity = isActive ? 1 : 0.35;
          }

          const left = clamp(x, 0, Math.max(0, effectivePlan.canvas_w - size));
          const top = clamp(y, 0, Math.max(0, effectivePlan.canvas_h - size));

          const isSelected = !!selectedTableId && selectedTableId === r.id;
          const label = r.display_name ?? r.id;

          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelectTableId?.(r.id)}
              disabled={!onSelectTableId}
              style={{
                opacity,
                position: 'absolute',
                left,
                top,
                width: size,
                height: size,
                borderRadius: 14,
                border: isSelected ? '2px solid #0f172a' : '1px solid #cbd5e1',
                background: 'white',
                boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)',
                padding: 8,
                textAlign: 'left',
                cursor: onSelectTableId ? 'pointer' : 'default',
              }}
              title={label}
            >
              <div style={{ fontWeight: 700, fontSize: 12, lineHeight: 1.1 }}>{label}</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>{seats} seats</div>
            </button>
          );
        })}
      </div>
    </Card>
  );
};
