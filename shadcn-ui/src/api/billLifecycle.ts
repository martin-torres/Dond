// src/api/billLifecycle.ts
import { supabase } from '../lib/supabaseClient';
import { OrderRow, OrderItemRow } from './ordersApi';

/**
 * Manages the complete lifecycle of a bill from creation to payment and clearing.
 * Ensures bills are properly cleared after payment so no data carries over to next customer.
 */

export type BillStatus = 'OPEN' | 'REQUESTED' | 'PAID' | 'CLEARED';

export type BillRecord = {
  id: string;
  restaurant_id: string;
  table_id: string;
  order_ids: string[]; // Array of order IDs that make up this bill
  status: BillStatus;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  payment_method?: string | null;
  paid_at?: string | null;
  cleared_at?: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Create a new bill for a table's orders
 */
export async function createBill(params: {
  restaurantId: string;
  tableId: string;
  orderIds: string[];
  subtotal: number;
  tax: number;
  tip?: number;
}): Promise<BillRecord> {
  const tip = params.tip || 0;
  const total = params.subtotal + params.tax + tip;

  const billData = {
    restaurant_id: params.restaurantId,
    table_id: params.tableId,
    order_ids: params.orderIds,
    status: 'OPEN' as BillStatus,
    subtotal: params.subtotal,
    tax: params.tax,
    tip,
    total,
  };

  const { data, error } = await supabase
    .from('bills')
    .insert(billData)
    .select()
    .single();

  if (error) {
    console.error('[billLifecycle] Error creating bill:', error);
    throw error;
  }

  console.log('✅ Created bill:', data.id, 'for table:', params.tableId);
  return data as BillRecord;
}

/**
 * Update bill status (e.g., when customer requests bill)
 */
export async function updateBillStatus(billId: string, status: BillStatus): Promise<void> {
  const updates: Partial<BillRecord> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'REQUESTED') {
    // Bill has been requested by customer
    console.log('📋 Bill requested:', billId);
  } else if (status === 'PAID') {
    updates.paid_at = new Date().toISOString();
    console.log('💳 Bill paid:', billId);
  } else if (status === 'CLEARED') {
    updates.cleared_at = new Date().toISOString();
    console.log('✅ Bill cleared:', billId);
  }

  const { error } = await supabase
    .from('bills')
    .update(updates)
    .eq('id', billId);

  if (error) {
    console.error('[billLifecycle] Error updating bill status:', error);
    throw error;
  }
}

/**
 * Record payment for a bill
 */
export async function recordBillPayment(params: {
  billId: string;
  paymentMethod: string;
  tip: number;
}): Promise<void> {
  const { data: bill, error: fetchError } = await supabase
    .from('bills')
    .select('*')
    .eq('id', params.billId)
    .single();

  if (fetchError || !bill) {
    console.error('[billLifecycle] Error fetching bill for payment:', fetchError);
    throw fetchError;
  }

  const newTotal = bill.subtotal + bill.tax + params.tip;

  const { error: updateError } = await supabase
    .from('bills')
    .update({
      tip: params.tip,
      total: newTotal,
      payment_method: params.paymentMethod,
      status: 'PAID',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.billId);

  if (updateError) {
    console.error('[billLifecycle] Error recording payment:', updateError);
    throw updateError;
  }

  console.log('✅ Payment recorded for bill:', params.billId);
}

/**
 * Clear a bill and all associated orders after payment
 * This ensures no data carries over to the next customer
 */
export async function clearBillAfterPayment(billId: string): Promise<void> {
  // 1. Get the bill
  const { data: bill, error: billError } = await supabase
    .from('bills')
    .select('*')
    .eq('id', billId)
    .single();

  if (billError || !bill) {
    console.error('[billLifecycle] Error fetching bill for clearing:', billError);
    throw billError;
  }

  if (bill.status !== 'PAID') {
    throw new Error('Cannot clear unpaid bill');
  }

  // 2. Mark all associated orders as DELIVERED
  const { error: ordersError } = await supabase
    .from('orders')
    .update({
      status: 'DELIVERED',
      updated_at: new Date().toISOString(),
    })
    .in('id', bill.order_ids);

  if (ordersError) {
    console.error('[billLifecycle] Error updating orders:', ordersError);
    throw ordersError;
  }

  // 3. Mark all order items as delivered
  const { error: itemsError } = await supabase
    .from('order_items')
    .update({
      status: 'delivered',
    })
    .in('order_id', bill.order_ids);

  if (itemsError) {
    console.error('[billLifecycle] Error updating order items:', itemsError);
    throw itemsError;
  }

  // 4. Mark bill as CLEARED
  await updateBillStatus(billId, 'CLEARED');

  console.log('✅ Bill cleared completely:', billId);
}

/**
 * Get the current bill for a table (if any)
 */
export async function getCurrentBillForTable(tableId: string): Promise<BillRecord | null> {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('table_id', tableId)
    .in('status', ['OPEN', 'REQUESTED', 'PAID'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - no active bill
      return null;
    }
    console.error('[billLifecycle] Error fetching current bill:', error);
    throw error;
  }

  return data as BillRecord;
}

/**
 * Get all order items for a bill
 */
export async function getBillItems(billId: string): Promise<OrderItemRow[]> {
  const { data: bill, error: billError } = await supabase
    .from('bills')
    .select('order_ids')
    .eq('id', billId)
    .single();

  if (billError || !bill) {
    console.error('[billLifecycle] Error fetching bill:', billError);
    throw billError;
  }

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', bill.order_ids);

  if (itemsError) {
    console.error('[billLifecycle] Error fetching bill items:', itemsError);
    throw itemsError;
  }

  return (items || []) as OrderItemRow[];
}

/**
 * Subscribe to bill changes for real-time updates
 */
export function subscribeToBillChanges(
  tableId: string,
  onChange: (bill: BillRecord | null) => void
): () => void {
  const channel = supabase
    .channel(`bill-changes-${tableId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bills',
        filter: `table_id=eq.${tableId}`,
      },
      async (payload) => {
        if (payload.eventType === 'DELETE') {
          onChange(null);
        } else {
          const bill = payload.new as BillRecord;
          onChange(bill);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}