import { Card } from './ui/card';

export type OpsTableSignal = {
  hasRequest?: boolean;
  hasOrder?: boolean;
  inProcess?: boolean;
  ready?: boolean;
  pickingUp?: boolean;
  delivered?: boolean;
};

export type OpsTableItem = {
  id: string;
  label?: string;
  isVirtual?: boolean;
  available?: boolean; // controls green vs red tile
};

type Props = {
  title?: string;
  tables: OpsTableItem[];
  signals?: Record<string, OpsTableSignal>;
  selectedTableId?: string | null;
  onSelectTableId?: (id: string) => void;
};

const statusText = (s?: OpsTableSignal) => {
  if (!s) return 'Idle';
  if (s.hasRequest) return 'Request';
  if (s.pickingUp) return 'Pickup';
  if (s.ready) return 'Ready';
  if (s.inProcess) return 'In process';
  if (s.hasOrder) return 'Order';
  return 'Idle';
};

const isActiveSignal = (s?: OpsTableSignal) => {
  if (!s) return false;
  return !!(s.hasRequest || s.hasOrder || s.inProcess || s.ready || s.pickingUp);
};

// Match old screenshot vibe: some tables are circular (Balcony/Patio/Barra)
const tileShapeClass = (label?: string, isVirtual?: boolean) => {
  if (isVirtual) return 'rounded-2xl';
  const name = (label ?? '').toLowerCase();
  if (
    name.includes('balcony') ||
    name.includes('patio') ||
    name.includes('barra') ||
    name.includes('bar')
  ) {
    return 'rounded-full';
  }
  return 'rounded-2xl';
};

type Tone = {
  border: string;
  bg: string;
  text: string;
  pillBg: string;
  pillText: string;
};

// Green tiles by default, red tiles if not available
const toneFor = (available: boolean | undefined, s?: OpsTableSignal): Tone => {
  if (available === false) {
    return {
      border: 'border-rose-400',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      pillBg: 'bg-rose-100',
      pillText: 'text-rose-700',
    };
  }

  if (s?.hasRequest) {
    return {
      border: 'border-emerald-500',
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      pillBg: 'bg-amber-100',
      pillText: 'text-amber-700',
    };
  }
  if (s?.inProcess) {
    return {
      border: 'border-emerald-500',
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      pillBg: 'bg-rose-100',
      pillText: 'text-rose-700',
    };
  }
  if (s?.ready) {
    return {
      border: 'border-emerald-500',
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      pillBg: 'bg-emerald-100',
      pillText: 'text-emerald-700',
    };
  }
  if (s?.pickingUp) {
    return {
      border: 'border-emerald-500',
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      pillBg: 'bg-indigo-100',
      pillText: 'text-indigo-700',
    };
  }
  if (s?.hasOrder) {
    return {
      border: 'border-emerald-500',
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      pillBg: 'bg-sky-100',
      pillText: 'text-sky-700',
    };
  }

  // Idle (still green tile)
  return {
    border: 'border-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-900',
    pillBg: 'bg-slate-100',
    pillText: 'text-slate-600',
  };
};

export const OpsTableGrid = ({
  title = 'Ops tables',
  tables,
  signals = {},
  selectedTableId,
  onSelectTableId,
}: Props) => {
  const tableCount = tables.length;

  return (
    <Card className="p-4 space-y-3 border border-slate-200 shadow-sm">
      {/* Red dashed boundary + soft background like old screenshot */}
      <div className="rounded-2xl border-2 border-dashed border-rose-300 p-4 bg-gradient-to-b from-slate-50 to-indigo-50">
        {/* Header row like screenshot */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-600">FLOOR PLAN</div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-600">
            TABLES: {tableCount} • FILTER: ALL TABLES
          </div>
        </div>

        {/* 7 columns “board” layout */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3">
          {tables.map((t) => {
            const s = signals[t.id];
            const active = isActiveSignal(s);
            const status = t.isVirtual ? 'TO-GO' : statusText(s);
            const selected = !!selectedTableId && selectedTableId === t.id;

            const shape = tileShapeClass(t.label, t.isVirtual);
            const tone = toneFor(t.available, s);

            // inactive dim (but not invisible)
            const opacity = selected ? 1 : active ? 1 : 0.65;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTableId?.(t.id)}
                disabled={!onSelectTableId}
                className={[
                  'w-full h-[120px] relative',
                  'border-2 shadow-sm hover:shadow-md transition-shadow',
                  shape,
                  tone.border,
                  tone.bg,
                  selected ? 'ring-2 ring-slate-900/20' : '',
                ].join(' ')}
                style={{ opacity }}
                title={t.label ?? t.id}
              >
                <div className="h-full p-3 flex flex-col justify-between">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className={['font-extrabold text-sm leading-tight', tone.text].join(' ')}>
                      {t.label ?? 'Table'}
                    </div>

                    <div className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                      {status}
                    </div>
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-end justify-between gap-2">
                    {!active && !t.isVirtual ? (
                      <div className="text-xs text-slate-500">No active tickets</div>
                    ) : (
                      <div className="text-xs text-slate-500">{t.isVirtual ? 'To-go' : 'Active'}</div>
                    )}

                    <span
                      className={[
                        'inline-flex items-center rounded-full px-2 py-1 text-xs font-bold shadow-sm border',
                        tone.pillBg,
                        tone.pillText,
                        'border-white/70',
                      ].join(' ')}
                    >
                      {status}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* minimal footer label */}
      <div className="text-xs text-slate-500">{title}</div>
    </Card>
  );
};
