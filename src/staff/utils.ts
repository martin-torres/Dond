import { StaffOrder, StaffOrderItem } from './types';

export const timeAgo = (date: Date) => {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  );
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins === 0 ? `${hours} hr ago` : `${hours}h ${mins}m ago`;
};

export const filterItemsByKind = (order: StaffOrder, kind: 'food' | 'drink') =>
  order.items.filter((item) => item.kind === kind);

export const uppercaseNote = (note?: string) => note?.toUpperCase();

export const summarizeItems = (items: StaffOrderItem[]) =>
  items.map((item) => `${item.quantity}× ${item.name}`).join(', ');
