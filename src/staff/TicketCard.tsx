import React from 'react';
import { StaffOrder, StaffOrderItem } from './types';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { uppercaseNote, timeAgo } from './utils';

import {
  STATUS_STYLES,
  getStatusPresence,
  mapOrderStatusToVisualKey,
  type TableSignal,
  type TableStatusKey,
} from '../utils/statusVisual';

type TicketAction = {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary';
};

type TicketCardProps = {
  order: StaffOrder;
  items: StaffOrderItem[];
  accent?: 'kitchen' | 'bar' | 'server' | 'owner';
  actions?: TicketAction[];
  hideTableInfo?: boolean; // New prop to hide table name when in grouped view
  /** If true and there is exactly 1 action, the whole card becomes the button (demo-friendly). */
  wholeCardClickable?: boolean;
};

const accentBorder: Record<NonNullable<TicketCardProps['accent']>, string> = {
  kitchen: 'border-l-4 border-orange-200 shadow-[0_8px_24px_-10px_rgba(251,146,60,0.55)]',
  bar: 'border-l-4 border-blue-200 shadow-[0_8px_24px_-10px_rgba(59,130,246,0.45)]',
  server: 'border-l-4 border-emerald-200 shadow-[0_8px_24px_-10px_rgba(16,185,129,0.4)]',
  owner: 'border-l-4 border-slate-200 shadow-[0_8px_24px_-10px_rgba(0,0,0,0.08)]',
};

// Special styling for FOH requests (highest priority, amber background)
const REQUEST_STYLE = 'border-amber-300 bg-amber-50 shadow-[0_0_0_4px_rgba(245,158,11,0.3)]';

const formatHeader = (order: StaffOrder) => {
  if (order.orderType === 'dine_in') {
    return `DINE-IN · ${order.tableLabel ?? 'Table'}`;
  }
  if (order.orderType === 'to_go') {
    return `TO-GO · ${order.customerName ?? 'Guest'}`;
  }
  return `REQUEST · ${order.tableLabel ?? 'No table'}`;
};

function deriveTicketSignals(order: StaffOrder, items: StaffOrderItem[]): TableSignal {
  // Requests should always show as request, regardless of production status.
  if (order.orderType === 'request' || items.some((i) => i.kind === 'request')) {
    return {
      hasRequest: true,
      inProcess: order.status === 'IN_PROGRESS',
      ready: order.status === 'READY',
      pickingUp: order.status === 'PICKING_UP',
      delivered: order.status === 'DELIVERED',
    };
  }

  const v = mapOrderStatusToVisualKey(order.status);
  return {
    hasOrder: v === 'order',
    inProcess: v === 'inProcess',
    ready: v === 'ready',
    pickingUp: v === 'pickup',
    delivered: order.status === 'DELIVERED',
  };
}

function computeTicketVisual(signals: TableSignal): {
  bg: string;
  border: string;
  text: string;
  glow: string;
  fillKey: TableStatusKey | null;
  borderKey: TableStatusKey | null;
} {
  const { hasReady, others } = getStatusPresence(signals);
  const activeCount = (hasReady ? 1 : 0) + others.length;

  // Base (idle)
  let fillKey: TableStatusKey | null = null;
  let borderKey: TableStatusKey | null = null;

  if (activeCount === 1) {
    fillKey = hasReady ? 'ready' : (others[0] ?? null);
    borderKey = fillKey;
  } else if (activeCount >= 2) {
    if (hasReady) {
      fillKey = 'ready';
      borderKey = (others[0] ?? 'ready');
    } else {
      borderKey = (others[0] ?? null);
      fillKey = (others[1] ?? others[0] ?? null);
    }
  }

  if (!fillKey || !borderKey) {
    return {
      bg: '#f8fafc',
      border: '#e2e8f0',
      text: '#334155',
      glow: 'rgba(203,213,225,0.65)',
      fillKey,
      borderKey,
    };
  }

  const fill = STATUS_STYLES[fillKey];
  const border = STATUS_STYLES[borderKey];

  return {
    bg: fill.bg,
    border: border.border,
    text: fill.text,
    glow: border.glow,
    fillKey,
    borderKey,
  };
}

export const TicketCard = React.memo(({ order, items, accent = 'owner', actions, hideTableInfo = false, wholeCardClickable = true }: TicketCardProps) => {
  // Per your spec: keep ticket text readable (black) while using colored backgrounds/borders
  // to indicate status. (We do NOT use the palette `visual.text` for actual text color.)
  const TICKET_TEXT_COLOR = '#0f172a'; // slate-900-ish

  const hasRequests = items.some(item => item.kind === 'request');
  const accentClass = hasRequests
    ? REQUEST_STYLE
    : (accentBorder[accent] ?? accentBorder.owner);

  const signals = deriveTicketSignals(order, items);
  const visual = computeTicketVisual(signals);

  const singleAction = actions && actions.length === 1 ? actions[0] : null;
  const isClickable = wholeCardClickable && !!singleAction;

  // Card should visually shrink when READY (matches your spec).
  const compactReady = order.status === 'READY';

  return (
    <Card
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? singleAction!.onClick : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                singleAction!.onClick();
              }
            }
          : undefined
      }
      className={`space-y-0 border ${accentClass} ${isClickable ? 'cursor-pointer select-none' : ''} ${compactReady ? 'opacity-95 scale-[0.98]' : ''}`}
      style={{
        background: visual.bg,
        borderColor: visual.border,
        color: TICKET_TEXT_COLOR,
        boxShadow: `0 0 0 0px transparent, 0 8px 24px -12px rgba(15,23,42,0.18)`,
      }}
    >
      <div className="p-2">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 flex-1 min-w-0">
          {!hideTableInfo && (
            <p className="text-xs font-semibold tracking-[0.3em] text-gray-500">
              {formatHeader(order)}
            </p>
          )}
          <div className="text-sm text-gray-800 leading-tight">
            {items.map((item, index) => (
              <div key={item.id} className="font-semibold">
                {item.quantity}× {item.name}
                {index < items.length - 1 && <span className="text-gray-400 mx-0.5">•</span>}
              </div>
            ))}
          </div>
          {order.note && (
            <p className="text-xs font-bold text-gray-700 tracking-wide leading-tight">
              {uppercaseNote(order.note)}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <Badge
            className="text-xs px-1.5 py-0.5"
            style={{
              background: visual.bg,
              border: `1px solid ${visual.border}`,
              color: TICKET_TEXT_COLOR,
            }}
          >
            {order.status}
          </Badge>
          <p className="text-xs text-gray-500 leading-tight">{timeAgo(order.createdAt)}</p>
        </div>
      </div>
      {(actions && actions.length > 0) && (
        <div className="pt-2">
          {isClickable ? (
            <div
              className="w-full text-center text-xs font-extrabold tracking-[0.25em] uppercase"
              style={{ color: TICKET_TEXT_COLOR }}
            >
              {singleAction!.label}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className="flex-1 min-w-[100px] h-10 text-sm font-semibold opacity-90 hover:opacity-100 transition-opacity rounded-lg"
                  style={{
                    background: 'rgba(255,255,255,0.55)',
                    border: `1px solid ${visual.border}55`,
                    color: TICKET_TEXT_COLOR,
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
    </Card>
  );
});
