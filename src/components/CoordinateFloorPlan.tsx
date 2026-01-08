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

export const CoordinateFloorPlan = ({
  restaurantId: restaurantIdProp,
  title = 'Floor Plan',
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
    return onlyVisibleToCustomers ? base.filter((r) => r.visible_to_customers) : base;
  }, [rows, onlyVisibleToCustomers]);

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

  // Calculate coordinate conversion factors
  const aspectRatio = effectivePlan.canvas_w / effectivePlan.canvas_h;
  
  // Container styles for responsive coordinate-based floor plan
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio: aspectRatio.toString(),
    maxWidth: '800px',
    margin: '0 auto',
    borderRadius: '16px',
    border: '2px solid #e2e8f0',
    overflow: 'hidden',
    backgroundSize: `${effectivePlan.grid_size}px ${effectivePlan.grid_size}px`,
    backgroundImage:
      'linear-gradient(to right, rgba(148,163,184,0.3) 1px, transparent 1px),' +
      'linear-gradient(to bottom, rgba(148,163,184,0.3) 1px, transparent 1px)',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
  };

  // Table marker styles
  const getTableMarkerStyle = (table: RestaurantTableRow) => {
    // Convert absolute coordinates to percentages
    const leftPercent = (table.x ?? 0) / effectivePlan.canvas_w * 100;
    const topPercent = (table.y ?? 0) / effectivePlan.canvas_h * 100;

    // Calculate table size based on seats
    const baseSize = table.seats && table.seats <= 2 ? 40 : 
                     table.seats && table.seats <= 4 ? 50 : 
                     table.seats && table.seats <= 6 ? 60 : 70;
    
    const isActive = activeTableIds.includes(table.id);
    const isSelected = selectedTableId === table.id;

    let size = baseSize;
    let opacity = 1;

    // Ops mode: bigger tiles, dim + shrink inactive tables
    if (variant === 'ops') {
      const activeSize = Math.max(80, Math.round(baseSize * 1.8));
      const inactiveSize = Math.max(50, Math.round(baseSize * 1.2));
      size = isActive ? activeSize : inactiveSize;
      opacity = isActive ? 1 : 0.4;
    }

    return {
      position: 'absolute' as const,
      left: `${leftPercent}%`,
      top: `${topPercent}%`,
      width: `${size}px`,
      height: `${size}px`,
      opacity,
      transform: 'translate(-50%, -50%)', // Center on coordinate point
      borderRadius: '12px',
      border: isSelected ? '3px solid #0f172a' : '2px solid #cbd5e1',
      background: 'white',
      boxShadow: '0 6px 16px rgba(15, 23, 42, 0.15)',
      padding: '8px',
      textAlign: 'left' as const,
      cursor: onSelectTableId ? 'pointer' : 'default',
      transition: 'all 0.2s ease-in-out',
      zIndex: isSelected ? 10 : isActive ? 5 : 1,
    };
  };

  return (
    <Card className="p-6 border border-slate-200 shadow-lg space-y-4">
      <div className="space-y-1 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{title}</p>
        <h3 className="text-lg font-semibold text-gray-900">Coordinate-Based Floor Plan</h3>
        <p className="text-sm text-gray-600">
          Tables positioned at exact x,y coordinates • Grid size: {effectivePlan.grid_size}px
        </p>
        <p className="text-xs text-gray-500">
          Canvas: {effectivePlan.canvas_w} x {effectivePlan.canvas_h} • Aspect Ratio: {aspectRatio.toFixed(2)}
        </p>
      </div>

      <div style={containerStyle}>
        {visibleRows.map((r) => {
          const label = r.display_name ?? r.id;
          const seats = r.seats ?? 4;
          const isActive = activeTableIds.includes(r.id);
          const isSelected = selectedTableId === r.id;

          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelectTableId?.(r.id)}
              disabled={!onSelectTableId}
              style={getTableMarkerStyle(r)}
              className={`hover:shadow-lg hover:scale-105 ${
                isSelected ? 'ring-4 ring-gray-900 ring-opacity-50' : ''
              } ${isActive ? 'border-green-500' : ''}`}
              title={`Table ${label} - ${seats} seats`}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-sm font-bold text-gray-900 text-center leading-tight">
                  {label}
                </div>
                <div className="text-xs text-gray-600 text-center">
                  {seats} seats
                </div>
                <div className="text-xs text-gray-500 text-center mt-1">
                  ({r.x ?? 0}, {r.y ?? 0})
                </div>
              </div>
            </button>
          );
        })}
        
        {/* Coordinate system overlay labels */}
        <div className="absolute top-2 left-2 text-xs text-gray-600 bg-white bg-opacity-80 px-2 py-1 rounded">
          Origin (0,0)
        </div>
        <div className="absolute top-2 right-2 text-xs text-gray-600 bg-white bg-opacity-80 px-2 py-1 rounded">
          Max ({effectivePlan.canvas_w}, {effectivePlan.canvas_h})
        </div>
      </div>

      <div className="text-center text-sm text-gray-600">
        {visibleRows.length} tables visible • Click to select • Coordinates shown on hover
      </div>
    </Card>
  );
};
