-- Diagnostic and cleanup script for rest-one-maui restaurant
-- This will identify and fix common issues that break restaurant functionality

-- Step 1: Check for duplicate slugs
SELECT 
  slug, 
  COUNT(*) as duplicate_count,
  ARRAY_AGG(id) as restaurant_ids
FROM restaurants 
WHERE slug = 'rest-one-maui'
GROUP BY slug
HAVING COUNT(*) > 1;

-- Step 2: Check UUID consistency for rest-one-maui
SELECT 
  id,
  slug,
  name,
  created_at
FROM restaurants 
WHERE slug = 'rest-one-maui';

-- Step 3: Check for orphaned tables (tables pointing to non-existent restaurant)
SELECT 
  COUNT(*) as orphaned_tables
FROM restaurant_tables rt
WHERE rt.restaurant_id NOT IN (
  SELECT id FROM restaurants WHERE slug = 'rest-one-maui'
);

-- Step 4: Check for orphaned menu items
SELECT 
  COUNT(*) as orphaned_menu_items
FROM restaurant_menu_items rmi
WHERE rmi.restaurant_id NOT IN (
  SELECT id FROM restaurants WHERE slug = 'rest-one-maui'
);

-- Step 5: Check for orphaned floor plans
SELECT 
  COUNT(*) as orphaned_floor_plans
FROM restaurant_floor_plans rfp
WHERE rfp.restaurant_id NOT IN (
  SELECT id FROM restaurants WHERE slug = 'rest-one-maui'
);

-- Step 6: Check for inconsistent restaurant IDs in orders
SELECT 
  COUNT(*) as orders_with_wrong_restaurant_id
FROM orders o
WHERE o.restaurant_id NOT IN (
  SELECT id FROM restaurants WHERE slug = 'rest-one-maui'
) AND o.restaurant_id IS NOT NULL;

-- Step 7: Find the correct UUID for rest-one-maui
SELECT 
  id as correct_restaurant_uuid,
  slug,
  name,
  created_at
FROM restaurants 
WHERE slug = 'rest-one-maui'
ORDER BY created_at DESC
LIMIT 1;

-- Step 8: Cleanup script (run this if issues are found)
-- Uncomment and run the sections below if the diagnostics show problems

/*
-- Fix orphaned tables
DELETE FROM restaurant_tables 
WHERE restaurant_id NOT IN (SELECT id FROM restaurants);

-- Fix orphaned menu items  
DELETE FROM restaurant_menu_items
WHERE restaurant_id NOT IN (SELECT id FROM restaurants);

-- Fix orphaned floor plans
DELETE FROM restaurant_floor_plans
WHERE restaurant_id NOT IN (SELECT id FROM restaurants);

-- Fix orders with wrong restaurant_id
UPDATE orders 
SET restaurant_id = (SELECT id FROM restaurants WHERE slug = 'rest-one-maui' LIMIT 1)
WHERE restaurant_id NOT IN (SELECT id FROM restaurants)
AND restaurant_id IS NOT NULL;

-- If there are duplicate slugs, keep the most recent one
WITH duplicates AS (
  SELECT 
    slug,
    id,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at DESC) as rn
  FROM restaurants
  WHERE slug = 'rest-one-maui'
)
DELETE FROM restaurants 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);
*/

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Diagnostic complete. Check results above for any issues.';
  RAISE NOTICE 'If issues found, uncomment and run the cleanup section.';
  RAISE NOTICE 'After cleanup, rest-one-maui should work properly.';
END $$;
