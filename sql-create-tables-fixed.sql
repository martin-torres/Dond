-- Create restaurant_tables table for table management and floor plans
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id UUID PRIMARY KEY,
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

-- Sample tables for Maui restaurant
INSERT INTO restaurant_tables (restaurant_id, display_name, table_number, seats, location, available, x, y) VALUES
('rest-one-maui'::uuid, 'Table 21', 21, 2, 'patio', true, 8, 8),
('rest-one-maui'::uuid, 'Table 22', 22, 4, 'patio', true, 24, 8),
('rest-one-maui'::uuid, 'Table 23', 23, 4, 'patio', false, 12, 22),
('rest-one-maui'::uuid, 'Table 24', 24, 2, 'patio', true, 40, 8),
('rest-one-maui'::uuid, 'Table 25', 25, 2, 'patio', true, 30, 24),
('rest-one-maui'::uuid, 'Table 26', 26, 4, 'window', true, 50, 12),
('rest-one-maui'::uuid, 'Table 27', 27, 4, 'window', true, 68, 16),
('rest-one-maui'::uuid, 'Table 28', 28, 4, 'window', false, 82, 20),
('rest-one-maui'::uuid, 'Table 29', 29, 6, 'middle', true, 36, 32),
('rest-one-maui'::uuid, 'Table 30', 30, 6, 'middle', true, 58, 44),
('rest-one-maui'::uuid, 'Table 31', 31, 6, 'middle', true, 72, 48),
('rest-one-maui'::uuid, 'Table 32', 32, 2, 'balcony', true, 74, 6),
('rest-one-maui'::uuid, 'Table 33', 33, 2, 'balcony', false, 88, 10),
('rest-one-maui'::uuid, 'Table 34', 34, 4, 'secondFloor', true, 26, 52),
('rest-one-maui'::uuid, 'Table 35', 35, 4, 'secondFloor', true, 44, 58),
('rest-one-maui'::uuid, 'Table 36', 36, 6, 'secondFloor', false, 62, 60)
ON CONFLICT DO NOTHING;
