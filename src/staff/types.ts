import { Language, OrderItem, Restaurant } from '../types';

export type OrderStatus =
  | 'NEW'
  | 'IN_PROGRESS'
  | 'READY'
  | 'PICKING_UP'
  | 'DELIVERED';

export type ItemKind = 'food' | 'drink' | 'request';

export type Station = 'kitchen' | 'bar' | 'server';

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
  status?: OrderStatus;
};

export type StaffOrder = {
  id: string;
  orderType: OrderType;
  items: StaffOrderItem[];
  tableId?: string;
  tableLabel?: string;
  customerName?: string;
  customerContact?: string;
  note?: string;
  createdAt: Date;
  status: OrderStatus;
  station?: Station;
};

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
