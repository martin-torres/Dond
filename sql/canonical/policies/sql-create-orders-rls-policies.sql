-- ========================================
-- ORDERS TABLE ROW LEVEL SECURITY POLICIES
-- ========================================
-- Purpose: Enable RLS and create policies for orders table
-- 
-- CANONICAL RULES ENFORCED:
-- 1. RLS constrains access only, never semantics
-- 2. Service role must see all rows (for API calls)
-- 3. Authenticated users can read orders
-- 4. Staff can update order status
-- 5. No forbidden patterns: USING (status = 'X'), USING (available = true)

-- ========================================
-- STEP 1: Enable RLS on orders table
-- ========================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 2: Drop old policies if they exist
-- ========================================

DROP POLICY IF EXISTS "Service role full access" ON orders;
DROP POLICY IF EXISTS "Authenticated users read access" ON orders;
DROP POLICY IF EXISTS "Staff can update status" ON orders;
DROP POLICY IF EXISTS "Public can create orders" ON orders;

-- ========================================
-- STEP 3: Create new policies
-- ========================================

-- Policy for service role (API calls, background jobs)
-- Service role can do everything
CREATE POLICY "Service role full access" ON orders
  FOR ALL USING (auth.role() = 'service_role');

-- Policy for authenticated users to read orders
-- This allows staff to view orders in the UI
CREATE POLICY "Authenticated users read access" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for staff to update orders
-- Staff can update order status, station status, and timestamps
CREATE POLICY "Staff can update orders" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Policy for public to create orders (customer orders)
-- Customers can create new orders
CREATE POLICY "Public can create orders" ON orders
  FOR INSERT WITH CHECK (true);

-- ========================================
-- STEP 4: Verify policies
-- ========================================

-- To verify policies are in place, run:
-- SELECT schemaname, tablename, policyname, roles, cmd, qual
-- FROM pg_policies 
-- WHERE tablename = 'orders'
-- ORDER BY policyname;

-- ========================================
-- COMPLETION NOTIFICATION
-- ========================================
DO $$
BEGIN
  RAISE NOTICE 'Orders table RLS policies created successfully';
  RAISE NOTICE 'Service role: Full access';
  RAISE NOTICE 'Authenticated users: Read + Update access';
  RAISE NOTICE 'Public: Create access (for customer orders)';
  RAISE NOTICE '';
  RAISE NOTICE 'IMPORTANT: These policies allow status updates to work correctly';
  RAISE NOTICE 'Staff can now update kitchen_status, bar_status, foh_request_status';
  RAISE NOTICE 'and related timestamp columns without being blocked by RLS';
END $$;