-- Create restaurant_tables table for table management and floor plans with UUID foreign keys
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  display_name TEXT,
  table_number INTEGER,
  seats INTEGER DEFAULT 4,
  location TEXT CHECK (location IN ('patio', 'window', 'balcony', 'middle', 'secondFloor')),
  section TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  visible_to_customers BOOLEAN NOT NULL DEFAULT true,
  x INTEGER DEFAULT 0, -- for floor plan positioning
  y INTEGER DEFAULT 0, -- for floor plan positioning
  shape TEXT, -- floorplan editor field
  rotation INTEGER DEFAULT 0, -- floorplan editor field
  is_interactive BOOLEAN DEFAULT true, -- floorplan editor field
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (only visible tables)
CREATE POLICY "Public read access to visible tables" ON restaurant_tables
  FOR SELECT USING (visible_to_customers = true);

-- Create policy for authenticated users to manage tables
CREATE POLICY "Authenticated users can manage tables" ON restaurant_tables
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Add indexes for performance
CREATE INDEX idx_tables_restaurant_id ON restaurant_tables(restaurant_id);
CREATE INDEX idx_tables_available ON restaurant_tables(available);
CREATE INDEX idx_tables_visible ON restaurant_tables(visible_to_customers);
CREATE INDEX idx_tables_location ON restaurant_tables(location);
CREATE INDEX idx_tables_position ON restaurant_tables(restaurant_id, x, y);
CREATE INDEX idx_tables_sort ON restaurant_tables(restaurant_id, display_name, table_number);

-- Sample tables for Maui restaurant (find restaurant by slug using CTE)
WITH restaurant_data AS (
  SELECT id FROM restaurants WHERE slug = 'rest-one-maui'
)
INSERT INTO restaurant_tables (restaurant_id, display_name, table_number, seats, location, available, x, y)
SELECT
  rd.id,
  table_data.display_name,
  table_data.table_number,
  table_data.seats,
  table_data.location,
  table_data.available,
  table_data.x,
  table_data.y
FROM restaurant_data rd
CROSS JOIN (
  VALUES
    ('Table 21'::text, 21, 2, 'patio'::location_type, true, 8, 8),
    ('Table 22', 22, 4, 'patio'::location_type, true, 24, 8),
    ('Table 23', 23, 4, 'patio'::location_type, false, 12, 22),
    ('Table 24', 24, 2, 'patio'::location_type, true, 40, 8),
    ('Table 25', 25, 2, 'patio'::location_type, true, 30, 24),
    ('Table 26', 26, 4, 'window'::location_type, true, 50, 12),
    ('Table 27', 27, 4, 'window'::location_type, true, 68, 16),
    ('Table 28', 28, 4, 'window'::location_type, false, 82, 20),
    ('Table 29', 29, 6, 'middle'::location_type, true, 36, 32),
    ('Table 30', 30, 6, 'middle'::location_type, true, 58, 44),
    ('Table 31', 31, 6, 'middle'::location_type, true, 72, 48),
    ('Table 32', 32, 2, 'balcony'::location_type, true, 74, 6),
    ('Table 33', 33, 2, 'balcony'::location_type, false, 88, 10),
    ('Table 34', 34, 4, 'secondFloor'::location_type, true, 26, 52),
    ('Table 35', 35, 4, 'secondFloor'::location_type, true, 44, 58),
    ('Table 36', 36, 6, 'secondFloor'::location_type, false, 62, 60)
) AS table_data(display_name, table_number, seats, location, available, x, y)
ON CONFLICT DO NOTHING;
