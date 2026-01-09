-- Phase 2: Create seats and payments tables for mirror writes
-- This implements the canonical spec's authoritative structures
-- IMPORTANT: These tables are WRITE-ONLY during Phase 2 (mirroring only)

-- ========================================
-- SEATS TABLE
-- ========================================
-- Purpose: Ephemeral seat attribution for order items
-- Rule: Seats are deleted when visit ends
-- IMPORTANT: Seats are NOT customers. Seats are ephemeral labels.
CREATE TABLE IF NOT EXISTS seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  seat_name TEXT NOT NULL,
  -- NOTE: seat_number and customer_id are reserved for future use
  -- DO NOT write to them in Phase 2. DO NOT use them in logic.
  seat_number INTEGER,
  customer_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- NOTE: No updated_at - seats are not mutated after creation in Phase 2-3
);

-- NOTE: RLS is DISABLED for Phase 2 to avoid blocking mirror writes
-- from service roles, background jobs, or edge functions.
-- RLS will be enabled in Phase 3 when reads become authoritative.
-- ALTER TABLE seats ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_seats_order_id ON seats(order_id);
-- NOTE: idx_seats_customer_id is not needed in Phase 2-3
-- CREATE INDEX IF NOT EXISTS idx_seats_customer_id ON seats(customer_id);

-- ========================================
-- PAYMENTS TABLE
-- ========================================
-- Purpose: Record all payment events as facts
-- Rule: Payments are immutable events, not decisions
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payer_customer_id UUID, -- Optional: who paid (not required in Phase 2)
  amount DECIMAL(10, 2) NOT NULL,
  -- NOTE: Currency is derived from restaurant.currency at write time.
  -- Do NOT allow per-payment currency divergence unless multi-currency is a real goal.
  -- For now, we omit currency to avoid duplication and mismatch risk.
  method VARCHAR(50) NOT NULL CHECK (method IN ('cash', 'card', 'digital', 'auto_charge')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('initiated', 'completed', 'failed')),
  metadata JSONB DEFAULT '{}', -- Store tendered_amount, change_confirmed, processor, transaction_id, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- NOTE: No updated_at - payments are immutable events
);

-- NOTE: RLS is DISABLED for Phase 2 to avoid blocking mirror writes
-- from service roles, background jobs, or edge functions.
-- RLS will be enabled in Phase 3 when reads become authoritative.
-- ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(method);
-- NOTE: idx_payments_payer_customer_id is not needed in Phase 2-3
-- CREATE INDEX IF NOT EXISTS idx_payments_payer_customer_id ON payments(payer_customer_id);

-- ========================================
-- ADD SEAT_ID COLUMN TO ORDER_ITEMS
-- ========================================
-- Purpose: Link order items to seats (Phase 2.2)
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS seat_id UUID REFERENCES seats(id) ON DELETE SET NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_order_items_seat_id ON order_items(seat_id);

-- ========================================
-- PHASE 2 COMPLETION NOTIFICATION
-- ========================================
DO $$
BEGIN
  RAISE NOTICE 'Phase 2 database schema ready for mirror writes';
  RAISE NOTICE 'Tables created: seats, payments';
  RAISE NOTICE 'Column added: order_items.seat_id';
  RAISE NOTICE '';
  RAISE NOTICE 'IMPORTANT PHASE 2 RULES:';
  RAISE NOTICE '✓ RLS is DISABLED to avoid blocking mirror writes';
  RAISE NOTICE '✓ seats.customer_id is RESERVED - do NOT write to it';
  RAISE NOTICE '✓ seats.seat_number is cosmetic - do NOT use in logic';
  RAISE NOTICE '✓ seats have NO updated_at - they are not mutated';
  RAISE NOTICE '✓ payments have NO currency - derive from restaurant';
  RAISE NOTICE '✓ payments have NO updated_at - they are immutable';
  RAISE NOTICE '✓ These tables are for MIRROR WRITES ONLY';
  RAISE NOTICE '✓ Do NOT read from them yet';
  RAISE NOTICE '✓ Do NOT enforce constraints yet';
END $$;
