import { OrderStatus } from './types';
import { getExternalOrderStatusUpdater } from './StaffDataProvider';

// Status progression map for rollback logic
const STATUS_PROGRESSION: Record<OrderStatus, OrderStatus[]> = {
  NEW: [], // Can't go back from NEW
  IN_PROGRESS: ['NEW'], // Can rollback to NEW
  READY: ['IN_PROGRESS'], // Can rollback to IN_PROGRESS
  PICKING_UP: ['READY'], // Can rollback to READY
  DELIVERED: ['PICKING_UP', 'READY', 'IN_PROGRESS'], // Can rollback to any previous status
};

// Reverse lookup for next valid statuses
const REVERSE_STATUS_PROGRESSION: Record<OrderStatus, OrderStatus[]> = {
  NEW: ['IN_PROGRESS'], // From NEW can go to IN_PROGRESS
  IN_PROGRESS: ['READY'], // From IN_PROGRESS can go to READY
  READY: ['PICKING_UP'], // From READY can go to PICKING_UP
  PICKING_UP: ['DELIVERED'], // From PICKING_UP can go to DELIVERED
  DELIVERED: [], // Terminal status
};

/**
 * Get valid rollback statuses for a given current status
 */
export function getValidRollbackStatuses(currentStatus: OrderStatus): OrderStatus[] {
  return STATUS_PROGRESSION[currentStatus] || [];
}

/**
 * Get valid forward progression statuses for a given current status
 */
export function getValidForwardStatuses(currentStatus: OrderStatus): OrderStatus[] {
  return REVERSE_STATUS_PROGRESSION[currentStatus] || [];
}

/**
 * Check if a status change is valid (forward or backward)
 */
export function isValidStatusChange(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  const validForward = getValidForwardStatuses(currentStatus);
  const validBackward = getValidRollbackStatuses(currentStatus);
  return validForward.includes(newStatus) || validBackward.includes(newStatus);
}

/**
 * Shared helper to move an order through the NEW → IN_PROGRESS → READY → PICKING_UP → DELIVERED lifecycle.
 * Now includes rollback capability for error correction.
 */
export function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const updater = getExternalOrderStatusUpdater();
  if (!updater) {
    console.warn('No staff data provider is mounted; unable to update order status.');
    return;
  }
  updater(orderId, newStatus);
}

/**
 * Rollback helper that only allows valid backward status changes
 */
export function rollbackOrderStatus(orderId: string, currentStatus: OrderStatus, targetStatus: OrderStatus) {
  if (!getValidRollbackStatuses(currentStatus).includes(targetStatus)) {
    console.warn(`Invalid rollback from ${currentStatus} to ${targetStatus}`);
    return false;
  }

  updateOrderStatus(orderId, targetStatus);
  return true;
}
