// Phase 4B.1: Eligibility Watcher
// Purpose: Post-commit observer that emits table-eligible-for-closure events
// Rule: OUT-OF-DATABASE, post-commit, NOT inside transaction, NOT a Postgres trigger
// Rule: Realtime is best-effort signal, NOT a commit guarantee → read-consistency guard mandatory

import { supabase } from '../lib/supabaseClient';
import { canCloseTable } from './tableServicesApi';

// ========================================
// TYPES
// ========================================

export type SystemEvent = {
  event_type: string;
  table_id: string;
  order_id: number;
  payload?: any;
};

// ========================================
// UTILITY: Sleep Helper
// ========================================

/**
 * Sleep helper for read-consistency retry
 * Not a business retry, not stateful
 * Prevents race-based false negatives
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ========================================
// TABLE ID RESOLUTION WITH READ-CONSISTENCY GUARD
// ========================================

/**
 * Get table_id for an order
 * Canonical source: orders.table_id
 */
async function getTableIdForOrder(orderId: number): Promise<string | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('table_id')
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('[getTableIdForOrder] Error reading order:', error);
    return null;
  }

  return data?.table_id ?? null;
}

/**
 * Get table_id for an order WITH read-consistency guard
 *
 * Canonical Rule:
 * If resolving table_id immediately after an INSERT returns null,
 * retry once after a short delay (50–200ms), then exit silently.
 *
 * This is NOT a business retry
 * This is NOT stateful
 * This prevents race-based false negatives
 * This does NOT violate immutability
 */
async function getTableIdForOrderWithRetry(
  orderId: number
): Promise<string | null> {
  let tableId = await getTableIdForOrder(orderId);
  if (tableId) return tableId;

  // Read-consistency guard: retry once
  await sleep(100);

  tableId = await getTableIdForOrder(orderId);
  return tableId ?? null;
}

// ========================================
// EVENT EMISSION (ADVISORY ONLY)
// ========================================

/**
 * Emit table-eligible-for-closure event
 *
 * Authoritative Rule:
 * system_events is:
 * - Append-only
 * - Advisory
 * - Never read for truth
 * - No uniqueness
 * - No constraints required
 * - Persistence is optional at Phase 4B.1
 *
 * If system_events does not exist:
 * - Create a minimal append-only table, OR
 * - Emit to a non-persistent sink (console / external log)
 * - Do NOT add constraints, indexes, dedupe, or reads
 */
async function emitTableEligibleForClosure(
  tableId: string,
  orderId: number
): Promise<void> {
  try {
    // Try to insert into system_events (if table exists)
    const { error } = await supabase.from('system_events').insert({
      event_type: 'TableEligibleForClosure',
      table_id: tableId,
      order_id: orderId,
      payload: null
    });

    if (error) {
      // If table doesn't exist or insert fails, log to console
      // This is acceptable at Phase 4B.1 - persistence is optional
      console.info('[emitTableEligibleForClosure] Advisory event (not persisted):', {
        event_type: 'TableEligibleForClosure',
        table_id: tableId,
        order_id: orderId,
        timestamp: new Date().toISOString()
      });
    } else {
      console.info('[emitTableEligibleForClosure] Event emitted:', {
        table_id: tableId,
        order_id: orderId
      });
    }
  } catch (err) {
    // Non-persistent fallback
    console.info('[emitTableEligibleForClosure] Event logged (insert failed):', {
      event_type: 'TableEligibleForClosure',
      table_id: tableId,
      order_id: orderId,
      timestamp: new Date().toISOString()
    });
  }
}

// ========================================
// CORE WATCHER - PHASE 4B.1 ONLY
// ========================================

/**
 * Core Watcher: handleOrderChange
 *
 * IMPORTANT:
 * Phase 4B.1 ONLY.
 *
 * This function MUST NOT:
 * - start timers
 * - schedule delayed jobs
 * - change table availability
 * - close tables
 * - mutate orders or tables
 * - add UI hooks
 * - enable RLS
 * - create DB triggers
 *
 * Those belong to Phase 4B.2+ ONLY.
 *
 * Execution Model:
 * - Out-of-database
 * - Post-commit observer
 * - NOT a Postgres trigger
 * - NOT inside a transaction
 * - NOT calling service logic from SQL
 *
 * Mechanism may be:
 * - Supabase Realtime
 * - Queue consumer
 * - Webhook
 * - Background worker
 */
export async function handleOrderChange(orderId: number): Promise<void> {
  try {
    // Step 1: Resolve table_id with read-consistency guard
    const tableId = await getTableIdForOrderWithRetry(orderId);
    if (!tableId) {
      // Silent exit if table_id cannot be resolved
      // This is acceptable - realtime is best-effort
      return;
    }

    // Step 2: Check eligibility using Phase 3B service
    const result = await canCloseTable(tableId);

    // Step 3: Emit event if eligible
    if (result.eligible === true) {
      await emitTableEligibleForClosure(tableId, orderId);
    }
  } catch (error) {
    // Log and swallow errors - watcher must not crash
    console.error('[handleOrderChange] Unexpected error:', error);
  }
}

// ========================================
// REALTIME SUBSCRIPTIONS (TRIGGER SOURCES)
// ========================================

/**
 * Initialize Payments INSERT watcher
 *
 * Subscribes to:
 * - payments table INSERT events
 * - Triggers handleOrderChange for each new payment
 */
export function watchPaymentsInsert(): void {
  console.info('[watchPaymentsInsert] Initializing payments insert watcher');

  const channel = supabase
    .channel('payments-inserts')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'payments'
      },
      (payload) => {
        const orderId = payload.new.order_id;
        if (orderId) {
          // Fire-and-forget - do not await
          handleOrderChange(orderId).catch(console.error);
        }
      }
    )
    .subscribe((status) => {
      console.info('[watchPaymentsInsert] Subscription status:', status);
    });
}

/**
 * Initialize Order Items INSERT watcher
 *
 * Subscribes to:
 * - order_items table INSERT events
 * - Triggers handleOrderChange for each new order item
 */
export function watchOrderItemsInsert(): void {
  console.info('[watchOrderItemsInsert] Initializing order items insert watcher');

  const channel = supabase
    .channel('order-items-inserts')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'order_items'
      },
      (payload) => {
        const orderId = payload.new.order_id;
        if (orderId) {
          // Fire-and-forget - do not await
          handleOrderChange(orderId).catch(console.error);
        }
      }
    )
    .subscribe((status) => {
      console.info('[watchOrderItemsInsert] Subscription status:', status);
    });
}

/**
 * Initialize all watchers
 *
 * Starts monitoring:
 * - Payments INSERT
 * - Order Items INSERT
 */
export function initializeEligibilityWatchers(): void {
  console.info('[initializeEligibilityWatchers] Phase 4B.1: Starting eligibility watchers');

  watchPaymentsInsert();
  watchOrderItemsInsert();

  console.info('[initializeEligibilityWatchers] All watchers initialized');
}

// ========================================
// MANUAL TRIGGER (TESTING ONLY)
// ========================================

/**
 * Manual trigger for testing
 *
 * TESTING ONLY.
 * MUST NOT be called from production flows.
 * MUST NOT be used as business logic.
 * Exists only to validate Phase 4B.1 watcher behavior.
 *
 * Usage (testing only):
 * import { manuallyTriggerEligibilityCheck } from '../api/eligibilityWatcherApi';
 * manuallyTriggerEligibilityCheck(orderId);
 */
export async function manuallyTriggerEligibilityCheck(orderId: number): Promise<void> {
  console.warn('[manuallyTriggerEligibilityCheck] TESTING ONLY - Manual trigger for order:', orderId);
  await handleOrderChange(orderId);
}
