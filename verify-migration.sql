-- Quick verification script to check if migration completed successfully

-- 1. Check that all required columns exist
SELECT 
  'assigned_station' as column_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'assigned_station'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
  'status_updated_at' as column_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'status_updated_at'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
  'status' as column_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'status'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 2. Check constraints
SELECT 
  'order_items_status_check' as constraint_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE table_name = 'order_items' AND constraint_name = 'order_items_status_check'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
  'order_items_station_check' as constraint_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE table_name = 'order_items' AND constraint_name = 'order_items_station_check'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 3. Check indexes
SELECT 
  'idx_order_items_status' as index_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'order_items' AND indexname = 'idx_order_items_status'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
  'idx_order_items_station' as index_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'order_items' AND indexname = 'idx_order_items_station'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
  'idx_order_items_order_station' as index_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'order_items' AND indexname = 'idx_order_items_order_station'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
  'idx_order_items_status_station' as index_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'order_items' AND indexname = 'idx_order_items_status_station'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 4. Check functions
SELECT 
  'update_order_item_status_timestamp' as function_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'update_order_item_status_timestamp'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
  'assign_item_station' as function_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'assign_item_station'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 5. Check triggers
SELECT 
  'order_item_status_updated' as trigger_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'order_item_status_updated' AND event_object_table = 'order_items'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
  'order_item_assign_station' as trigger_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'order_item_assign_station' AND event_object_table = 'order_items'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 6. Sample data check
SELECT 
  'Sample data check' as check_type,
  COUNT(*) as total_items,
  COUNT(assigned_station) as items_with_station,
  COUNT(status_updated_at) as items_with_timestamp,
  COUNT(CASE WHEN status IN ('NEW', 'IN_PROGRESS', 'READY', 'PICKING_UP', 'DELIVERED') THEN 1 END) as items_with_new_status
FROM order_items;

-- 7. Station assignment check
SELECT 
  'Station assignment check' as check_type,
  assigned_station,
  COUNT(*) as count
FROM order_items 
WHERE assigned_station IS NOT NULL
GROUP BY assigned_station
ORDER BY assigned_station;
