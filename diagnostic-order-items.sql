-- Diagnostic script to check order_items table structure
-- Run this to see exactly what columns and constraints exist

-- 1. Check current columns in order_items table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

-- 2. Check existing constraints on order_items
SELECT 
  constraint_name,
  constraint_type,
  column_name
FROM information_schema.key_column_usage 
WHERE table_name = 'order_items'
UNION ALL
SELECT 
  constraint_name,
  constraint_type,
  NULL as column_name
FROM information_schema.table_constraints 
WHERE table_name = 'order_items' 
  AND constraint_type = 'CHECK'
ORDER BY constraint_name;

-- 3. Check if status column has a check constraint
SELECT 
  constraint_name,
  check_clause
FROM information_schema.check_constraints 
WHERE table_name = 'order_items';

-- 4. Check for triggers on order_items
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_condition
FROM information_schema.triggers 
WHERE event_object_table = 'order_items';

-- 5. Check for functions related to order_items
SELECT 
  proname,
  prosrc
FROM pg_proc 
WHERE proname LIKE '%order_item%' 
   OR proname LIKE '%status%';

-- 6. Check for indexes on order_items
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'order_items';

-- 7. Sample data to see current status values
SELECT DISTINCT status 
FROM order_items 
WHERE status IS NOT NULL 
LIMIT 10;

-- 8. Check assigned_station column if it exists
SELECT DISTINCT assigned_station 
FROM order_items 
WHERE assigned_station IS NOT NULL 
LIMIT 10;

-- 9. Check status_updated_at column if it exists
SELECT 
  COUNT(*) as total_items,
  COUNT(status_updated_at) as items_with_timestamp,
  MIN(status_updated_at) as oldest_timestamp,
  MAX(status_updated_at) as newest_timestamp
FROM order_items;

-- 10. Summary of what we need vs what exists
WITH requirements AS (
  SELECT 'status' as column_name, 'text' as data_type, 'NOT NULL' as nullable, 'NEW' as default_value
  UNION ALL
  SELECT 'assigned_station', 'text', 'NULL', NULL
  UNION ALL
  SELECT 'status_updated_at', 'timestamptz', 'NULL', 'NOW()'
),
current_columns AS (
  SELECT 
    column_name,
    data_type,
    CASE WHEN is_nullable = 'NO' THEN 'NOT NULL' ELSE 'NULL' END as nullable,
    column_default
  FROM information_schema.columns 
  WHERE table_name = 'order_items'
)
SELECT 
  r.column_name,
  r.data_type as required_type,
  r.nullable as required_nullable,
  r.default_value as required_default,
  c.data_type as current_type,
  c.nullable as current_nullable,
  c.column_default as current_default,
  CASE 
    WHEN c.column_name IS NULL THEN 'MISSING'
    WHEN r.data_type != c.data_type THEN 'TYPE MISMATCH'
    WHEN r.nullable != c.nullable THEN 'NULLABLE MISMATCH'
    ELSE 'OK'
  END as status
FROM requirements r
LEFT JOIN current_columns c ON r.column_name = c.column_name
ORDER BY r.column_name;
