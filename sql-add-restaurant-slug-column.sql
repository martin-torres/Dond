-- Migration: Add restaurant_slug column to restaurant_tables
-- This adds a human-readable restaurant identifier alongside the UUID for easier filtering

-- Add the restaurant_slug column
ALTER TABLE restaurant_tables
ADD COLUMN restaurant_slug TEXT;

-- Populate existing data by joining with restaurants table
UPDATE restaurant_tables
SET restaurant_slug = r.slug
FROM restaurants r
WHERE restaurant_tables.restaurant_id = r.id;

-- Add index for fast filtering and queries
CREATE INDEX idx_tables_restaurant_slug ON restaurant_tables(restaurant_slug);

-- Add comment for documentation
COMMENT ON COLUMN restaurant_tables.restaurant_slug IS 'Human-readable restaurant identifier (e.g., rest-one-maui) for easy filtering alongside the UUID';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Added restaurant_slug column to restaurant_tables.';
  RAISE NOTICE 'You can now filter tables by both UUID (restaurant_id) and text slug (restaurant_slug).';
END $$;
