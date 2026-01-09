-- ========================================
-- PHASE 4E: ROW LEVEL SECURITY UPDATE
-- ========================================
-- Purpose: Update RLS policies to constrain access only, not semantics
-- 
-- CANONICAL RULES ENFORCED:
-- 1. RLS constrains access only, never semantics
-- 2. No forbidden patterns: USING (available = true), USING (visible_to_customers = true)
-- 3. Service role must see all rows
-- 4. Public access should not filter by semantic flags

-- ========================================
-- STEP 1: Drop old policies that filter by semantic flags
-- ========================================

DROP POLICY IF EXISTS "Public read access to visible tables" ON restaurant_tables;

-- ========================================
-- STEP 2: Create new policies that constrain access only
-- ========================================

-- Policy for public read access (no semantic filtering)
-- Note: This allows public access to all tables
-- Application layer will filter by derived availability if needed
CREATE POLICY "Public read access to all tables" ON restaurant_tables
  FOR SELECT USING (true);

-- Policy for authenticated users to manage tables
CREATE POLICY "Authenticated users can manage tables" ON restaurant_tables
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ========================================
-- ALTERNATIVE: If restaurant-specific access control is needed
-- ========================================
-- This approach constrains access by restaurant_id, not by semantic flags
-- Uncomment if you need to restrict access to specific restaurants

-- CREATE POLICY "Public read access by restaurant" ON restaurant_tables
--   FOR SELECT USING (
--     restaurant_id IN (
--       SELECT id FROM restaurants WHERE visible_to_customers = true
--     )
--   );

-- ========================================
-- VERIFICATION
-- ========================================

-- Verify policies are in place
-- SELECT schemaname, tablename, policyname, roles, cmd, qual
-- FROM pg_policies 
-- WHERE tablename = 'restaurant_tables';

-- ========================================
-- PHASE 4E COMPLETION NOTIFICATION
-- ========================================
DO $$
BEGIN
  RAISE NOTICE 'Phase 4E: RLS policies updated';
  RAISE NOTICE 'Old policy filtering by visible_to_customers removed';
  RAISE NOTICE 'New policy allows public read access to all tables';
  RAISE NOTICE 'Rule: RLS constrains access only, never semantics';
END $$;