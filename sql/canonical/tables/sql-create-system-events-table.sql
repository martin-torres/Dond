-- Phase 4B.1: Create system_events table (OPTIONAL)
-- Purpose: Advisory event log for table-eligible-for-closure events
-- Rule: Append-only, advisory, never read for truth, no uniqueness, no constraints required

-- ========================================
-- SYSTEM_EVENTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS system_events (
  event_type TEXT NOT NULL,
  table_id TEXT,
  order_id BIGINT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- IMPORTANT RULES
-- ========================================

-- ❌ DO NOT add:
-- - Primary key constraint (no uniqueness required)
-- - Unique indexes
-- - Foreign key constraints
-- - NOT NULL on optional fields (table_id, order_id, payload)
-- - RLS policies
-- - Deduplication logic
-- - Read queries for business logic

-- ✅ This table is:
-- - Append-only
-- - Advisory
-- - Never read for truth
-- - No constraints required
-- - Persistence is optional at Phase 4B.1

-- ========================================
-- USAGE
-- ========================================

-- Insert events (advisory only):
-- INSERT INTO system_events (event_type, table_id, order_id, payload)
-- VALUES ('TableEligibleForClosure', 'table-uuid', 12345, NULL);

-- Read events (for debugging only, not for business logic):
-- SELECT * FROM system_events
-- WHERE event_type = 'TableEligibleForClosure'
-- ORDER BY created_at DESC
-- LIMIT 100;

-- ========================================
-- PHASE 4B.1 COMPLETION NOTIFICATION
-- ========================================

DO $$
BEGIN
  RAISE NOTICE 'Phase 4B.1: system_events table created (optional)';
  RAISE NOTICE 'This table is advisory only - never read for truth';
  RAISE NOTICE 'Events may also be logged to console if table insert fails';
END $$;
