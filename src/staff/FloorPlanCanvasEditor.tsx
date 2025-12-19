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

  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // draft placement (hover until Confirm)
  const [draft, setDraft] = useState<DraftTable | null>(null);

  // defaults for new draft
  const [newShape, setNewShape] = useState<TableShape>('auto');
  const [newInteractive, setNewInteractive] = useState(true);

  const canvasRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [t, p] = await Promise.all([
          fetchRestaurantTables(restaurantId),
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

  const leftWidthOpen = 'clamp(280px, 22vw, 360px)';
  const rightWidthOpen = 'clamp(320px, 24vw, 420px)';
  const railWidth = '44px';

  const startDraft = () => {
    const id = getId();
    const next: DraftTable = {
      __draft: true,
      id,
      restaurant_id: restaurantId,
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

  const rotate = (target: { rotation: number | null }, dir: 'left' | 'right') => {
    const step = 22.5;
    const cur = Number(target.rotation ?? 0);
    const next = dir === 'left' ? cur - step : cur + step;
    const wrapped = ((next % 360) + 360) % 360;
    return Math.round(wrapped * 10) / 10; // keep 1 decimal clean
  };

  const canvasStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    backgroundSize: `${effectivePlan.grid_size}px ${effectivePlan.grid_size}px`,
    backgroundImage:
      'linear-gradient(to right, rgba(148,163,184,0.25) 1px, transparent 1px),' +
      'linear-gradient(to bottom, rgba(148,163,184,0.25) 1px, transparent 1px)',
  };

  const workspaceHeightStyle: React.CSSProperties = {
    height: 'calc(100dvh - 120px)', // header + padding buffer
  };

  const renderTableButton = (
    r: RestaurantTableRow,
    opts: { isDraft?: boolean } = {}
  ): JSX.Element => {
    const x = r.x ?? 0;
    const y = r.y ?? 0;
    const seats = r.seats ?? 4;
    const shape = safeShape(r.shape);
    const rotation = Number(r.rotation ?? 0);

    const geom = geometryFor(seats, shape);
    const w = geom.w;
    const h = geom.h;

    const left = clamp(x, 0, Math.max(0, effectivePlan.canvas_w - w));
    const top = clamp(y, 0, Math.max(0, effectivePlan.canvas_h - h));

    const isSelected = selectedId === r.id;
    const isPlaceholder = r.is_interactive === false;

    const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
      (e.currentTarget as any).setPointerCapture?.(e.pointerId);

      const startX = e.clientX;
      const startY = e.clientY;
      const startLeft = left;
      const startTop = top;

      const handleMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
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
          borderRadius: geom.borderRadius,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center',
          border: `2px solid ${isSelected ? '#0f172a' : isPlaceholder ? '#94a3b8' : '#16a34a'}`,
          background: opts.isDraft ? '#ffffffcc' : '#ffffff',
          boxShadow: opts.isDraft
            ? '0 10px 22px rgba(15, 23, 42, 0.18)'
            : '0 6px 16px rgba(15, 23, 42, 0.08)',
          padding: 10,
          textAlign: 'left',
          cursor: 'grab',
          userSelect: 'none',
          outline: 'none',
        }}
        title={r.display_name ?? r.id}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, lineHeight: '16px' }}>
              {r.display_name || r.id}
            </div>
            <div style={{ fontSize: 11, opacity: 0.85 }}>
              {isPlaceholder ? 'placeholder' : `${seats} seats`}
            </div>
            {opts.isDraft && (
              <div style={{ marginTop: 6, fontSize: 11, fontWeight: 800, color: '#0f172a' }}>
                ADD TABLE (not saved)
              </div>
            )}
          </div>

          {!opts.isDraft && (
            <button
              type="button"
              onClick={(ev) => {
                ev.stopPropagation();
                deleteTable(r.id);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              title="Delete"
            >
              ✕
            </button>
          )}
        </div>
      </button>
    );
  };

  const tablesSorted = useMemo(() => {
    return [...rows].sort((a, b) => (a.display_name ?? '').localeCompare(b.display_name ?? ''));
  }, [rows]);

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
          {/* LEFT SIDEBAR */}
          <div
            className="h-full flex-shrink-0 overflow-hidden"
            style={{ width: leftOpen ? leftWidthOpen : railWidth, transition: 'width 250ms' }}
          >
            <div className="h-full w-full overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 px-2 py-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => setLeftOpen((v) => !v)}
                  aria-label={leftOpen ? 'Collapse left sidebar' : 'Expand left sidebar'}
                  title={leftOpen ? 'Collapse' : 'Expand'}
                >
                  {leftOpen ? '←' : '→'}
                </button>

                {leftOpen && (
                  <div className="flex-1 px-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Tables</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{tablesSorted.length} items</p>
                  </div>
                )}
              </div>

              <div className="min-h-0 flex-1 overflow-hidden">
                {leftOpen && (
                  <div className="h-full flex flex-col overflow-hidden">
                    {/* Controls */}
                    <div className="p-3 space-y-3 border-b border-slate-200">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-700">New item defaults</p>

                        <div className="flex flex-wrap items-center gap-2">
                          <label className="flex items-center gap-2 text-xs text-slate-600">
                            <input
                              type="checkbox"
                              checked={newInteractive}
                              onChange={(e) => setNewInteractive(e.target.checked)}
                            />
                            Interactive table
                          </label>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-slate-600">Shape</span>
                          {(['auto', 'circle', 'rounded', 'rect', 'booth_u', 'booth_half_u'] as TableShape[]).map(
                            (s) => (
                              <IconBtn key={s} title={s} active={newShape === s} onClick={() => setNewShape(s)}>
                                <ShapeIcon shape={s} />
                              </IconBtn>
                            )
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={startDraft}
                          className="w-full inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                        >
                          + Add (draft)
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <label className="text-xs text-slate-600">
                          Grid
                          <input
                            type="number"
                            min={5}
                            value={effectivePlan.grid_size}
                            onChange={(e) => {
                              setPlanDirty(true);
                              setPlan((prev) => ({
                                ...(prev ?? {
                                  restaurant_id: restaurantId,
                                  canvas_w: 900,
                                  canvas_h: 520,
                                  grid_size: 10,
                                }),
                                grid_size: Number(e.target.value || 10),
                              }));
                            }}
                            className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1"
                          />
                        </label>
                        <label className="text-xs text-slate-600">
                          W
                          <input
                            type="number"
                            min={100}
                            value={effectivePlan.canvas_w}
                            onChange={(e) => {
                              setPlanDirty(true);
                              setPlan((prev) => ({
                                ...(prev ?? {
                                  restaurant_id: restaurantId,
                                  canvas_w: 900,
                                  canvas_h: 520,
                                  grid_size: 10,
                                }),
                                canvas_w: Number(e.target.value || 900),
                              }));
                            }}
                            className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1"
                          />
                        </label>
                        <label className="text-xs text-slate-600">
                          H
                          <input
                            type="number"
                            min={100}
                            value={effectivePlan.canvas_h}
                            onChange={(e) => {
                              setPlanDirty(true);
                              setPlan((prev) => ({
                                ...(prev ?? {
                                  restaurant_id: restaurantId,
                                  canvas_w: 900,
                                  canvas_h: 520,
                                  grid_size: 10,
                                }),
                                canvas_h: Number(e.target.value || 520),
                              }));
                            }}
                            className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1"
                          />
                        </label>
                      </div>
                    </div>

                    {/* List */}
                    <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-2">
                      {tablesSorted.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setSelectedId(t.id);
                            setDraft(null);
                            setRightOpen(true);
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm hover:bg-slate-50"
                          style={{
                            borderColor: selectedId === t.id ? '#0f172a' : '#e2e8f0',
                          }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-slate-900 truncate">
                                {t.display_name || t.id}
                              </div>
                              <div className="text-xs text-slate-500">
                                {t.is_interactive === false ? 'placeholder' : `${t.seats ?? 4} seats`}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">#{t.id.slice(0, 4)}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!leftOpen && <div className="h-full w-full" />}
              </div>
            </div>
          </div>

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

          {/* RIGHT SIDEBAR */}
          <div
            className="h-full flex-shrink-0 overflow-hidden"
            style={{ width: rightOpen ? rightWidthOpen : railWidth, transition: 'width 250ms' }}
          >
            <div className="h-full w-full overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 px-2 py-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => setRightOpen((v) => !v)}
                  aria-label={rightOpen ? 'Collapse right sidebar' : 'Expand right sidebar'}
                  title={rightOpen ? 'Collapse' : 'Expand'}
                >
                  {rightOpen ? '→' : '←'}
                </button>

                {rightOpen && (
                  <div className="flex-1 px-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                      {draft ? 'Add Table' : 'Selected'}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {draft?.display_name ?? selectedRow?.display_name ?? '—'}
                    </p>
                  </div>
                )}
              </div>

              <div className="min-h-0 flex-1 overflow-hidden">
                {rightOpen && (
                  <div className="h-full flex flex-col overflow-hidden p-3">
                    {/* If draft exists, edit draft fields. Else edit selected row. */}
                    {draft ? (
                      <div className="h-full flex flex-col overflow-hidden">
                        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                          <p className="text-xs font-semibold text-slate-700">Add Table settings (not saved yet)</p>

                          <div className="mt-3 space-y-3">
                            <label className="block text-xs text-slate-600">
                              Name
                              <input
                                value={draft.display_name ?? ''}
                                onChange={(e) => setDraft({ ...draft, display_name: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1"
                              />
                            </label>

                            <label className="flex items-center gap-2 text-xs text-slate-600">
                              <input
                                type="checkbox"
                                checked={draft.is_interactive !== false}
                                onChange={(e) => setDraft({ ...draft, is_interactive: e.target.checked })}
                              />
                              Usable table (interactive)
                            </label>

                            <label className="block text-xs text-slate-600">
                              Seats
                              <input
                                type="number"
                                min={0}
                                value={draft.seats ?? 0}
                                onChange={(e) => setDraft({ ...draft, seats: Number(e.target.value || 0) })}
                                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1"
                                disabled={draft.is_interactive === false}
                              />
                              {draft.is_interactive === false && (
                                <div className="mt-1 text-[11px] text-slate-500">
                                  Placeholders can keep seats at 0.
                                </div>
                              )}
                            </label>

                            <div className="space-y-2">
                              <p className="text-xs text-slate-600">Shape</p>
                              <div className="flex flex-wrap items-center gap-2">
                                {(
                                  ['auto', 'circle', 'rounded', 'rect', 'booth_u', 'booth_half_u'] as TableShape[]
                                ).map((s) => (
                                  <IconBtn
                                    key={s}
                                    title={s}
                                    active={safeShape(draft.shape) === s}
                                    onClick={() => setDraft({ ...draft, shape: s })}
                                  >
                                    <ShapeIcon shape={s} />
                                  </IconBtn>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-xs text-slate-600">Rotation (22.5° steps)</p>
                              <div className="flex items-center gap-2">
                                <IconBtn
                                  title="Rotate left"
                                  onClick={() => setDraft({ ...draft, rotation: rotate(draft, 'left') })}
                                >
                                  <RotateIcon dir="left" />
                                </IconBtn>
                                <IconBtn
                                  title="Rotate right"
                                  onClick={() => setDraft({ ...draft, rotation: rotate(draft, 'right') })}
                                >
                                  <RotateIcon dir="right" />
                                </IconBtn>
                                <span className="text-xs text-slate-600">
                                  {Number(draft.rotation ?? 0).toFixed(1)}°
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <label className="text-xs text-slate-600">
                                X
                                <input
                                  type="number"
                                  value={draft.x ?? 0}
                                  onChange={(e) => setDraft({ ...draft, x: Number(e.target.value || 0) })}
                                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1"
                                />
                              </label>
                              <label className="text-xs text-slate-600">
                                Y
                                <input
                                  type="number"
                                  value={draft.y ?? 0}
                                  onChange={(e) => setDraft({ ...draft, y: Number(e.target.value || 0) })}
                                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1"
                                />
                              </label>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                              <button
                                type="button"
                                onClick={cancelDraft}
                                className="flex-1 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={confirmDraft}
                                className="flex-1 inline-flex items-center justify-center rounded-xl border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                              >
                                Confirm / Set
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 text-[11px] text-slate-500">
                          Tip: Drag the draft onto the map first, then fine-tune rotation/seats/name here, then Confirm.
                        </div>
                      </div>
                    ) : selectedRow ? (
                      <div className="h-full flex flex-col overflow-hidden">
                        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                          <p className="text-xs font-semibold text-slate-700">Edit selected</p>

                          <div className="mt-3 space-y-3">
                            <label className="block text-xs text-slate-600">
                              Name
                              <input
                                value={selectedRow.display_name ?? ''}
                                onChange={(e) => updateRow(selectedRow.id, { display_name: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1"
                              />
                            </label>

                            <label className="flex items-center gap-2 text-xs text-slate-600">
                              <input
                                type="checkbox"
                                checked={selectedRow.is_interactive !== false}
                                onChange={(e) => updateRow(selectedRow.id, { is_interactive: e.target.checked })}
                              />
                              Usable table (interactive)
                            </label>

                            <label className="block text-xs text-slate-600">
                              Seats
                              <input
                                type="number"
                                min={0}
                                value={selectedRow.seats ?? 0}
                                onChange={(e) => updateRow(selectedRow.id, { seats: Number(e.target.value || 0) })}
                                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1"
                                disabled={selectedRow.is_interactive === false}
                              />
                            </label>

                            <div className="space-y-2">
                              <p className="text-xs text-slate-600">Shape</p>
                              <div className="flex flex-wrap items-center gap-2">
                                {(
                                  ['auto', 'circle', 'rounded', 'rect', 'booth_u', 'booth_half_u'] as TableShape[]
                                ).map((s) => (
                                  <IconBtn
                                    key={s}
                                    title={s}
                                    active={safeShape(selectedRow.shape) === s}
                                    onClick={() => updateRow(selectedRow.id, { shape: s })}
                                  >
                                    <ShapeIcon shape={s} />
                                  </IconBtn>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-xs text-slate-600">Rotation (22.5° steps)</p>
                              <div className="flex items-center gap-2">
                                <IconBtn
                                  title="Rotate left"
                                  onClick={() =>
                                    updateRow(selectedRow.id, { rotation: rotate(selectedRow, 'left') })
                                  }
                                >
                                  <RotateIcon dir="left" />
                                </IconBtn>
                                <IconBtn
                                  title="Rotate right"
                                  onClick={() =>
                                    updateRow(selectedRow.id, { rotation: rotate(selectedRow, 'right') })
                                  }
                                >
                                  <RotateIcon dir="right" />
                                </IconBtn>
                                <span className="text-xs text-slate-600">
                                  {Number(selectedRow.rotation ?? 0).toFixed(1)}°
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <label className="text-xs text-slate-600">
                                X
                                <input
                                  type="number"
                                  value={selectedRow.x ?? 0}
                                  onChange={(e) => updateRow(selectedRow.id, { x: Number(e.target.value || 0) })}
                                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1"
                                />
                              </label>
                              <label className="text-xs text-slate-600">
                                Y
                                <input
                                  type="number"
                                  value={selectedRow.y ?? 0}
                                  onChange={(e) => updateRow(selectedRow.id, { y: Number(e.target.value || 0) })}
                                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1"
                                />
                              </label>
                            </div>

                            <div className="pt-2">
                              <button
                                type="button"
                                onClick={() => deleteTable(selectedRow.id)}
                                className="w-full inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 text-[11px] text-slate-500">
                          Drag the table on the map to move it. This panel edits geometry + metadata.
                        </div>
                      </div>
                    ) : (
                      <div className="h-full rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                        <p className="text-sm text-slate-600">Select a table, or add a draft.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
