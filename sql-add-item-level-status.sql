-- Add item-level status tracking to order_items table
-- This enables independent status tracking for food, drinks, and requests

-- Step 1: Add status column to order_items
ALTER TABLE order_items 
ADD COLUMN status TEXT DEFAULT 'NEW' NOT NULL;

-- Step 2: Add status constraint
ALTER TABLE order_items 
ADD CONSTRAINT order_items_status_check 
CHECK (status IN ('NEW', 'IN_PROGRESS', 'READY', 'PICKING_UP', 'DELIVERED'));

-- Step 3: Add station assignment column
ALTER TABLE order_items 
ADD COLUMN assigned_station TEXT;

-- Step 4: Add station constraint
ALTER TABLE order_items 
ADD CONSTRAINT order_items_station_check 
CHECK (assigned_station IN ('kitchen', 'bar', 'server'));

-- Step 5: Add status timestamp for tracking
ALTER TABLE order_items 
ADD COLUMN status_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Step 6: Add indexes for performance
CREATE INDEX idx_order_items_status ON order_items(status);
CREATE INDEX idx_order_items_station ON order_items(assigned_station);
CREATE INDEX idx_order_items_order_station ON order_items(order_id, assigned_station);
CREATE INDEX idx_order_items_status_station ON order_items(status, assigned_station);

-- Step 7: Function to auto-update status timestamp
CREATE OR REPLACE FUNCTION update_order_item_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status_updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Trigger to auto-update timestamp
CREATE TRIGGER order_item_status_updated
BEFORE UPDATE ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_order_item_status_timestamp();

-- Step 9: Function to auto-assign station based on item kind
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

-- Step 10: Trigger to auto-assign station
CREATE TRIGGER order_item_assign_station
BEFORE INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION assign_item_station();

-- Step 11: Update existing items to have proper station assignment
UPDATE order_items 
SET assigned_station = CASE
  WHEN kind = 'food' THEN 'kitchen'
  WHEN kind = 'drink' THEN 'bar'
  WHEN kind = 'request' THEN 'server'
  ELSE 'kitchen'
END
WHERE assigned_station IS NULL;

-- Step 12: Update existing items to have status_updated_at
UPDATE order_items 
SET status_updated_at = created_at
WHERE status_updated_at IS NULL;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Item-level status system successfully added!';
  RAISE NOTICE 'Each order item now has independent status tracking';
  RAISE NOTICE 'Stations are auto-assigned based on item kind';
  RAISE NOTICE 'Triggers ensure data consistency';
END $$;
