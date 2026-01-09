// Phase 2: Mirror Writes API
// Purpose: Mirror writes to new authoritative structures (seats, payments)
// Rule: Old logic stays active. New logic only mirrors. No reads yet.

import { supabase } from '../lib/supabaseClient';

// ========================================
// TYPES
// ========================================

export type SeatRow = {
  id: string;
  order_id: string;
  seat_name: string;
  // NOTE: seat_number and customer_id are RESERVED for future use
  // DO NOT write to them in Phase 2. DO NOT use them in logic.
  seat_number?: number | null;
  customer_id?: string | null;
  created_at: string;
  // NOTE: No updated_at - seats are not mutated after creation in Phase 2-3
};

export type PaymentRow = {
  id: string;
  order_id: string;
  payer_customer_id?: string | null; // Optional: not required in Phase 2
  amount: number;
  // NOTE: Currency is derived from restaurant.currency at write time.
  // Do NOT store per-payment currency unless multi-currency is a real goal.
  // For now, we omit currency to avoid duplication and mismatch risk.
  method: 'cash' | 'card' | 'digital' | 'auto_charge';
  status: 'initiated' | 'completed' | 'failed';
  metadata?: Record<string, any> | null;
  created_at: string;
  // NOTE: No updated_at - payments are immutable events
};

// ========================================
// SEAT MIRRORING (Phase 2.1 & 2.2)
// ========================================

/**
 * Phase 2.1: Mirror seat creation
 * Creates seats only if none exist yet for this order
 * Safe: Does not affect existing behavior
 */
export async function mirrorSeatCreation(
  orderId: string,
  customerName?: string | null
): Promise<{ success: boolean; seat?: SeatRow; error?: string }> {
  try {
    // Check if seats already exist for this order
    const { data: existingSeats, error: checkError } = await supabase
      .from('seats')
      .select('id')
      .eq('order_id', orderId)
      .limit(1);

    if (checkError) {
      console.warn('[mirrorSeatCreation] Check error (non-blocking):', checkError);
    }

    // If seats already exist, do nothing (idempotent)
    if (existingSeats && existingSeats.length > 0) {
      return { success: true };
    }

    // Create default seat
    // IMPORTANT: Do NOT write to seat_number or customer_id in Phase 2
    // These fields are reserved for future use and should remain null
    const seatName = customerName?.trim() || 'Seat 1';
    const { data: seat, error: insertError } = await supabase
      .from('seats')
      .insert({
        order_id: orderId,
        seat_name: seatName,
        // NOTE: seat_number is RESERVED - do not write to it
        // NOTE: customer_id is RESERVED - do not write to it
      })
      .select()
      .single();

    if (insertError) {
      console.error('[mirrorSeatCreation] Insert error (non-blocking):', insertError);
      return { success: false, error: insertError.message };
    }

    console.info('[mirrorSeatCreation] Created default seat:', seat.id);
    return { success: true, seat: seat as SeatRow };
  } catch (error) {
    console.error('[mirrorSeatCreation] Unexpected error (non-blocking):', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Phase 2.2: Mirror seat assignment on order items
 * Assigns order_items.seat_id to default seat if not already assigned
 * Safe: Does not block ordering if mirroring fails
 */
export async function mirrorSeatAssignment(
  orderId: string,
  orderItemIds: string[]
): Promise<{ success: boolean; assigned: number; errors: string[] }> {
  const errors: string[] = [];
  let assigned = 0;

  try {
    // Get default seat for this order
    const { data: seats, error: seatsError } = await supabase
      .from('seats')
      .select('id')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })
      .limit(1);

    if (seatsError || !seats || seats.length === 0) {
      const errorMsg = seatsError?.message || 'No seats found for order';
      console.warn('[mirrorSeatAssignment] No seat found (non-blocking):', errorMsg);
      return { success: false, assigned: 0, errors: [errorMsg] };
    }

    const defaultSeatId = seats[0].id;

    // Assign seat_id to each order item that doesn't have one
    for (const itemId of orderItemIds) {
      try {
        const { error: updateError } = await supabase
          .from('order_items')
          .update({ seat_id: defaultSeatId })
          .eq('id', itemId)
          .is('seat_id', null); // Only update if seat_id is null

        if (updateError) {
          console.warn(`[mirrorSeatAssignment] Failed to assign seat to item ${itemId}:`, updateError);
          errors.push(`Item ${itemId}: ${updateError.message}`);
        } else {
          assigned++;
        }
      } catch (itemError) {
        console.error(`[mirrorSeatAssignment] Unexpected error for item ${itemId}:`, itemError);
        errors.push(`Item ${itemId}: ${String(itemError)}`);
      }
    }

    const success = errors.length === 0;
    if (success) {
      console.info(`[mirrorSeatAssignment] Assigned seats to ${assigned} items`);
    } else {
      console.warn(`[mirrorSeatAssignment] Partial success: ${assigned}/${orderItemIds.length} items assigned`);
    }

    return { success, assigned, errors };
  } catch (error) {
    console.error('[mirrorSeatAssignment] Unexpected error (non-blocking):', error);
    return { success: false, assigned: 0, errors: [String(error)] };
  }
}

// ========================================
// PAYMENT MIRRORING (Phase 2.3, 2.4, 2.5)
// ========================================

/**
 * Phase 2.3: Mirror cash payments to payments table
 * Mirrors orders.cash_tendered_amount and orders.change_received_confirmed
 * Safe: Does not remove existing fields or change behavior
 */
export async function mirrorCashPayment(params: {
  orderId: string;
  amount: number;
  tenderedAmount?: number;
  changeConfirmed?: boolean;
  payerCustomerId?: string;
}): Promise<{ success: boolean; payment?: PaymentRow; error?: string }> {
  try {
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        order_id: params.orderId,
        // NOTE: payer_customer_id is optional in Phase 2
        // Only include if you have it, otherwise omit (will be null)
        ...(params.payerCustomerId ? { payer_customer_id: params.payerCustomerId } : {}),
        amount: params.amount,
        // NOTE: Currency is derived from restaurant.currency
        // Do NOT store per-payment currency to avoid duplication
        method: 'cash',
        status: 'completed',
        metadata: {
          tendered_amount: params.tenderedAmount,
          change_confirmed: params.changeConfirmed,
          mirrored_from: 'orders.cash_tendered_amount',
        },
      })
      .select()
      .single();

    if (error) {
      console.error('[mirrorCashPayment] Insert error (non-blocking):', error);
      return { success: false, error: error.message };
    }

    console.info('[mirrorCashPayment] Created payment:', payment.id);
    return { success: true, payment: payment as PaymentRow };
  } catch (error) {
    console.error('[mirrorCashPayment] Unexpected error (non-blocking):', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Phase 2.4: Mirror card/digital payments to payments table
 * Mirrors terminal, Apple Pay, Google Pay, and in-app card payments
 * Safe: Does not change existing payment processing
 */
export async function mirrorCardDigitalPayment(params: {
  orderId: string;
  amount: number;
  method: 'card' | 'digital';
  status: 'completed' | 'failed';
  payerCustomerId?: string;
  processor?: string;
  transactionId?: string;
  failureReason?: string;
}): Promise<{ success: boolean; payment?: PaymentRow; error?: string }> {
  try {
    const metadata: Record<string, any> = {
      mirrored_from: 'payment_processing',
    };

    if (params.processor) metadata.processor = params.processor;
    if (params.transactionId) metadata.transaction_id = params.transactionId;
    if (params.failureReason) metadata.failure_reason = params.failureReason;

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        order_id: params.orderId,
        // NOTE: payer_customer_id is optional in Phase 2
        ...(params.payerCustomerId ? { payer_customer_id: params.payerCustomerId } : {}),
        amount: params.amount,
        // NOTE: Currency is derived from restaurant.currency
        // Do NOT store per-payment currency to avoid duplication
        method: params.method,
        status: params.status,
        metadata,
      })
      .select()
      .single();

    if (error) {
      console.error('[mirrorCardDigitalPayment] Insert error (non-blocking):', error);
      return { success: false, error: error.message };
    }

    console.info('[mirrorCardDigitalPayment] Created payment:', payment.id, params.status);
    return { success: true, payment: payment as PaymentRow };
  } catch (error) {
    console.error('[mirrorCardDigitalPayment] Unexpected error (non-blocking):', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Phase 2.5: Mirror auto-charge (distance-based) payments
 * Mirrors distance boundary trigger charges
 * Safe: Does not change existing auto-charge logic
 */
export async function mirrorAutoChargePayment(params: {
  orderId: string;
  amount: number;
  status: 'completed' | 'failed';
  payerCustomerId?: string;
  distanceTriggeredAt?: string;
  boundaryId?: string;
  failureReason?: string;
}): Promise<{ success: boolean; payment?: PaymentRow; error?: string }> {
  try {
    const metadata: Record<string, any> = {
      distance_triggered_at: params.distanceTriggeredAt || new Date().toISOString(),
      mirrored_from: 'distance_auto_charge',
    };

    if (params.boundaryId) metadata.boundary_id = params.boundaryId;
    if (params.failureReason) metadata.failure_reason = params.failureReason;

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        order_id: params.orderId,
        // NOTE: payer_customer_id is optional in Phase 2
        ...(params.payerCustomerId ? { payer_customer_id: params.payerCustomerId } : {}),
        amount: params.amount,
        // NOTE: Currency is derived from restaurant.currency
        // Do NOT store per-payment currency to avoid duplication
        method: 'auto_charge',
        status: params.status,
        metadata,
      })
      .select()
      .single();

    if (error) {
      console.error('[mirrorAutoChargePayment] Insert error (non-blocking):', error);
      return { success: false, error: error.message };
    }

    console.info('[mirrorAutoChargePayment] Created payment:', payment.id, params.status);
    return { success: true, payment: payment as PaymentRow };
  } catch (error) {
    console.error('[mirrorAutoChargePayment] Unexpected error (non-blocking):', error);
    return { success: false, error: String(error) };
  }
}

// ========================================
// INTEGRATION HELPERS
// ========================================

/**
 * Wrapper for createOrderWithItems that adds mirror writes
 * This is called INSTEAD OF the original, but the original logic stays intact
 */
export async function createOrderWithItemsAndMirror(
  input: {
    restaurantId: string;
    orderType: 'dine_in' | 'to_go' | 'request';
    tableId?: string | null;
    tableLabel?: string;
    customerName?: string;
    customerId?: string;
    note?: string;
    items: Array<{
      menuItemId?: string;
      name: string;
      quantity: number;
      price: number;
      kind: 'food' | 'drink' | 'request';
      note?: string;
    }>;
  },
  originalCreateOrder: (input: any) => Promise<any>
): Promise<any> {
  // Step 1: Call original function (existing behavior must succeed)
  const order = await originalCreateOrder(input);

  // Step 2: Mirror seat creation (Phase 2.1)
  try {
    const seatResult = await mirrorSeatCreation(order.id, input.customerName);
    if (!seatResult.success) {
      console.warn('[createOrderWithItemsAndMirror] Seat mirroring failed (non-blocking):', seatResult.error);
    }
  } catch (error) {
    console.error('[createOrderWithItemsAndMirror] Seat mirroring error (non-blocking):', error);
  }

  // Step 3: Mirror seat assignment (Phase 2.2)
  try {
    // Get the order items that were just created
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('id')
      .eq('order_id', order.id);

    if (!itemsError && orderItems && orderItems.length > 0) {
      const itemIds = orderItems.map(item => item.id);
      const assignmentResult = await mirrorSeatAssignment(order.id, itemIds);
      if (!assignmentResult.success) {
        console.warn('[createOrderWithItemsAndMirror] Seat assignment mirroring failed (non-blocking):', assignmentResult.errors);
      }
    }
  } catch (error) {
    console.error('[createOrderWithItemsAndMirror] Seat assignment mirroring error (non-blocking):', error);
  }

  // Return the original order (existing behavior unchanged)
  return order;
}
