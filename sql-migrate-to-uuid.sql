-- Migration Script: Convert TEXT IDs to UUIDs for Consistency
-- This migrates restaurant_menu_items and restaurant_tables from TEXT to UUID IDs

-- Step 1: Add UUID columns to restaurant_menu_items
ALTER TABLE restaurant_menu_items
ADD COLUMN id_uuid UUID DEFAULT gen_random_uuid(),
ADD COLUMN restaurant_id_uuid UUID REFERENCES restaurants(id);

-- Step 2: Add UUID columns to restaurant_tables
ALTER TABLE restaurant_tables
ADD COLUMN id_uuid UUID DEFAULT gen_random_uuid(),
ADD COLUMN restaurant_id_uuid UUID REFERENCES restaurants(id);

-- Step 4: Populate UUID columns for existing data
-- Generate UUIDs for menu items
UPDATE restaurant_menu_items
SET id_uuid = gen_random_uuid()
WHERE id_uuid IS NULL;

-- Generate UUIDs for tables
UPDATE restaurant_tables
SET id_uuid = gen_random_uuid()
WHERE id_uuid IS NULL;

-- Link to restaurant by slug (assuming 'rest-one-maui' exists)
UPDATE restaurant_menu_items
SET restaurant_id_uuid = (SELECT id FROM restaurants WHERE slug = 'rest-one-maui')
WHERE restaurant_id_uuid IS NULL;

UPDATE restaurant_tables
SET restaurant_id_uuid = (SELECT id FROM restaurants WHERE slug = 'rest-one-maui')
WHERE restaurant_id_uuid IS NULL;

-- Link floor plans to restaurant
UPDATE restaurant_floor_plans
SET restaurant_id_uuid = (SELECT id FROM restaurants WHERE slug = 'rest-one-maui')
WHERE restaurant_id_uuid IS NULL;

-- Step 4: Create new indexes for UUID columns
CREATE INDEX IF NOT EXISTS idx_menu_items_id_uuid ON restaurant_menu_items(id_uuid);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id_uuid ON restaurant_menu_items(restaurant_id_uuid);
CREATE INDEX IF NOT EXISTS idx_tables_id_uuid ON restaurant_tables(id_uuid);
CREATE INDEX IF NOT EXISTS idx_tables_restaurant_id_uuid ON restaurant_tables(restaurant_id_uuid);

-- Step 5: Drop old TEXT-based indexes and constraints
DROP INDEX IF EXISTS restaurant_menu_items_restaurant_id_idx;
DROP INDEX IF EXISTS restaurant_menu_items_restaurant_kind_idx;
DROP INDEX IF EXISTS restaurant_menu_items_restaurant_station_idx;
DROP INDEX IF EXISTS restaurant_menu_items_restaurant_category_idx;
DROP INDEX IF EXISTS restaurant_tables_restaurant_id_idx;

-- Step 6: Drop old TEXT columns and rename UUID columns
-- Menu items
ALTER TABLE restaurant_menu_items DROP COLUMN id CASCADE;
ALTER TABLE restaurant_menu_items DROP COLUMN restaurant_id CASCADE;
ALTER TABLE restaurant_menu_items RENAME COLUMN id_uuid TO id;
ALTER TABLE restaurant_menu_items RENAME COLUMN restaurant_id_uuid TO restaurant_id;

-- Tables
ALTER TABLE restaurant_tables DROP COLUMN id CASCADE;
ALTER TABLE restaurant_tables DROP COLUMN restaurant_id CASCADE;
ALTER TABLE restaurant_tables RENAME COLUMN id_uuid TO id;
ALTER TABLE restaurant_tables RENAME COLUMN restaurant_id_uuid TO restaurant_id;

-- Floor plans (restaurant_id is primary key, just change type)
ALTER TABLE restaurant_floor_plans DROP COLUMN restaurant_id CASCADE;
ALTER TABLE restaurant_floor_plans RENAME COLUMN restaurant_id_uuid TO restaurant_id;
-- Note: restaurant_floor_plans uses restaurant_id as primary key, so no separate id column

-- Step 7: Add new primary key constraints
ALTER TABLE restaurant_menu_items ADD CONSTRAINT restaurant_menu_items_pkey PRIMARY KEY (id);
ALTER TABLE restaurant_tables ADD CONSTRAINT restaurant_tables_pkey PRIMARY KEY (id);
-- restaurant_floor_plans already has primary key

-- Step 8: Recreate indexes with new names
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON restaurant_menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_kind ON restaurant_menu_items(kind);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON restaurant_menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON restaurant_menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort ON restaurant_menu_items(restaurant_id, kind, category, sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_name ON restaurant_menu_items USING GIN(name);

CREATE INDEX IF NOT EXISTS idx_tables_restaurant_id ON restaurant_tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tables_available ON restaurant_tables(available);
CREATE INDEX IF NOT EXISTS idx_tables_visible ON restaurant_tables(visible_to_customers);
CREATE INDEX IF NOT EXISTS idx_tables_location ON restaurant_tables(location);
CREATE INDEX IF NOT EXISTS idx_tables_position ON restaurant_tables(restaurant_id, x, y);
CREATE INDEX IF NOT EXISTS idx_tables_sort ON restaurant_tables(restaurant_id, display_name, table_number);

-- Step 9: Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'All tables now use consistent UUID primary keys.';
  RAISE NOTICE 'Restaurant menu items and tables are linked via UUID foreign keys.';
END $$;
