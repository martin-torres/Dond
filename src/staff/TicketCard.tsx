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
};

const statusColor: Record<StaffOrder['status'], string> = {
  NEW: 'bg-amber-100 text-amber-700 border-amber-200',
  IN_PROGRESS: 'bg-sky-100 text-sky-700 border-sky-200',
  READY: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  PICKING_UP: 'bg-purple-100 text-purple-700 border-purple-200',
  DELIVERED: 'bg-gray-100 text-gray-600 border-gray-200',
};

const accentBorder: Record<NonNullable<TicketCardProps['accent']>, string> = {
  kitchen: 'border-orange-200 shadow-[0_8px_24px_-10px_rgba(251,146,60,0.55)]',
  bar: 'border-blue-200 shadow-[0_8px_24px_-10px_rgba(59,130,246,0.45)]',
  server: 'border-emerald-200 shadow-[0_8px_24px_-10px_rgba(16,185,129,0.4)]',
  owner: 'border-slate-200 shadow-[0_8px_24px_-10px_rgba(0,0,0,0.08)]',
};

const formatHeader = (order: StaffOrder) => {
  if (order.orderType === 'dine_in') {
    return `DINE-IN · ${order.tableLabel ?? 'Table'}`;
  }
  if (order.orderType === 'to_go') {
    return `TO-GO · ${order.customerName ?? 'Guest'}`;
  }
  return `REQUEST · ${order.tableLabel ?? 'No table'}`;
};

export const TicketCard = ({ order, items, accent = 'owner', actions }: TicketCardProps) => {
  const accentClass = accentBorder[accent] ?? accentBorder.owner;
  return (
    <Card className={`p-4 space-y-3 border ${accentClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-[0.3em] text-gray-500">
            {formatHeader(order)}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-800 font-semibold">
            <span>{summarizeItems(items)}</span>
          </div>
          {order.note && (
            <p className="text-xs font-bold text-gray-700 tracking-wide">
              {uppercaseNote(order.note)}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge className={statusColor[order.status]}>{order.status}</Badge>
          <p className="text-xs text-gray-500">{timeAgo(order.createdAt)}</p>
        </div>
      </div>
      {actions && actions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {actions.map((action) => (
            <Button
              key={action.label}
              onClick={action.onClick}
              variant={action.variant ?? 'default'}
              className="flex-1 min-w-[120px]"
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </Card>
  );
};

const summarizeItems = (items: StaffOrderItem[]) =>
  items.map((item) => `${item.quantity}× ${item.name}`).join(', ');
