import { ReactNode } from 'react';
import { cn } from './ui/utils';

interface StageGraphicSlotProps {
  label?: string;
  tone?: 'mint' | 'amber' | 'blue' | 'rose';
  children?: ReactNode;
}

const toneMap: Record<NonNullable<StageGraphicSlotProps['tone']>, string> = {
  mint: 'from-emerald-50 via-white to-emerald-100 border-emerald-100',
  amber: 'from-amber-50 via-white to-amber-100 border-amber-100',
  blue: 'from-sky-50 via-white to-indigo-100 border-indigo-100',
  rose: 'from-rose-50 via-white to-pink-100 border-rose-100',
};

export function StageGraphicSlot({ label, tone = 'blue', children }: StageGraphicSlotProps) {
  return (
    <div
      className={cn(
        'relative w-full max-w-xs rounded-3xl border bg-gradient-to-br shadow-sm overflow-hidden',
        toneMap[tone]
      )}
      aria-label={label ? `${label} visual placeholder` : 'Stage visual placeholder'}
    >
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
      <div className="relative flex flex-col items-center justify-center px-4 py-5 gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-inner text-2xl text-gray-500">
          {children ?? '◎'}
        </div>
        {label && <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">{label}</span>}
      </div>
    </div>
  );
}
