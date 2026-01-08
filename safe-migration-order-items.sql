-- Safe migration script for order_items table
-- This script checks if columns/constraints exist before adding them
-- Run this instead of the original sql-add-item-level-status.sql

-- 1. Add status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'status'
  ) THEN
    ALTER TABLE order_items ADD COLUMN status TEXT DEFAULT 'NEW' NOT NULL;
    RAISE NOTICE 'Added status column to order_items';
  ELSE
    RAISE NOTICE 'status column already exists in order_items';
  END IF;
END $$;

-- 2. Add status constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE table_name = 'order_items' AND constraint_name = 'order_items_status_check'
  ) THEN
    ALTER TABLE order_items 
    ADD CONSTRAINT order_items_status_check 
    CHECK (status IN ('NEW', 'IN_PROGRESS', 'READY', 'PICKING_UP', 'DELIVERED'));
    RAISE NOTICE 'Added status check constraint to order_items';
  ELSE
    RAISE NOTICE 'status check constraint already exists in order_items';
  END IF;
END $$;

-- 3. Add assigned_station column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'assigned_station'
  ) THEN
    ALTER TABLE order_items ADD COLUMN assigned_station TEXT;
    RAISE NOTICE 'Added assigned_station column to order_items';
  ELSE
    RAISE NOTICE 'assigned_station column already exists in order_items';
  END IF;
END $$;

-- 4. Add assigned_station constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE table_name = 'order_items' AND constraint_name = 'order_items_station_check'
  ) THEN
    ALTER TABLE order_items 
    ADD CONSTRAINT order_items_station_check 
    CHECK (assigned_station IN ('kitchen', 'bar', 'server'));
    RAISE NOTICE 'Added assigned_station check constraint to order_items';
  ELSE
    RAISE NOTICE 'assigned_station check constraint already exists in order_items';
  END IF;
END $$;

-- 5. Add status_updated_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'status_updated_at'
  ) THEN
    ALTER TABLE order_items ADD COLUMN status_updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added status_updated_at column to order_items';
  ELSE
    RAISE NOTICE 'status_updated_at column already exists in order_items';
  END IF;
END $$;

-- 6. Add indexes if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'order_items' AND indexname = 'idx_order_items_status'
  ) THEN
    CREATE INDEX idx_order_items_status ON order_items(status);
    RAISE NOTICE 'Created index idx_order_items_status';
  ELSE
    RAISE NOTICE 'Index idx_order_items_status already exists';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'order_items' AND indexname = 'idx_order_items_station'
  ) THEN
    CREATE INDEX idx_order_items_station ON order_items(assigned_station);
    RAISE NOTICE 'Created index idx_order_items_station';
  ELSE
    RAISE NOTICE 'Index idx_order_items_station already exists';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'order_items' AND indexname = 'idx_order_items_order_station'
  ) THEN
    CREATE INDEX idx_order_items_order_station ON order_items(order_id, assigned_station);
    RAISE NOTICE 'Created index idx_order_items_order_station';
  ELSE
    RAISE NOTICE 'Index idx_order_items_order_station already exists';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'order_items' AND indexname = 'idx_order_items_status_station'
  ) THEN
    CREATE INDEX idx_order_items_status_station ON order_items(status, assigned_station);
    RAISE NOTICE 'Created index idx_order_items_status_station';
  ELSE
    RAISE NOTICE 'Index idx_order_items_status_station already exists';
  END IF;
END $$;

-- 7. Create update timestamp function if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'update_order_item_status_timestamp'
  ) THEN
    CREATE OR REPLACE FUNCTION update_order_item_status_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.status IS DISTINCT FROM OLD.status THEN
        NEW.status_updated_at = NOW();
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    RAISE NOTICE 'Created function update_order_item_status_timestamp';
  ELSE
    RAISE NOTICE 'Function update_order_item_status_timestamp already exists';
  END IF;
END $$;

-- 8. Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'order_item_status_updated' AND event_object_table = 'order_items'
  ) THEN
    CREATE TRIGGER order_item_status_updated
    BEFORE UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_item_status_timestamp();
    RAISE NOTICE 'Created trigger order_item_status_updated';
  ELSE
    RAISE NOTICE 'Trigger order_item_status_updated already exists';
  END IF;
END $$;

-- 9. Create assign station function if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'assign_item_station'
  ) THEN
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
    RAISE NOTICE 'Created function assign_item_station';
  ELSE
    RAISE NOTICE 'Function assign_item_station already exists';
  END IF;
END $$;

-- 10. Create trigger for station assignment if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'order_item_assign_station' AND event_object_table = 'order_items'
  ) THEN
    CREATE TRIGGER order_item_assign_station
    BEFORE INSERT ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION assign_item_station();
    RAISE NOTICE 'Created trigger order_item_assign_station';
  ELSE
    RAISE NOTICE 'Trigger order_item_assign_station already exists';
  END IF;
END $$;

-- 11. Update existing items to have proper station assignment if needed
DO $$
BEGIN
  UPDATE order_items 
  SET assigned_station = CASE
    WHEN kind = 'food' THEN 'kitchen'
    WHEN kind = 'drink' THEN 'bar'
    WHEN kind = 'request' THEN 'server'
    ELSE 'kitchen'
  END
  WHERE assigned_station IS NULL;
  
  RAISE NOTICE 'Updated existing items with station assignment';
END $$;

-- 12. Update existing items to have status_updated_at if needed
DO $$
BEGIN
  UPDATE order_items 
  SET status_updated_at = created_at
  WHERE status_updated_at IS NULL;
  
  RAISE NOTICE 'Updated existing items with status_updated_at';
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Safe migration complete! Item-level status system is ready.';
  RAISE NOTICE 'All columns, constraints, indexes, and triggers have been added (if they were missing).';
END $$;
