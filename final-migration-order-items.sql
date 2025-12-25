-- Final corrected migration script for order_items table
-- This version uses correct PostgreSQL syntax for Supabase

-- 1. Add status column if it doesn't exist
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'NEW' NOT NULL;

-- 2. Add status constraint if it doesn't exist (use exception handling)
DO $$
BEGIN
  BEGIN
    ALTER TABLE order_items ADD CONSTRAINT order_items_status_check 
    CHECK (status IN ('NEW', 'IN_PROGRESS', 'READY', 'PICKING_UP', 'DELIVERED'));
  EXCEPTION WHEN duplicate_object THEN
    -- Constraint already exists, do nothing
    NULL;
  END;
END $$;

-- 3. Add assigned_station column if it doesn't exist
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS assigned_station TEXT;

-- 4. Add assigned_station constraint if it doesn't exist
DO $$
BEGIN
  BEGIN
    ALTER TABLE order_items ADD CONSTRAINT order_items_station_check 
    CHECK (assigned_station IN ('kitchen', 'bar', 'server'));
  EXCEPTION WHEN duplicate_object THEN
    -- Constraint already exists, do nothing
    NULL;
  END;
END $$;

-- 5. Add status_updated_at column if it doesn't exist
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ DEFAULT NOW();

-- 6. Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(status);
CREATE INDEX IF NOT EXISTS idx_order_items_station ON order_items(assigned_station);
CREATE INDEX IF NOT EXISTS idx_order_items_order_station ON order_items(order_id, assigned_station);
CREATE INDEX IF NOT EXISTS idx_order_items_status_station ON order_items(status, assigned_station);

-- 7. Create update timestamp function if it doesn't exist
CREATE OR REPLACE FUNCTION update_order_item_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status_updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS order_item_status_updated ON order_items;
CREATE TRIGGER order_item_status_updated
BEFORE UPDATE ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_order_item_status_timestamp();

-- 9. Create assign station function if it doesn't exist
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

-- 10. Create trigger for station assignment if it doesn't exist
DROP TRIGGER IF EXISTS order_item_assign_station ON order_items;
CREATE TRIGGER order_item_assign_station
BEFORE INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION assign_item_station();

-- 11. Update existing items to have proper station assignment if needed
UPDATE order_items 
SET assigned_station = CASE
  WHEN kind = 'food' THEN 'kitchen'
  WHEN kind = 'drink' THEN 'bar'
  WHEN kind = 'request' THEN 'server'
  ELSE 'kitchen'
END
WHERE assigned_station IS NULL;

-- 12. Update existing items to have status_updated_at if needed
UPDATE order_items 
SET status_updated_at = created_at
WHERE status_updated_at IS NULL;

-- Success message
SELECT 'Migration complete! Item-level status system is ready.' as message;
