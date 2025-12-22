import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Card } from '../components/ui/card';
import { supabase } from '../lib/supabaseClient';
import {
  fetchRestaurantTablesBySlug,
  upsertRestaurantTables,
  type RestaurantTableRow,
} from '../api/restaurantTablesApi';
import {
  fetchRestaurantFloorPlan,
  upsertRestaurantFloorPlan,
  type RestaurantFloorPlanRow,
} from '../api/restaurantFloorPlanApi';
import { ManagerTablesPanel } from './ManagerTablesPanel';
import { SeedTablesToSupabase } from './SeedTablesToSupabase';

type Props = { restaurantId: string };

type TableShape = 'auto' | 'circle' | 'rounded' | 'rect' | 'booth_u' | 'booth_half_u';

type DraftTable = RestaurantTableRow & {
  __draft: true;
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const snap = (v: number, grid = 10) => Math.round(v / grid) * grid;

const getId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `tbl-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

// seat-based sizing (manager truth); shape can stretch it
function baseSizeForSeats(seats?: number) {
  const s = seats ?? 4;
  if (s <= 2) return 52;
  if (s <= 4) return 68;
  if (s <= 6) return 84;
  return 96;
}

function geometryFor(seats: number, shape: TableShape) {
  const base = baseSizeForSeats(seats);

  let w = base;
  let h = base;
  let borderRadius: number | string = 14;

  if (shape === 'circle') {
    borderRadius = 999;
  } else if (shape === 'rounded') {
    borderRadius = 18;
  } else if (shape === 'rect') {
    w = Math.round(base * 1.55);
    h = Math.round(base * 0.95);
    borderRadius = 14;
  } else if (shape === 'booth_u') {
    w = Math.round(base * 1.65);
    h = Math.round(base * 1.05);
    borderRadius = 16;
  } else if (shape === 'booth_half_u') {
    w = Math.round(base * 1.45);
    h = Math.round(base * 1.0);
    borderRadius = 16;
  }

  return { w, h, borderRadius };
}

function safeShape(v: any): TableShape {
  const s = String(v ?? 'auto');
  if (s === 'circle' || s === 'rounded' || s === 'rect' || s === 'booth_u' || s === 'booth_half_u')
    return s;
  return 'auto';
}

const IconBtn = ({
  active,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  title: string;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    className="inline-flex items-center justify-center rounded-lg border px-2 py-2 shadow-sm hover:bg-slate-50"
    style={{
      borderColor: active ? '#0f172a' : '#e2e8f0',
      background: active ? '#f1f5f9' : '#ffffff',
    }}
  >
    {children}
  </button>
);

const ShapeIcon = ({ shape }: { shape: TableShape }) => {
  if (shape === 'circle') {
    return <span className="block h-4 w-4 rounded-full border border-slate-400" />;
  }
  if (shape === 'rect') {
    return <span className="block h-3 w-5 rounded-md border border-slate-400" />;
  }
  if (shape === 'booth_u') {
    return (
      <span className="block h-4 w-5 rounded-md border border-slate-400 relative">
        <span className="absolute left-[2px] top-[2px] h-[10px] w-[14px] rounded-sm border border-slate-300" />
      </span>
    );
  }
  if (shape === 'booth_half_u') {
    return (
      <span className="block h-4 w-5 rounded-md border border-slate-400 relative">
        <span className="absolute left-[2px] top-[2px] h-[10px] w-[8px] rounded-sm border border-slate-300" />
      </span>
    );
  }
  if (shape === 'rounded') {
    return <span className="block h-4 w-4 rounded-lg border border-slate-400" />;
  }
  // auto
  return <span className="block h-4 w-4 rounded-md border border-slate-400" />;
};

const RotateIcon = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d={
        dir === 'left'
          ? 'M8 7H4V3M4 7C6.5 4.5 9.7 3 13.2 3C18.1 3 22 6.9 22 11.8C22 16.7 18.1 20.6 13.2 20.6C8.3 20.6 4.4 16.7 4.4 11.8'
          : 'M16 7H20V3M20 7C17.5 4.5 14.3 3 10.8 3C5.9 3 2 6.9 2 11.8C2 16.7 5.9 20.6 10.8 20.6C15.7 20.6 19.6 16.7 19.6 11.8'
      }
      stroke="#0f172a"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const FloorPlanCanvasEditor = ({ restaurantId }: Props) => {
  const [loading, setLoading] = useState(true);

  const [rows, setRows] = useState<RestaurantTableRow[]>([]);
  const [plan, setPlan] = useState<RestaurantFloorPlanRow | null>(null);

  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [planDirty, setPlanDirty] = useState(false);

  const [rightOpen, setRightOpen] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // draft placement (hover until Confirm)
  const [draft, setDraft] = useState<DraftTable | null>(null);

  // defaults for new draft
  const [newShape, setNewShape] = useState<TableShape>('auto');
  const [newInteractive, setNewInteractive] = useState(true);

  // Tab state
  const [activeTab, setActiveTab] = useState<'edit' | 'tables' | 'tools'>('edit');

  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Track the actual pixel size of the visible canvas so we can auto-fit the floorplan
  const [canvasPx, setCanvasPx] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const update = () => setCanvasPx({ w: el.clientWidth, h: el.clientHeight });
    update();

    // Auto-update when the sidebar opens/closes (canvas width changes)
    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, [rightOpen]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [t, p] = await Promise.all([
          fetchRestaurantTablesBySlug(restaurantId),
          fetchRestaurantFloorPlan(restaurantId),
        ]);
        if (!alive) return;

        // normalize new columns for old rows
        const normalized = (t ?? []).map((r) => ({
          ...r,
          shape: r.shape ?? 'auto',
          rotation: r.rotation ?? 0,
          is_interactive: typeof r.is_interactive === 'boolean' ? r.is_interactive : true,
        }));

        setRows(normalized);
        setPlan(p);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [restaurantId]);

  const effectivePlan = useMemo(
    () =>
      plan ?? {
        restaurant_id: restaurantId,
        canvas_w: 900,
        canvas_h: 520,
        grid_size: 10,
      },
    [plan, restaurantId]
  );

  const markDirty = (id: string) => setDirtyIds((prev) => new Set(prev).add(id));

  const selectedRow = useMemo(
    () => (selectedId ? rows.find((r) => r.id === selectedId) ?? null : null),
    [rows, selectedId]
  );

const rightWidthOpen = 'clamp(240px, 18vw, 315px)';
  const railWidth = '44px';

  const cycleGridSize = () => {
    const presets = [6, 8, 10, 12, 16, 20, 24, 32];
    const cur = Number(effectivePlan.grid_size ?? 10);
    const idx = Math.max(0, presets.indexOf(cur));
    const next = presets[(idx + 1) % presets.length];

    setPlanDirty(true);
    setPlan((prev) => ({
      ...(prev ?? {
        restaurant_id: restaurantId,
        canvas_w: 900,
        canvas_h: 520,
        grid_size: 10,
      }),
      grid_size: next,
    }));
  };

  const startDraft = () => {
    const id = getId();
    const next: DraftTable = {
      __draft: true,
      id,
      restaurant_id: restaurantId, // This should be resolved to UUID when saving
      restaurant_slug: restaurantId, // Store the slug for now
      display_name: newInteractive ? `Table ${rows.length + 1}` : `Stage`,
      table_number: null,
      seats: newInteractive ? 4 : 0,
      location: null,
      section: null,
      available: true,
      visible_to_customers: false,
      x: 10,
      y: 10,
      shape: newShape,
      rotation: 0,
      is_interactive: newInteractive,
    };
    setDraft(next);
    setSelectedId(null);
    setRightOpen(true);
  };

  const confirmDraft = async () => {
    if (!draft) return;

    const payload: RestaurantTableRow = {
      ...draft,
      __draft: undefined as any, // stripped
    } as any;

    // ensure numeric
    payload.rotation = Number(payload.rotation || 0);
    payload.shape = payload.shape ?? 'auto';

    setRows((prev) => [payload, ...prev]);
    setDraft(null);
    setSelectedId(payload.id);
    markDirty(payload.id);

    // save immediately on confirm (so other screens pick it up)
    await upsertRestaurantTables([payload]);
    setDirtyIds((prev) => {
      const next = new Set(prev);
      next.delete(payload.id);
      return next;
    });
  };

  const cancelDraft = () => {
    setDraft(null);
  };

  const deleteTable = async (id: string) => {
    if (!confirm('Delete this table/placeholder?')) return;

    // optimistic UI
    setRows((prev) => prev.filter((r) => r.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));

    const { error } = await supabase.from('restaurant_tables').delete().eq('id', id);
    if (error) {
      console.error('[FloorPlanCanvasEditor] delete failed', error);
      alert('Delete failed. Check console.');
    }
  };

  const saveAll = async () => {
    const dirty = rows.filter((r) => dirtyIds.has(r.id));
    try {
      if (dirty.length > 0) await upsertRestaurantTables(dirty);
      if (planDirty) await upsertRestaurantFloorPlan(effectivePlan);
      alert('Saved.');
      setDirtyIds(new Set());
      setPlanDirty(false);
    } catch (e) {
      console.error(e);
      alert('Save failed. Check console.');
    }
  };

  const updateRow = (id: string, patch: Partial<RestaurantTableRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    markDirty(id);
  };

  const rotate = (target: { rotation?: number | null }, dir: 'left' | 'right') => {
    const step = 22.5;
    const cur = Number(target.rotation ?? 0);
    const next = dir === 'left' ? cur - step : cur + step;
    const wrapped = ((next % 360) + 360) % 360;
    return Math.round(wrapped * 10) / 10; // keep 1 decimal clean
  };

  // Auto-fit the entire saved floorplan into the visible canvas space.
  // This guarantees the sidebar never "covers" tables—everything scales to remain visible.
  const viewScale = useMemo(() => {
    const w = canvasPx.w || 0;
    const h = canvasPx.h || 0;
    if (w <= 0 || h <= 0) return 1;

    const sx = w / Number(effectivePlan.canvas_w || 1);
    const sy = h / Number(effectivePlan.canvas_h || 1);

    // Never upscale above 1, and never shrink too far
    return Math.max(0.5, Math.min(1, sx, sy));
  }, [canvasPx.w, canvasPx.h, effectivePlan.canvas_w, effectivePlan.canvas_h]);

  const canvasStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    backgroundSize: `${effectivePlan.grid_size * viewScale}px ${effectivePlan.grid_size * viewScale}px`,
    backgroundImage:
      'linear-gradient(to right, rgba(148,163,184,0.25) 1px, transparent 1px),' +
      'linear-gradient(to bottom, rgba(148,163,184,0.25) 1px, transparent 1px)',
  };

  const workspaceHeightStyle: React.CSSProperties = {
    height: 'calc(100dvh - 120px)', // header + padding buffer
  };

  const renderTableButton = (r: RestaurantTableRow, opts: { isDraft?: boolean } = {}): JSX.Element => {
    const x = r.x ?? 0;
    const y = r.y ?? 0;
    const seats = r.seats ?? 4;
    const shape = safeShape(r.shape);
    const rotation = Number(r.rotation ?? 0);

    const geom = geometryFor(seats, shape);
    const baseW = geom.w;
    const baseH = geom.h;

    // Clamp in DATA space (saved x/y), then scale only for drawing
    const leftData = clamp(x, 0, Math.max(0, effectivePlan.canvas_w - baseW));
    const topData = clamp(y, 0, Math.max(0, effectivePlan.canvas_h - baseH));

    const left = leftData * viewScale;
    const top = topData * viewScale;
    const w = baseW * viewScale;
    const h = baseH * viewScale;

    const isSelected = selectedId === r.id;
    const isPlaceholder = r.is_interactive === false;

    const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
      (e.currentTarget as any).setPointerCapture?.(e.pointerId);

      const startX = e.clientX;
      const startY = e.clientY;
      const startLeft = leftData;
      const startTop = topData;

      const handleMove = (ev: PointerEvent) => {
        // Convert screen movement back into DATA movement when scaled
        const dx = (ev.clientX - startX) / viewScale;
        const dy = (ev.clientY - startY) / viewScale;

        const nx = snap(startLeft + dx, effectivePlan.grid_size);
        const ny = snap(startTop + dy, effectivePlan.grid_size);

        if (opts.isDraft) {
          setDraft((prev) => (prev ? { ...prev, x: nx, y: ny } : prev));
        } else {
          updateRow(r.id, { x: nx, y: ny });
        }
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
        onClick={() => {
          if (opts.isDraft) return;
          setSelectedId(r.id);
          setRightOpen(true);
        }}
        style={{
          position: 'absolute',
          left,
          top,
          width: w,
          height: h,
          borderRadius: geom.borderRadius * viewScale,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center',
          border: `2px solid ${isSelected ? '#0f172a' : isPlaceholder ? '#94a3b8' : '#16a34a'}`,
          background: opts.isDraft ? '#ffffffcc' : '#ffffff',
          boxShadow: opts.isDraft
            ? '0 10px 22px rgba(15, 23, 42, 0.18)'
            : '0 6px 16px rgba(15, 23, 42, 0.08)',
          padding: 10 * viewScale,
          textAlign: 'left',
          cursor: 'grab',
          userSelect: 'none',
          outline: 'none',
        }}
        title={r.display_name ?? r.id}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 * viewScale, lineHeight: `${16 * viewScale}px` }}>
              {r.display_name || r.id}
            </div>
            <div style={{ fontSize: 11 * viewScale, opacity: 0.85 }}>
              {isPlaceholder ? 'placeholder' : `${seats} seats`}
            </div>

            {opts.isDraft && (
              <div style={{ marginTop: 6 * viewScale, fontSize: 11 * viewScale, fontWeight: 800, color: '#0f172a' }}>
                ADD TABLE (not saved)
              </div>
            )}
          </div>

          {/* Removed the circular X delete button (it wasn't working + you don't want it) */}
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <Card className="h-full w-full overflow-hidden border border-slate-200 bg-white shadow-sm p-4">
        <p className="text-sm text-slate-600">Loading floor plan…</p>
      </Card>
    );
  }

  return (
    <Card className="h-full w-full overflow-hidden border border-slate-200 bg-white shadow-sm p-[15px]">
      <div className="h-full w-full overflow-hidden flex flex-col min-h-0" style={workspaceHeightStyle}>
        {/* TOP BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Manager</p>
            <h2 className="text-lg font-semibold text-gray-900">Floorplan editor</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">Unsaved: {dirtyIds.size + (planDirty ? 1 : 0)}</span>

            <button
              type="button"
              onClick={() => {
                // Add Table: uses existing draft flow and opens the right sidebar editor
                startDraft();
                setRightOpen(true);
              }}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
              title="Add a new table"
            >
              Add Table
            </button>

            <button
              type="button"
              onClick={saveAll}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
              title="Save all changes"
            >
              Save
            </button>
          </div>
        </div>

        {/* MAIN 3-COLUMN WORKSPACE */}
        <div className="min-h-0 flex-1 overflow-hidden flex gap-[12px]">
          {/* CENTER CANVAS */}
          <div className="h-full min-w-0 flex-1 overflow-hidden">
            <div className="h-full w-full overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm">
              <div
                ref={canvasRef}
                className="h-full w-full overflow-hidden"
                onMouseDown={(e) => {
                  // Only when you click the EMPTY canvas (not a table button)
                  if (e.target === e.currentTarget) {
                    // If you're not currently adding a table, clicking empty space should close the right panel
                    if (!draft) {
                      setRightOpen(false);
                      setSelectedId(null);
                    }
                  }
                }}
                style={{
                  ...canvasStyle,
                  width: '100%',
                  height: '100%',
                  minHeight: 300,
                }}
              >
                {/* existing tables */}
                {rows.map((r) => renderTableButton(r, { isDraft: false }))}

                {/* draft hover item */}
                {draft ? renderTableButton(draft, { isDraft: true }) : null}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR - Now handled by ManagerEditConsole */}
        </div>
      </div>
    </Card>
  );
};
