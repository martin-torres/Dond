// Phase 2: Orders API with Mirror Writes
// Purpose: Wrap existing ordersApi with mirror write functionality
// Rule: Existing behavior stays intact, mirror writes are non-blocking

import { createOrderWithItems as originalCreateOrderWithItems, NewOrderInput, OrderRow } from './ordersApi';
import { createOrderWithItemsAndMirror } from './mirrorWritesApi';

/**
 * Wrapper function that adds mirror writes to createOrderWithItems
 * This should be used INSTEAD OF the original function during Phase 2
 */
export async function createOrderWithItems(input: NewOrderInput): Promise<OrderRow> {
  return createOrderWithItemsAndMirror(input, originalCreateOrderWithItems);
}

// Re-export all other functions unchanged
export * from './ordersApi';
