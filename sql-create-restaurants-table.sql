-- Create restaurants table for basic restaurant information
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY,
  name JSONB NOT NULL DEFAULT '{"en": "", "es": ""}'::jsonb,
  address TEXT,
  hours JSONB NOT NULL DEFAULT '{"open": "9:00 AM", "close": "10:00 PM"}'::jsonb,
  wait_time INTEGER DEFAULT 30, -- in minutes
  distance INTEGER DEFAULT 100, -- in meters from user (demo only)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public read access" ON restaurants
  FOR SELECT USING (true);

-- Create policy for authenticated users to insert/update
CREATE POLICY "Authenticated users can manage restaurants" ON restaurants
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Add indexes for performance
CREATE INDEX idx_restaurants_created_at ON restaurants(created_at);
CREATE INDEX idx_restaurants_name ON restaurants USING GIN(name);

-- Insert a sample restaurant for testing
INSERT INTO restaurants (id, name, address, hours, wait_time, distance) VALUES
(
  'rest-one-maui'::uuid,
  '{"en": "Maui", "es": "Maui"}',
  'José María Morelos 1045, Barrio Antiguo, Monterrey, N.L.',
  '{"open": "5:00 PM", "close": "10:00 PM"}',
  10,
  120
) ON CONFLICT (id) DO NOTHING;
