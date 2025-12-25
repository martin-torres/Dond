-- Targeted migration for your existing order_items table
-- Only adds what's missing based on your current structure

-- 1. Add missing columns
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS assigned_station TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Add constraints for proper status values
-- Note: Your current status uses 'queued', we'll add constraint for our new values
ALTER TABLE order_items ADD CONSTRAINT order_items_status_check 
CHECK (status IN ('NEW', 'IN_PROGRESS', 'READY', 'PICKING_UP', 'DELIVERED', 'queued'));

-- 3. Add constraint for assigned_station
ALTER TABLE order_items ADD CONSTRAINT order_items_station_check 
CHECK (assigned_station IN ('kitchen', 'bar', 'server'));

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(status);
CREATE INDEX IF NOT EXISTS idx_order_items_station ON order_items(assigned_station);
CREATE INDEX IF NOT EXISTS idx_order_items_order_station ON order_items(order_id, assigned_station);
CREATE INDEX IF NOT EXISTS idx_order_items_status_station ON order_items(status, assigned_station);

-- 5. Create update timestamp function
CREATE OR REPLACE FUNCTION update_order_item_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status_updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for status updates
DROP TRIGGER IF EXISTS order_item_status_updated ON order_items;
CREATE TRIGGER order_item_status_updated
BEFORE UPDATE ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_order_item_status_timestamp();

-- 7. Create assign station function
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

-- 8. Create trigger for station assignment
DROP TRIGGER IF EXISTS order_item_assign_station ON order_items;
CREATE TRIGGER order_item_assign_station
BEFORE INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION assign_item_station();

-- 9. Update existing items to have proper station assignment
UPDATE order_items 
SET assigned_station = CASE
  WHEN kind = 'food' THEN 'kitchen'
  WHEN kind = 'drink' THEN 'bar'
  WHEN kind = 'request' THEN 'server'
  ELSE 'kitchen'
END
WHERE assigned_station IS NULL;

-- 10. Update existing items to have status_updated_at
UPDATE order_items 
SET status_updated_at = created_at
WHERE status_updated_at IS NULL;

-- Success message
SELECT 'Targeted migration complete! Item-level status system is ready.' as message;
