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
  seats?: number;
  isVirtual?: boolean;
  available?: boolean;

  // ✅ REQUIRED for stationary floor plan
  x?: number;
  y?: number;
};

type Props = {
  title?: string;
  tables: OpsTableItem[];
  signals?: Record<string, OpsTableSignal>;
  selectedTableId?: string | null;
  onSelectTableId?: (id: string) => void;

  // FOH-like switches
  compact?: boolean;
  hideMeta?: boolean;
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function hasAnySignal(s?: OpsTableSignal) {
  if (!s) return false;
  return !!(s.hasRequest || s.hasOrder || s.inProcess || s.ready || s.pickingUp || s.delivered);
}

// Same seat-based sizing feel as the editor
function baseSizeForSeats(seats?: number) {
  const s = seats ?? 4;
  if (s <= 2) return 52;
  if (s <= 4) return 68;
  if (s <= 6) return 84;
  return 96;
}

function borderForSignal(s?: OpsTableSignal) {
  if (!s) return '#cbd5e1'; // slate-300-ish
  if (s.hasRequest) return '#f59e0b'; // amber-500
  if (s.hasOrder) return '#0ea5e9'; // sky-500
  if (s.inProcess) return '#a855f7'; // purple-500
  if (s.ready) return '#10b981'; // emerald-500
  if (s.pickingUp) return '#84cc16'; // lime-500
  if (s.delivered) return '#94a3b8'; // slate-400
  return '#cbd5e1';
}

function bgForSignal(s?: OpsTableSignal, available?: boolean) {
  if (available === false) return '#f8fafc'; // slate-50
  if (!s) return '#ffffff';
  if (s.hasRequest) return '#fffbeb'; // amber-50
  if (s.hasOrder) return '#f0f9ff'; // sky-50
  if (s.inProcess) return '#faf5ff'; // purple-50
  if (s.ready) return '#ecfdf5'; // emerald-50
  if (s.pickingUp) return '#f7fee7'; // lime-50
  if (s.delivered) return '#f8fafc'; // slate-50
  return '#ffffff';
}

export const OpsTableGrid = ({
  title,
  tables,
  signals = {},
  selectedTableId,
  onSelectTableId,
  compact = false,
  hideMeta = false,
}: Props) => {
  // Derive a canvas size from your saved x/y positions so we can clamp correctly.
  // This keeps tables stationary like the editor.
  const maxBase = Math.max(...tables.map((t) => baseSizeForSeats(t.seats)), 96);

  const maxX = Math.max(...tables.map((t) => (t.x ?? 0) + maxBase), 520);
  const maxY = Math.max(...tables.map((t) => (t.y ?? 0) + maxBase), 520);

  const canvasW = maxX;
  const canvasH = maxY;

  const canvasStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: 520,
    borderRadius: 16,
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    backgroundSize: `10px 10px`,
    backgroundImage:
      'linear-gradient(to right, rgba(148,163,184,0.20) 1px, transparent 1px),' +
      'linear-gradient(to bottom, rgba(148,163,184,0.20) 1px, transparent 1px)',
  };

  // In compact mode (when sidebar open), shrink inactive more.
  const inactiveOpacity = compact ? 0.28 : 0.38;

  return (
    <Card className="h-full w-full overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div className="h-full w-full overflow-hidden p-[15px]">
        <div style={canvasStyle}>
          {tables.map((t) => {
            const s = signals[t.id];
            const isSelected = !!selectedTableId && selectedTableId === t.id;

            const base = baseSizeForSeats(t.seats);
            const isActive = hasAnySignal(s);
            const isEmphasized = isSelected || isActive;

            // ✅ Stationary grow/shrink like “ops” mode in the floor plan view
            const size = isEmphasized
              ? Math.max(140, Math.round(base * 2.0))
              : Math.max(90, Math.round(base * 1.2));

            const opacity = isEmphasized ? 1 : inactiveOpacity;

            const left = clamp(t.x ?? 0, 0, Math.max(0, canvasW - size));
            const top = clamp(t.y ?? 0, 0, Math.max(0, canvasH - size));

            const borderColor = isSelected ? '#0f172a' : borderForSignal(s);
            const background = bgForSignal(s, t.available);

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTableId?.(t.id)}
                style={{
                  position: 'absolute',
                  left,
                  top,
                  width: size,
                  height: size,
                  opacity,
                  borderRadius: t.isVirtual ? 18 : 14,
                  border: `2px solid ${borderColor}`,
                  background,
                  boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)',
                  padding: 10,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'opacity 180ms ease, transform 180ms ease',
                }}
                title={t.label ?? t.id}
              >
                <div style={{ fontWeight: 700, fontSize: 14, lineHeight: '16px' }}>
                  {t.label ?? t.id}
                </div>

                {!hideMeta && (
                  <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
                    {t.isVirtual ? 'to-go' : t.seats ? `${t.seats} seats` : ''}
                  </div>
                )}
              </button>
            );
          })}

          {title ? <span className="sr-only">{title}</span> : null}
        </div>
      </div>
    </Card>
  );
};
