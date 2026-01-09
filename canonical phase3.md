🔒 CANONICAL SNAPSHOT — PHASES 0–3
System: Restaurant Ordering, Seating, Billing, and Table Closure
Status: FROZEN (DO NOT MODIFY WITHOUT NEW PHASE)
Cut Date: 2026-01-06
PHASE 0 — FOUNDATIONAL PRINCIPLES (NON-NEGOTIABLE)
P0.1 Core Mental Model
Payments are facts → immutable events
Tables have no stored state → derived on demand
Orders are never marked “paid” → payment completeness is computed
Closure is a consequence, not an action
UI never decides truth → services derive truth
P0.2 Forbidden Actions (Global)
❌ Delete order items
❌ Change prices retroactively
❌ Update “paid / closed / complete” flags
❌ Mutate tables to reflect payment
❌ Edit existing payments
❌ Duplicate payment math outside the canonical view
PHASE 1 — SCHEMA ALIGNMENT (PRE-MIRROR)
P1.1 Existing Tables (Authoritative)
orders
order_items
restaurant_tables
restaurants
These tables remain unchanged throughout Phases 0–3.
PHASE 2 — MIRROR WRITES (NON-BLOCKING)
P2.1 Purpose
Introduce future-authoritative structures without affecting current behavior.
P2.2 Seats Table (Ephemeral Attribution)
CREATE TABLE seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id BIGINT NOT NULL,
  seat_name TEXT NOT NULL,
  seat_number INTEGER,        -- RESERVED (DO NOT WRITE)
  customer_id UUID,           -- RESERVED (DO NOT WRITE)
  created_at TIMESTAMPTZ DEFAULT now()
);
Rules
Seats are ephemeral labels
Seats are never mutated
No updated_at
RLS: DISABLED
seat_number / customer_id are RESERVED ONLY
P2.3 Payments Table (Immutable Events)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id BIGINT NOT NULL,
  payer_customer_id UUID,
  amount NUMERIC NOT NULL,
  method payment_method NOT NULL,
  status payment_status NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
Rules
Payments are append-only
No currency column (derive from restaurant)
No updated_at
RLS: DISABLED
NEVER edited or deleted
P2.4 order_items Enhancement
ALTER TABLE order_items
ADD COLUMN seat_id UUID REFERENCES seats(id) ON DELETE SET NULL;
P2.5 Mirror Write Invariants
All mirror writes are non-blocking
Failures are logged only
Existing UI & flows remain unchanged
No reads from seats or payments yet
PHASE 3 — DERIVED TRUTH (READ-ONLY)
PHASE 3A — Canonical Payment Math View
✅ THE ONLY ALLOWED PAYMENT MATH
CREATE OR REPLACE VIEW order_payment_status AS
SELECT
  o.id AS order_id,
  o.restaurant_id,
  o.table_id,

  -- Total owed (orders with zero items are valid)
  COALESCE(SUM(oi.price * oi.quantity), 0) AS total_due,

  -- Total paid (completed payments only)
  COALESCE(
    SUM(p.amount) FILTER (WHERE p.status = 'completed'),
    0
  ) AS total_paid,

  -- Payment completeness
  (
    COALESCE(
      SUM(p.amount) FILTER (WHERE p.status = 'completed'),
      0
    ) >= COALESCE(SUM(oi.price * oi.quantity), 0)
  ) AS is_payment_complete

FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN payments p ON p.order_id = o.id
WHERE o.status NOT IN ('CANCELLED', 'REFUNDED')
GROUP BY o.id, o.restaurant_id, o.table_id;
View Guarantees
Orders with zero items are included
NULL math is impossible
No business filtering (dine-in vs to-go handled in services)
Universal, reusable, mechanical
PHASE 3B — SERVICES LAYER (DERIVED LOGIC ONLY)
Service 1 — canCloseTable(tableId)
canCloseTable(tableId): {
  eligible: boolean
  reason?: string
  incomplete_orders?: orderId[]
  remaining_balance?: number
}
Rules
Reads only from order_payment_status
If ANY order not payment-complete → not eligible
If zero active orders → eligible
READ-ONLY
Service 2 — getTablePaymentSummary(tableId)
{
  table_id
  number_of_orders
  total_due
  total_paid
  remaining_balance
  table_payment_complete
}
Derived aggregation
No mutations
READ-ONLY
Service 3 — closeTableIfEligible(tableId)
Calls canCloseTable
Emits event/log only
Does NOT:
mutate tables
update availability
touch UI
Staff Override — compRemainingBalance(orderId)
/**
 * Inserts a compensating payment event
 *
 * method = 'comp'
 * status = 'completed'
 * amount = remaining_balance
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
 * - Returns error if already complete
 * - Phase 4 will enforce hard prevention
 */
Allowed Write
INSERT into payments ONLY
GLOBAL INVARIANTS (LOCKED)
✅ No UI changes
✅ No stored payment flags
✅ No table state columns
✅ No payment math outside the view
✅ No edits to historical data
✅ All truth is derived
PHASE BOUNDARY — STOP HERE
❌ NOT YET IMPLEMENTED
Auto-close timers
Distance logic
Staff UI buttons
Table availability updates
RLS enforcement
Hard comp constraints
These belong to Phase 4+ ONLY.