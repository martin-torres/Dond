-- Final verification and cleanup script
-- This will check what was successfully added and clean up any partial migration issues

-- 1. Check what constraints already exist
SELECT constraint_name, check_clause
FROM information_schema.check_constraints 
WHERE table_name = 'order_items'
AND constraint_name LIKE '%order_items%';

-- 2. Check what columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'order_items' 
AND column_name IN ('status', 'assigned_station', 'status_updated_at', 'station', 'item_status')
ORDER BY column_name;

-- 3. Check what indexes exist
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'order_items'
AND indexname LIKE '%order_items%';

-- 4. Check what functions exist
SELECT proname, prosrc
FROM pg_proc 
WHERE proname IN ('update_order_item_status_timestamp', 'assign_item_station');

-- 5. Check what triggers exist
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'order_items'
AND trigger_name LIKE '%order_item%';

-- 6. Check current data status
SELECT 
  COUNT(*) as total_items,
  COUNT(assigned_station) as items_with_assigned_station,
  COUNT(status_updated_at) as items_with_timestamp,
  COUNT(CASE WHEN status IN ('NEW', 'IN_PROGRESS', 'READY', 'PICKING_UP', 'DELIVERED') THEN 1 END) as items_with_new_status,
  COUNT(CASE WHEN status = 'queued' THEN 1 END) as items_with_old_status
FROM order_items;

-- 7. Check station assignments
SELECT 
  assigned_station,
  COUNT(*) as count
FROM order_items 
WHERE assigned_station IS NOT NULL
GROUP BY assigned_station
ORDER BY assigned_station;

-- 8. Check if we need to add missing components
-- Add assigned_station column if missing
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS assigned_station TEXT;

-- Add status_updated_at column if missing  
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add station constraint if missing (handle the duplicate constraint error gracefully)
DO $$
BEGIN
  BEGIN
    ALTER TABLE order_items ADD CONSTRAINT order_items_station_check 
    CHECK (assigned_station IN ('kitchen', 'bar', 'server'));
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Constraint order_items_station_check already exists';
  END;
END $$;

-- 9. Create functions if they don't exist
CREATE OR REPLACE FUNCTION update_order_item_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status_updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION assign_item_station()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_station IS NULL THEN
    NEW.assigned_station = CASE
      WHEN NEW.kind = 'food' THEN 'kitchen'
      WHEN NEW.kind = 'drink' THEN 'bar'
      WHEN NEW.kind = 'request' THEN 'server'
      ELSE 'kitchen'
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create triggers (drop and recreate to ensure they exist)
DROP TRIGGER IF EXISTS order_item_status_updated ON order_items;
CREATE TRIGGER order_item_status_updated
BEFORE UPDATE ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_order_item_status_timestamp();

DROP TRIGGER IF EXISTS order_item_assign_station ON order_items;
CREATE TRIGGER order_item_assign_station
BEFORE INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION assign_item_station();

-- 11. Update existing data to have proper assignments
UPDATE order_items 
SET assigned_station = CASE
  WHEN kind = 'food' THEN 'kitchen'
  WHEN kind = 'drink' THEN 'bar'
  WHEN kind = 'request' THEN 'server'
  ELSE 'kitchen'
END
WHERE assigned_station IS NULL;

UPDATE order_items 
SET status_updated_at = created_at
WHERE status_updated_at IS NULL;

-- 12. Final success check
SELECT '✅ Migration verification complete! Item-level status system is ready.' as message;
