// Payment persistence to Supabase database
// Replaces in-memory store with real payments table persistence

import { supabase } from '../lib/supabaseClient';

export type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'PAID' | 'FAILED' | 'CANCELED';

export type PaymentRecord = {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, string | number | boolean | null>;
};

const nowIso = () => new Date().toISOString();

const makeId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `pay_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

export async function createPaymentRecord(params: {
  orderId: string;
  amount: number;
  currency: string;
  metadata?: Record<string, string | number | boolean | null>;
}): Promise<PaymentRecord> {
  const id = makeId();
  const timestamp = nowIso();
  
  // Map PaymentStatus to database status values
  // 'PAID' -> 'completed', 'FAILED' -> 'failed', 'PENDING' -> 'initiated'
  const mapStatusToDb = (status: PaymentStatus): string => {
    switch (status) {
      case 'PAID': return 'completed';
      case 'FAILED': return 'failed';
      case 'PENDING': return 'initiated';
      case 'AUTHORIZED': return 'initiated';
      case 'CANCELED': return 'failed';
      default: return 'initiated';
    }
  };

  // Insert into Supabase payments table
  const { data, error } = await supabase
    .from('payments')
    .insert({
      id: id,
      order_id: params.orderId,
      amount: params.amount,
      method: 'card', // Default method; can be overridden in metadata
      status: mapStatusToDb('PENDING'),
      metadata: {
        ...params.metadata,
        currency: params.currency,
        ui_status: 'PENDING', // Store original UI status in metadata
        created_at_ui: timestamp,
      },
      created_at: timestamp,
    })
    .select()
    .single();

  if (error) {
    console.error('[paymentsApi] Failed to insert payment record:', error);
    throw new Error(`Failed to create payment record: ${error.message}`);
  }

  const record: PaymentRecord = {
    id: data.id,
    orderId: data.order_id,
    amount: data.amount,
    currency: params.currency,
    status: 'PENDING',
    createdAt: data.created_at,
    updatedAt: data.created_at,
    metadata: params.metadata,
  };

  console.info('[paymentsApi] Created payment record in database:', record);
  return record;
}

export async function updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<void> {
  const dbStatus = status === 'PAID' ? 'completed' : 
                   status === 'FAILED' ? 'failed' : 'initiated';
  
  const { error } = await supabase
    .from('payments')
    .update({
      status: dbStatus,
      metadata: {
        ui_status: status,
        updated_at_ui: nowIso(),
      },
    })
    .eq('id', paymentId);

  if (error) {
    console.error('[paymentsApi] Failed to update payment status:', error);
    throw new Error(`Failed to update payment status: ${error.message}`);
  }

  console.info('[paymentsApi] Updated payment status in database:', paymentId, status);
}

export async function getPaymentRecord(paymentId: string): Promise<PaymentRecord | null> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (error || !data) {
    console.warn('[paymentsApi] Payment not found:', paymentId);
    return null;
  }

  // Map database record back to UI PaymentRecord format
  const metadata = data.metadata || {};
  return {
    id: data.id,
    orderId: data.order_id,
    amount: data.amount,
    currency: metadata.currency || 'USD',
    status: (metadata.ui_status as PaymentStatus) || 'PENDING',
    createdAt: data.created_at,
    updatedAt: data.created_at,
    metadata: metadata,
  };
}

export async function listPaymentsForOrder(orderId: string): Promise<PaymentRecord[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[paymentsApi] Failed to fetch payments for order:', error);
    return [];
  }

  return data.map((row): PaymentRecord => {
    const metadata = row.metadata || {};
    return {
      id: row.id,
      orderId: row.order_id,
      amount: row.amount,
      currency: metadata.currency || 'USD',
      status: (metadata.ui_status as PaymentStatus) || 'PENDING',
      createdAt: row.created_at,
      updatedAt: row.created_at,
      metadata: metadata,
    };
  });
}
