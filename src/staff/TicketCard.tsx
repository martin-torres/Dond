import React from 'react';
import { StaffOrder, StaffOrderItem } from './types';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { uppercaseNote, timeAgo } from './utils';

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
};

// Color mapping that matches FloorPlanTablePicker colors
const tableStatusColors: Record<StaffOrder['status'], string> = {
  NEW: 'bg-blue-50 text-blue-800 border-blue-200',
  IN_PROGRESS: 'bg-green-50 text-green-800 border-green-200',
  READY: 'bg-rose-100 text-rose-800 border-rose-300',
  PICKING_UP: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  DELIVERED: 'bg-gray-50 text-gray-600 border-gray-200',
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

export const TicketCard = React.memo(({ order, items, accent = 'owner', actions, hideTableInfo = false }: TicketCardProps) => {
  const hasRequests = items.some(item => item.kind === 'request');
  const accentClass = hasRequests
    ? REQUEST_STYLE
    : (accentBorder[accent] ?? accentBorder.owner);

  // Use table status colors for the card background to match table colors
  const statusClass = tableStatusColors[order.status];

  return (
    <Card className={`p-2 space-y-0 border ${statusClass} ${accentClass}`}>
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
          <Badge className={`text-xs px-1.5 py-0.5 ${statusClass}`}>
            {order.status}
          </Badge>
          <p className="text-xs text-gray-500 leading-tight">{timeAgo(order.createdAt)}</p>
        </div>
      </div>
      {actions && actions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 -mt-0.5">
          {actions.map((action) => (
            <Button
              key={action.label}
              onClick={action.onClick}
              variant={action.variant ?? 'default'}
              className="flex-1 min-w-[100px] h-10 text-sm opacity-85 hover:opacity-100 transition-opacity"
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </Card>
  );
});
