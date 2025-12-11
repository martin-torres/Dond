import { OrderStatus } from './types';
import { getExternalOrderStatusUpdater } from './StaffDataProvider';

/**
 * Shared helper to move an order through the NEW → IN_PROGRESS → READY → PICKING_UP → DELIVERED lifecycle.
 * TODO: Wire this to Supabase mutations once the backend contract is ready.
 */
export function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const updater = getExternalOrderStatusUpdater();
  if (!updater) {
    console.warn('No staff data provider is mounted; unable to update order status.');
    return;
  }
  updater(orderId, newStatus);
}
