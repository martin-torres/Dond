-- Database Migration Script: UUID-Only Architecture
-- Step 1: Add UUID extension (only if needed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp'
  ) THEN
    CREATE EXTENSION "uuid-ossp";
  END IF;
END $$;

-- Step 2: Add UUID columns and constraints
DO $$
BEGIN
  -- Add UUID columns
  ALTER TABLE restaurants 
  ADD COLUMN IF NOT EXISTS id UUID UNIQUE DEFAULT gen_random_uuid(),
  ADD CONSTRAINT IF NOT EXISTS restaurants_id_check CHECK (id IS NOT NULL),
  ADD CONSTRAINT IF NOT EXISTS restaurants_pkey PRIMARY KEY (id);

  ALTER TABLE restaurant_menu_items 
  ADD COLUMN IF NOT EXISTS id UUID UNIQUE DEFAULT gen_random_uuid(),
  ADD CONSTRAINT IF NOT EXISTS menu_items_id_check CHECK (id IS NOT NULL),
  ADD CONSTRAINT IF NOT EXISTS menu_items_pkey PRIMARY KEY (id);

  ALTER TABLE restaurant_tables 
  ADD COLUMN IF NOT EXISTS id UUID UNIQUE DEFAULT gen_random_uuid(),
  ADD CONSTRAINT IF NOT EXISTS tables_id_check CHECK (id IS NOT NULL),
  ADD CONSTRAINT IF NOT EXISTS tables_pkey PRIMARY KEY (id);
END $$;

-- Step 3: Backfill existing data with UUIDs
DO $$
  UPDATE restaurants 
  SET id = gen_random_uuid() 
  WHERE id IS NULL;

  UPDATE restaurant_menu_items 
  SET id = gen_random_uuid() 
  WHERE id IS NULL AND restaurant_id = (SELECT id FROM restaurants WHERE slug = 'maui');

  UPDATE restaurant_tables 
  SET id = gen_random_uuid() 
  WHERE id IS NULL AND restaurant_id = (SELECT id FROM restaurants WHERE slug = 'maui');
END $$;

-- Step 4: Make UUID columns non-nullable (after backfill)
DO $$
BEGIN
  ALTER TABLE restaurants ALTER COLUMN id SET NOT NULL;
  ALTER TABLE restaurant_menu_items ALTER COLUMN id SET NOT NULL;
  ALTER TABLE restaurant_tables ALTER COLUMN id SET NOT NULL;
END $$;

-- Step 5: Create indexes for UUID columns
CREATE INDEX IF NOT EXISTS idx_restaurants_id ON restaurants(id);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON restaurant_menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tables_restaurant_id ON restaurant_tables(restaurant_id);

-- Step 6: Clean up (optional migration)
DO $$
BEGIN
  -- Drop temporary check constraints
  ALTER TABLE restaurants DROP CONSTRAINT IF EXISTS restaurants_id_check;
  ALTER TABLE restaurant_menu_items DROP CONSTRAINT IF EXISTS menu_items_id_check;
  ALTER TABLE restaurant_tables DROP CONSTRAINT IF EXISTS tables_id_check;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database migration completed successfully! UUID columns added and existing data backfilled with proper UUIDs.';
END $$;
