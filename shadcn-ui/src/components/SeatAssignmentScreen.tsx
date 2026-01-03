import { useMemo, useState } from 'react';
import { Table, Language } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';

type TableShape = 'round' | 'rounded-rectangle' | 'long' | 'booth';

const getTableShape = (table: Table): TableShape => {
  if (table.location === 'window' && table.seats <= 4) return 'booth';
  if (table.location === 'balcony' || table.seats <= 4) return 'round';
  if (table.seats <= 6) return 'rounded-rectangle';
  return 'long';
};

const getTablePhoto = (shape: TableShape, location: Table['location']) => {
  if (shape === 'booth')
    return 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80';
  if (shape === 'round')
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80';
  if (shape === 'long')
    return 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80';
  if (location === 'patio')
    return 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80';
  return 'https://images.unsplash.com/photo-1449247613801-ab06418e2861?auto=format&fit=crop&w=900&q=80';
};

const generateSeatPositions = (count: number, shape: TableShape) => {
  if (count <= 0) return [];

  if (shape === 'round') {
    const tableRadius = 20;
    const seatRadius = tableRadius + 16;
    return Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
      return {
        left: 50 + Math.cos(angle) * seatRadius,
        top: 50 + Math.sin(angle) * seatRadius,
        angle: (angle * 180) / Math.PI,
      };
    });
  }

  if (shape === 'booth') {
    const radius = 28;
    const seatRadius = radius + 14;
    const centerY = 58;
    const seats = Math.max(count, 2);
    return Array.from({ length: count }, (_, index) => {
      const angleStart = Math.PI * 1.05;
      const angleEnd = Math.PI * -0.05;
      const angle =
        count === 1
          ? (angleStart + angleEnd) / 2
          : angleStart + (index / (seats - 1)) * (angleEnd - angleStart);
      return {
        left: 50 + Math.cos(angle) * seatRadius,
        top: centerY + Math.sin(angle) * seatRadius,
        angle: (angle * 180) / Math.PI,
      };
    });
  }

  const rect = shape === 'long'
    ? { left: 20, right: 80, top: 24, bottom: 64 }
    : { left: 26, right: 74, top: 30, bottom: 70 };
  const width = rect.right - rect.left;
  const height = rect.bottom - rect.top;
  const perimeter = 2 * (width + height);
  const offset = 6;

  return Array.from({ length: count }, (_, index) => {
    const distance = (index / count) * perimeter;
    if (distance <= width) {
      return {
        left: rect.left + distance,
        top: rect.top - offset,
        angle: 0,
      };
    }
    if (distance <= width + height) {
      return {
        left: rect.right + offset,
        top: rect.top + (distance - width),
        angle: 90,
      };
    }
    if (distance <= 2 * width + height) {
      return {
        left: rect.right - (distance - width - height),
        top: rect.bottom + offset,
        angle: 180,
      };
    }
    return {
      left: rect.left - offset,
      top: rect.bottom - (distance - 2 * width - height),
      angle: -90,
    };
  });
};

interface SeatAssignmentScreenProps {
  table: Table;
  language: Language;
  onComplete: (assignments: string[]) => void;
}

interface SeatAssignment {
  seatNumber: number;
  name: string;
}

export function SeatAssignmentScreen({ table, language, onComplete }: SeatAssignmentScreenProps) {
  const [assignments, setAssignments] = useState<SeatAssignment[]>(() =>
    Array.from({ length: table.seats }, (_, index) => ({
      seatNumber: index + 1,
      name: index === 0 ? t('seatLabelMe', language) : '',
    }))
  );
  const [activeSeat, setActiveSeat] = useState(0);

  const tableShape = useMemo(() => getTableShape(table), [table]);
  const seatPositions = useMemo(
    () => generateSeatPositions(assignments.length, tableShape),
    [assignments.length, tableShape]
  );
  const tablePhoto = useMemo(
    () => getTablePhoto(tableShape, table.location),
    [tableShape, table.location]
  );
  const shapeLabel = useMemo(() => {
    switch (tableShape) {
      case 'round':
        return t('tableShapeRound', language);
      case 'booth':
        return t('tableShapeBooth', language);
      case 'rounded-rectangle':
        return t('tableShapeChef', language);
      case 'long':
      default:
        return t('tableShapeLong', language);
    }
  }, [tableShape, language]);

  const updateSeatName = (index: number, name: string) => {
    setAssignments((prev) =>
      prev.map((seat, seatIndex) => (seatIndex === index ? { ...seat, name } : seat))
    );
  };

  const handleAssignToMe = (index: number) => {
    updateSeatName(index, t('seatLabelMe', language));
  };

  const handleSkip = () => {
    onComplete(assignments.map((seat) => seat.name));
  };

  const handleSave = () => {
    onComplete(assignments.map((seat) => seat.name));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 pb-32">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">{t('seatSelectionTitle', language)}</p>
          <h1 className="text-3xl font-semibold text-gray-900">{t('selectTable', language)} #{table.number}</h1>
          <p className="text-gray-600 max-w-2xl">{t('seatSelectionSubtitle', language)}</p>
        </div>

        <Card className="p-6 grid gap-6 lg:grid-cols-2 bg-white/85 backdrop-blur border-white/70">
          <div className="relative h-80 rounded-3xl overflow-hidden border border-white/40 shadow-inner">
            <img
              src={tablePhoto}
              alt="table ambiance"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/10" />
            <div className="relative z-10 h-full">
              <div
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-white/80 shadow-2xl ${
                  tableShape === 'round'
                    ? 'w-44 h-44 rounded-full bg-white/30'
                    : tableShape === 'booth'
                    ? 'w-44 h-44 rounded-full bg-white/30'
                    : tableShape === 'rounded-rectangle'
                    ? 'w-56 h-36 rounded-[45px] bg-white/25'
                    : 'w-64 h-32 rounded-[35px] bg-white/25'
                }`}
                style={
                  tableShape === 'booth'
                    ? { clipPath: 'polygon(0% 0%, 100% 0%, 100% 70%, 65% 100%, 0% 100%)' }
                    : undefined
                }
              />

              {seatPositions.map((position, index) => {
                const rotation = position.angle ?? 0;
                return (
                  <button
                    key={assignments[index].seatNumber}
                    onClick={() => setActiveSeat(index)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-16 h-7 rounded-xl border-2 flex items-center justify-center text-[10px] font-semibold transition-all backdrop-blur ${
                      activeSeat === index
                        ? 'bg-white text-slate-900 border-sky-500 shadow-xl ring-2 ring-sky-200'
                        : assignments[index].name
                        ? 'bg-sky-500/90 text-white border-sky-600 shadow'
                        : 'bg-white/80 text-slate-600 border-white/70'
                    }`}
                    style={{
                      left: `${position.left}%`,
                      top: `${position.top}%`,
                      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                    }}
                  >
                    <div
                      className="flex flex-col items-center leading-tight"
                      style={{ transform: `rotate(${-rotation}deg)` }}
                    >
                      <span className="text-[11px] font-bold">
                        {t('seat', language)} {assignments[index].seatNumber}
                      </span>
                      <span className="text-[10px] font-normal truncate">
                        {assignments[index].name
                          ? assignments[index].name.length > 6
                            ? assignments[index].name.slice(0, 6) + '…'
                            : assignments[index].name
                          : ''}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                {shapeLabel} • {table.seats} {t('seats', language)}
              </p>
            </div>
            {assignments.map((seat, index) => (
              <div
                key={seat.seatNumber}
                className={`rounded-2xl border p-4 transition-all backdrop-blur ${
                  activeSeat === index
                    ? 'border-sky-500 bg-white shadow-xl ring-1 ring-sky-200'
                    : 'border-white/70 bg-white/85'
                }`}
                onClick={() => setActiveSeat(index)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {t('seat', language)} #{seat.seatNumber}{' '}
                      {index === 0 ? '• ' + t('seatLabelMe', language) : ''}
                    </p>
                    <p className={`text-xs ${activeSeat === index ? 'text-slate-500' : 'text-gray-500'}`}>
                      {seat.name ? seat.name : t('seatNamePlaceholder', language)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={activeSeat === index ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleAssignToMe(index);
                      }}
                    >
                      {t('assignToMe', language)}
                    </Button>
                  </div>
                </div>
                {activeSeat === index && (
                  <div className="mt-4 space-y-2">
                    <Input
                      value={seat.name}
                      onChange={(event) => updateSeatName(index, event.target.value)}
                      placeholder={t('seatNamePlaceholder', language)}
                      className="bg-slate-50 text-gray-900 placeholder:text-gray-400 border-slate-200 focus-visible:border-slate-900 focus-visible:ring-slate-100"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                        onClick={(event) => {
                          event.stopPropagation();
                          updateSeatName(index, '');
                        }}
                      >
                        {t('clearSeat', language)}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-slate-900 text-white border border-slate-900 hover:bg-slate-800"
                        onClick={(event) => {
                          event.stopPropagation();
                          setActiveSeat((index + 1) % assignments.length);
                        }}
                      >
                        {t('nextSeat', language)}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-3 md:flex-row">
          <Button
            onClick={handleSave}
            className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
            size="lg"
          >
            {t('saveSeatingPlan', language)}
          </Button>
          <Button
            onClick={handleSkip}
            variant="outline"
            className="flex-1 border-gray-300 text-gray-900 hover:bg-gray-50"
            size="lg"
          >
            {t('skipSeatingPlan', language)}
          </Button>
        </div>
      </div>
    </div>
  );
}
