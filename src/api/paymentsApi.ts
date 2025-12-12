// Lightweight payment abstraction to decouple UI flows from storage.
// TODO: Replace this in-memory store with a real payments table or Stripe integration.

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

const payments = new Map<string, PaymentRecord>();

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
  const record: PaymentRecord = {
    id,
    orderId: params.orderId,
    amount: params.amount,
    currency: params.currency,
    status: 'PENDING',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    metadata: params.metadata,
  };
  payments.set(id, record);
  // For now we just log; future implementation can persist to Supabase or Stripe.
  console.info('[paymentsApi] Created payment record (stub)', record);
  return record;
}

export async function updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<void> {
  const existing = payments.get(paymentId);
  if (!existing) {
    console.warn('[paymentsApi] Tried to update missing payment', paymentId);
    return;
  }
  payments.set(paymentId, { ...existing, status, updatedAt: nowIso() });
  console.info('[paymentsApi] Updated payment status (stub)', paymentId, status);
}

export async function getPaymentRecord(paymentId: string): Promise<PaymentRecord | null> {
  return payments.get(paymentId) ?? null;
}

export async function listPaymentsForOrder(orderId: string): Promise<PaymentRecord[]> {
  return Array.from(payments.values()).filter((p) => p.orderId === orderId);
}
