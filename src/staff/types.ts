import { Language, OrderItem, Restaurant } from '../types';

export type OrderStatus =
  | 'NEW'
  | 'IN_PROGRESS'
  | 'READY'
  | 'PICKING_UP'
  | 'DELIVERED';

export type ItemKind = 'food' | 'drink' | 'request';

export type Station = 'kitchen' | 'bar' | 'server';

// Production status for kitchen/bar/server request track.
export type ProductionStatus = 'NEW' | 'IN_PROGRESS' | 'READY';

export type OrderType = 'dine_in' | 'to_go' | 'request';

export type TableState = 'EMPTY' | 'OCCUPIED' | 'PAYING' | 'CLEANING' | 'READY';

export type TableInfo = {
  id: string;
  label: string;
  section?: string;
  state: TableState;
  cleaningStartedAt?: Date | null;
  tableNumber?: number;
  seats?: number;
  location?: string;
  available?: boolean;
  x?: number;
  y?: number;
};

export type StaffOrderItem = {
  id: string;
  name: string;
  quantity: number;
  kind: ItemKind;
  note?: string;
};

export type StaffOrder = {
  id: string;
  /** When one DB order expands into multiple station tickets, this disambiguates them. */
  ticketId?: string;
  orderType: OrderType;
  items: StaffOrderItem[];
  tableId?: string;
  tableLabel?: string;
  customerName?: string;
  customerContact?: string;
  note?: string;
  createdAt: Date;
  status: OrderStatus;
  /** For station tickets this will always be set. Keep optional for backward compatibility. */
  station?: Station;

  // Station fulfillment timestamps (used mainly for kitchen/bar tickets).
  pickedUpAt?: Date | null;
  deliveredAt?: Date | null;
};

/**
 * A station ticket is a StaffOrder that is guaranteed to be associated with a station.
 * This helps avoid TS issues when a view requires station-specific actions.
 */
export type StaffStationTicket = StaffOrder & { station: Station };

export type StaffSeedContext = {
  restaurant?: Restaurant | null;
  tableId?: string | null;
  tableNumber?: number | null;
  customerName?: string;
  customerId?: string;
  note?: string;
  language?: Language;
};

export type StaffOrderPayload = {
  items: OrderItem[];
  meta?: StaffSeedContext;
};
