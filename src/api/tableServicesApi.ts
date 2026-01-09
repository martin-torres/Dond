// Phase 3B: Table Services API
// Purpose: Implement table-close eligibility logic based on derived payment completeness
// Rule: READ ONLY (except when explicitly inserting comp payments)
// Rule: MUST use order_payment_status view, not reimplement math

import { supabase } from '../lib/supabaseClient';

// ========================================
// TYPES
// ========================================

export type OrderPaymentStatus = {
  order_id: string;
  restaurant_id: string;
  table_id: string;
  total_due: number;
  total_paid: number;
  is_payment_complete: boolean;
};

export type TablePaymentSummary = {
  table_id: string;
  number_of_orders: number;
  total_due: number;
  total_paid: number;
  remaining_balance: number;
  table_payment_complete: boolean;
};

export type TableCloseEligibility = {
  eligible: boolean;
  reason?: string;
  incomplete_orders?: string[];
  remaining_balance?: number;
};

// ========================================
// SERVICE 1: canCloseTable
// ========================================

/**
 * Service 1: canCloseTable
 * Purpose: Determine whether a table is eligible to close
 * Behavior: 
 * - Read all non-cancelled orders at the table
 * - For each order: check order_payment_status.is_payment_complete
 * - If ANY order is not payment-complete → return false
 * - If no active orders exist → return true
 * - Otherwise → return true
 * Constraints: READ ONLY, No writes, No side effects
 */
export async function canCloseTable(tableId: string): Promise<TableCloseEligibility> {
  try {
    // Get all active orders at this table with payment status
    const { data: orderStatuses, error } = await supabase
      .from('order_payment_status')
      .select('*')
      .eq('table_id', tableId);

    if (error) {
      console.error('[canCloseTable] Error reading order_payment_status:', error);
      return {
        eligible: false,
        reason: `Failed to read payment status: ${error.message}`
      };
    }

    // CRITICAL: If no active orders, table is eligible to close
    // "No active orders" means:
    // - No rows in order_payment_status for this table
    // - OR all orders are cancelled/refunded (filtered out by view)
    // This is intentional: empty tables and fully resolved tables are eligible
    if (!orderStatuses || orderStatuses.length === 0) {
      return {
        eligible: true,
        reason: 'No active orders at this table'
      };
    }

    // Check if all orders are payment-complete
    const incompleteOrders = orderStatuses.filter(status => !status.is_payment_complete);
    
    if (incompleteOrders.length > 0) {
      const remainingBalance = incompleteOrders.reduce(
        (sum, order) => sum + (order.total_due - order.total_paid), 
        0
      );
      
      return {
        eligible: false,
        reason: `${incompleteOrders.length} order(s) not payment-complete`,
        incomplete_orders: incompleteOrders.map(o => o.order_id),
        remaining_balance: remainingBalance
      };
    }

    // All orders are payment-complete
    return {
      eligible: true,
      reason: 'All orders payment-complete'
    };
  } catch (error) {
    console.error('[canCloseTable] Unexpected error:', error);
    return {
      eligible: false,
      reason: `Unexpected error: ${String(error)}`
    };
  }
}

// ========================================
// SERVICE 2: getTablePaymentSummary
// ========================================

/**
 * Service 2: getTablePaymentSummary
 * Purpose: Provide a derived financial summary for staff logic and automation
 * Returns:
 * - table_id
 * - number_of_orders
 * - total_due (sum)
 * - total_paid (sum)
 * - table_payment_complete (boolean)
 * Source: Use order_payment_status, Group by table_id
 * Constraints: READ ONLY, No state mutation
 */
export async function getTablePaymentSummary(tableId: string): Promise<TablePaymentSummary | null> {
  try {
    // Get all order payment statuses for this table
    const { data: orderStatuses, error } = await supabase
      .from('order_payment_status')
      .select('*')
      .eq('table_id', tableId);

    if (error) {
      console.error('[getTablePaymentSummary] Error reading order_payment_status:', error);
      return null;
    }

    // If no orders, return empty summary
    if (!orderStatuses || orderStatuses.length === 0) {
      return {
        table_id: tableId,
        number_of_orders: 0,
        total_due: 0,
        total_paid: 0,
        remaining_balance: 0,
        table_payment_complete: true
      };
    }

    // Calculate totals
    const number_of_orders = orderStatuses.length;
    const total_due = orderStatuses.reduce((sum, order) => sum + order.total_due, 0);
    const total_paid = orderStatuses.reduce((sum, order) => sum + order.total_paid, 0);
    const remaining_balance = total_due - total_paid;
    const table_payment_complete = orderStatuses.every(order => order.is_payment_complete);

    return {
      table_id: tableId,
      number_of_orders,
      total_due,
      total_paid,
      remaining_balance,
      table_payment_complete
    };
  } catch (error) {
    console.error('[getTablePaymentSummary] Unexpected error:', error);
    return null;
  }
}

// ========================================
// SERVICE 3: closeTableIfEligible
// ========================================

/**
 * Service 3: closeTableIfEligible
 * Purpose: Coordinate table closure logic without forcing it
 * Behavior:
 * - Call canCloseTable
 * - If false → do nothing
 * - If true:
 *   - Emit a table-close event (log / analytics / hook)
 *   - DO NOT mutate tables
 *   - DO NOT update availability
 *   - DO NOT change UI
 * This function prepares the system for:
 * - auto-close timers
 * - staff-triggered closure
 * - analytics
 */
export async function closeTableIfEligible(tableId: string): Promise<{
  closed: boolean;
  reason?: string;
  emitted_event?: boolean;
}> {
  try {
    // Step 1: Check eligibility
    const eligibility = await canCloseTable(tableId);

    if (!eligibility.eligible) {
      console.info(`[closeTableIfEligible] Table ${tableId} not eligible:`, eligibility.reason);
      return {
        closed: false,
        reason: eligibility.reason
      };
    }

    // Step 2: Get summary for audit trail
    const summary = await getTablePaymentSummary(tableId);

    // Step 3: Emit table-close event (log for now, could be analytics/hook later)
    console.info('[closeTableIfEligible] Emitting table-close event:', {
      table_id: tableId,
      timestamp: new Date().toISOString(),
      reason: eligibility.reason,
      summary: summary || 'No summary available'
    });

    // Step 4: DO NOT mutate tables, DO NOT update availability, DO NOT change UI
    // This is a read-only coordination function
    // Actual table closure happens elsewhere (auto-close timer, staff action, etc.)

    return {
      closed: true,
      reason: eligibility.reason,
      emitted_event: true
    };
  } catch (error) {
    console.error('[closeTableIfEligible] Unexpected error:', error);
    return {
      closed: false,
      reason: `Unexpected error: ${String(error)}`
    };
  }
}

// ========================================
// STAFF OVERRIDE: compRemainingBalance
// ========================================

/**
 * Staff Override: compRemainingBalance
 *
 * Inserts a compensating payment event to satisfy payment completeness.
 *
 * This function:
 * - INSERTS a payment event (method = 'comp', status = 'completed')
 *
 * ❌ DO NOT:
 * - Delete order items
 * - Change prices
 * - Mark orders paid (except via payment events)
 * - Mutate tables
 * - Update order status flags
 * - Edit existing payments
 *
 * Double-comp prevention:
 * - Soft guard using order_payment_status.is_payment_complete
 * - Returns error if already payment-complete
 * - Phase 4 will enforce hard prevention via UI + constraints
 */
export async function compRemainingBalance(params: {
  orderId: string;
  remainingBalance: number;
  reason?: string;
  staffMemberId?: string;
}): Promise<{ success: boolean; payment?: any; error?: string }> {
  try {
    const { orderId, remainingBalance, reason = 'manager_override', staffMemberId } = params;

    // CRITICAL: Trust boundary - Caller must compute remaining balance
    // This function does NOT re-derive remaining_balance from order_payment_status
    // Caller responsibility:
    // 1. Call getTablePaymentSummary or canCloseTable to get remaining_balance
    // 2. Pass the computed value to this function
    // 3. This function trusts the caller's computation
    //
    // Why? This is acceptable in Phase 3B because:
    // - No UI exposure yet (staff-only invocation)
    // - Phase 4 will formalize this with UI validation
    // - Keeps function simple and single-purpose

    // CRITICAL: Double-comp prevention (soft guard)
    // Check if order is already payment-complete before inserting comp
    // This is a soft guard - Phase 4 will enforce hard prevention
    const { data: orderStatus } = await supabase
      .from('order_payment_status')
      .select('is_payment_complete, total_due, total_paid')
      .eq('order_id', orderId)
      .single();

    if (orderStatus?.is_payment_complete) {
      console.warn('[compRemainingBalance] Order already payment-complete, comp not needed');
      return {
        success: false,
        error: 'Order is already payment-complete, comp not needed'
      };
    }

    // Validate: remaining balance must be positive
    if (remainingBalance <= 0) {
      return {
        success: false,
        error: 'Remaining balance must be greater than 0'
      };
    }

    // Insert comp payment event
    // CRITICAL: Caller must ensure comp is applied only once
    // Phase 4 will enforce hard prevention with UI guards
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        amount: remainingBalance,
        method: 'comp',
        status: 'completed',
        metadata: {
          reason,
          staff_member_id: staffMemberId,
          comped_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (error) {
      console.error('[compRemainingBalance] Error inserting comp payment:', error);
      return {
        success: false,
        error: error.message
      };
    }

    console.info('[compRemainingBalance] Comp payment inserted:', payment.id);
    return {
      success: true,
      payment
    };
  } catch (error) {
    console.error('[compRemainingBalance] Unexpected error:', error);
    return {
      success: false,
      error: String(error)
    };
  }
}

// ========================================
// BATCH OPERATIONS
// ========================================

/**
 * Get payment summaries for multiple tables
 * Purpose: Staff dashboard showing all tables at once
 */
export async function getTablePaymentSummaries(tableIds: string[]): Promise<{
  [tableId: string]: TablePaymentSummary | null;
}> {
  const results: { [tableId: string]: TablePaymentSummary | null } = {};

  // Fetch summaries in parallel
  const promises = tableIds.map(async (tableId) => {
    results[tableId] = await getTablePaymentSummary(tableId);
  });

  await Promise.all(promises);
  return results;
}

/**
 * Check close eligibility for multiple tables
 * Purpose: Staff dashboard showing which tables can be closed
 */
export async function checkTableCloseEligibility(tableIds: string[]): Promise<{
  [tableId: string]: TableCloseEligibility;
}> {
  const results: { [tableId: string]: TableCloseEligibility } = {};

  // Check eligibility in parallel
  const promises = tableIds.map(async (tableId) => {
    results[tableId] = await canCloseTable(tableId);
  });

  await Promise.all(promises);
  return results;
}
