-- Phase 3A: Create order_payment_status SQL view
-- Purpose: Derive payment completeness from payments and order_items
-- Rule: This view MUST be used by Phase 3B services, not reimplemented

-- ========================================
-- ORDER_PAYMENT_STATUS VIEW
-- ========================================
-- Purpose: Calculate payment completeness for each order
-- Rule: Payment completeness = SUM(completed payments) >= SUM(order item totals)
--
-- CRITICAL FIXES:
-- 1. Use LEFT JOIN for order_items to include orders with zero items
-- 2. Remove order_type filter to keep view universal and reusable
-- 3. Use COALESCE on SUM to handle NULL from LEFT JOIN

CREATE OR REPLACE VIEW order_payment_status AS
SELECT
  o.id AS order_id,
  o.restaurant_id,
  o.table_id,
  -- CRITICAL: COALESCE to handle orders with zero items (LEFT JOIN)
  COALESCE(SUM(oi.price * oi.quantity), 0) AS total_due,
  COALESCE(
    SUM(p.amount) FILTER (WHERE p.status = 'completed'),
    0
  ) AS total_paid,
  -- CRITICAL: Compare with COALESCE to handle NULL from LEFT JOIN
  (
    COALESCE(
      SUM(p.amount) FILTER (WHERE p.status = 'completed'),
      0
    ) >= COALESCE(SUM(oi.price * oi.quantity), 0)
  ) AS is_payment_complete
FROM orders o
-- CRITICAL: LEFT JOIN to include orders with zero items
-- This prevents orders from disappearing when they have no items
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN payments p ON p.order_id = o.id
-- CRITICAL: Removed order_type filter to keep view universal
-- Business logic (dine_in vs to_go) should be handled in services, not SQL
WHERE o.status NOT IN ('CANCELLED', 'REFUNDED')
GROUP BY o.id, o.restaurant_id, o.table_id;

-- ========================================
-- PHASE 3A COMPLETION NOTIFICATION
-- ========================================
DO $$
BEGIN
  RAISE NOTICE 'Phase 3A: order_payment_status view created';
  RAISE NOTICE 'This view calculates payment completeness for each order';
  RAISE NOTICE 'Usage: SELECT * FROM order_payment_status WHERE order_id = ...';
  RAISE NOTICE 'Rule: Services MUST use this view, not reimplement the math';
END $$;
