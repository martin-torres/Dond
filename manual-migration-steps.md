# Manual Migration Steps for Item-Level Status System

Since the automated migration is having syntax issues, here's a manual step-by-step approach:

## Step 1: Check What You Already Have

Run these queries one by one in your Supabase SQL Editor to see what exists:

```sql
-- Check columns in order_items
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;
```

```sql
-- Check constraints
SELECT constraint_name, constraint_type, check_clause
FROM information_schema.check_constraints 
WHERE table_name = 'order_items';
```

## Step 2: Add Missing Columns (Only if they don't exist)

Based on the results above, add only what's missing:

### If `assigned_station` column is missing:
```sql
ALTER TABLE order_items ADD COLUMN assigned_station TEXT;
```

### If `status_updated_at` column is missing:
```sql
ALTER TABLE order_items ADD COLUMN status_updated_at TIMESTAMPTZ DEFAULT NOW();
```

## Step 3: Add Missing Constraints (Only if they don't exist)

### If `order_items_status_check` constraint is missing:
```sql
ALTER TABLE order_items ADD CONSTRAINT order_items_status_check 
CHECK (status IN ('NEW', 'IN_PROGRESS', 'READY', 'PICKING_UP', 'DELIVERED'));
```

### If `order_items_station_check` constraint is missing:
```sql
ALTER TABLE order_items ADD CONSTRAINT order_items_station_check 
CHECK (assigned_station IN ('kitchen', 'bar', 'server'));
```

## Step 4: Add Indexes (Safe to run multiple times)

```sql
CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(status);
CREATE INDEX IF NOT EXISTS idx_order_items_station ON order_items(assigned_station);
CREATE INDEX IF NOT EXISTS idx_order_items_order_station ON order_items(order_id, assigned_station);
CREATE INDEX IF NOT EXISTS idx_order_items_status_station ON order_items(status, assigned_station);
```

## Step 5: Add Functions and Triggers

```sql
-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_order_item_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status_updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS order_item_status_updated ON order_items;
CREATE TRIGGER order_item_status_updated
BEFORE UPDATE ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_order_item_status_timestamp();

-- Create assign station function
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

-- Create trigger
DROP TRIGGER IF EXISTS order_item_assign_station ON order_items;
CREATE TRIGGER order_item_assign_station
BEFORE INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION assign_item_station();
```

## Step 6: Update Existing Data

```sql
-- Update existing items to have proper station assignment
UPDATE order_items 
SET assigned_station = CASE
  WHEN kind = 'food' THEN 'kitchen'
  WHEN kind = 'drink' THEN 'bar'
  WHEN kind = 'request' THEN 'server'
  ELSE 'kitchen'
END
WHERE assigned_station IS NULL;

-- Update existing items to have status_updated_at
UPDATE order_items 
SET status_updated_at = created_at
WHERE status_updated_at IS NULL;
```

## Step 7: Verify Everything Works

```sql
-- Check that all columns exist
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'order_items' 
AND column_name IN ('status', 'assigned_station', 'status_updated_at');

-- Check constraints exist
SELECT constraint_name
FROM information_schema.check_constraints 
WHERE table_name = 'order_items';

-- Check functions exist
SELECT proname FROM pg_proc WHERE proname LIKE '%order_item%';
```

## Success!

Once all steps complete successfully, your item-level status system will be ready!

## Troubleshooting

- If a step fails because something already exists, that's good! Skip to the next step.
- If you get constraint errors, the constraint already exists.
- If you get column errors, the column already exists.

Run the steps one at a time and let me know which ones succeed or fail.
