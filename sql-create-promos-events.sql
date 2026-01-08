-- Create promos table for promotional offers
CREATE TABLE IF NOT EXISTS promos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  title JSONB NOT NULL DEFAULT '{"en": "", "es": ""}'::jsonb,
  description JSONB DEFAULT '{"en": "", "es": ""}'::jsonb,
  discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  image_url TEXT,
  menu_item_id UUID REFERENCES restaurant_menu_items(id),
  menu_category TEXT, -- 'food', 'drinks', or 'all'
  layout_type TEXT NOT NULL DEFAULT 'full_width' CHECK (layout_type IN ('full_width', 'two_column', 'three_column')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create events table for special events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  title JSONB NOT NULL DEFAULT '{"en": "", "es": ""}'::jsonb,
  description JSONB DEFAULT '{"en": "", "es": ""}'::jsonb,
  image_url TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access" ON promos
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access" ON events
  FOR SELECT USING (is_active = true);

-- Create policies for authenticated users to manage promos and events
CREATE POLICY "Authenticated users can manage promos" ON promos
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage events" ON events
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Add indexes for performance
CREATE INDEX idx_promos_restaurant_id ON promos(restaurant_id);
CREATE INDEX idx_promos_active ON promos(is_active);
CREATE INDEX idx_promos_menu_item_id ON promos(menu_item_id);
CREATE INDEX idx_promos_layout_type ON promos(layout_type);
CREATE INDEX idx_promos_dates ON promos(start_date, end_date);

CREATE INDEX idx_events_restaurant_id ON events(restaurant_id);
CREATE INDEX idx_events_active ON events(is_active);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_time ON events(start_time, end_time);

-- Add indexes for JSONB fields
CREATE INDEX idx_promos_title ON promos USING GIN(title);
CREATE INDEX idx_promos_description ON promos USING GIN(description);
CREATE INDEX idx_events_title ON events USING GIN(title);
CREATE INDEX idx_events_description ON events USING GIN(description);

-- Sample promos for Maui restaurant
WITH restaurant_data AS (
  SELECT id FROM restaurants WHERE slug = 'rest-one-maui'
)
INSERT INTO promos (restaurant_id, title, description, discount_percent, discount_amount, image_url, menu_category, layout_type, start_date, end_date)
SELECT
  rd.id,
  promo_data.title,
  promo_data.description,
  promo_data.discount_percent,
  promo_data.discount_amount,
  promo_data.image_url,
  promo_data.menu_category,
  promo_data.layout_type,
  promo_data.start_date,
  promo_data.end_date
FROM restaurant_data rd
CROSS JOIN (
  VALUES
    ('{"en": "Welcome Special", "es": "Especial de Bienvenida"}'::jsonb,
     '{"en": "Get 15% off your first order when you scan the QR code and join us for dinner.", "es": "Obtén 15% de descuento en tu primer pedido al escanear el código QR y acompañarnos a cenar."}'::jsonb,
     15.00, 0.00, 'https://image.pollinations.ai/prompt/Welcoming%20restaurant%20sign%20with%20QR%20code%20and%20discount%20offer', 'all', 'full_width', '2025-01-01'::date, '2025-12-31'::date),
     
    ('{"en": "Happy Hour", "es": "Hora Feliz"}'::jsonb,
     '{"en": "All drinks 20% off from 5 PM to 7 PM every weekday.", "es": "Todas las bebidas 20% de descuento de 5 PM a 7 PM entre semana."}'::jsonb,
     20.00, 0.00, 'https://image.pollinations.ai/prompt/Cocktail%20hour%20scene%20with%20discount%20signs', 'drinks', 'two_column', '2025-01-01'::date, '2025-12-31'::date),
     
    ('{"en": "Family Feast", "es": "Fiesta Familiar"}'::jsonb,
     '{"en": "Buy 2 main dishes, get 1 free appetizer. Perfect for family dinners!", "es": "Compra 2 platos fuertes, obtén 1 entrada gratis. ¡Perfecto para cenas familiares!"}'::jsonb,
     0.00, 0.00, 'https://image.pollinations.ai/prompt/Family%20dining%20scene%20with%20food%20specials', 'food', 'three_column', '2025-01-01'::date, '2025-12-31'::date)
) AS promo_data(title, description, discount_percent, discount_amount, image_url, menu_category, layout_type, start_date, end_date)
ON CONFLICT DO NOTHING;

-- Sample events for Maui restaurant
WITH restaurant_data AS (
  SELECT id FROM restaurants WHERE slug = 'rest-one-maui'
)
INSERT INTO events (restaurant_id, title, description, image_url, event_date, start_time, end_time)
SELECT
  rd.id,
  event_data.title,
  event_data.description,
  event_data.image_url,
  event_data.event_date,
  event_data.start_time,
  event_data.end_time
FROM restaurant_data rd
CROSS JOIN (
  VALUES
    ('{"en": "Live Music Night", "es": "Noche de Música en Vivo"}'::jsonb,
     '{"en": "Join us every Friday for live music featuring local artists. Reservations recommended.", "es": "Acompáñanos todos los viernes para música en vivo con artistas locales. Reservaciones recomendadas."}'::jsonb,
     'https://image.pollinations.ai/prompt/Live%20music%20performance%20in%20restaurant%20setting', '2025-01-03'::date, '20:00:00'::time, '23:00:00'::time),
     
    ('{"en": "Chef Special", "es": "Especial del Chef"}'::jsonb,
     '{"en": "Monthly chef tasting menu featuring seasonal ingredients and creative presentations.", "es": "Menú degustación mensual del chef con ingredientes de temporada y presentaciones creativas."}'::jsonb,
     'https://image.pollinations.ai/prompt/Gourmet%20chef%20tasting%20menu%20presentation', '2025-01-15'::date, '19:00:00'::time, '21:00:00'::time),
     
    ('{"en": "Wine Pairing Dinner", "es": "Cena de Maridaje de Vinos"}'::jsonb,
     '{"en": "An elegant evening featuring 5-course dinner paired with premium wines from around the world.", "es": "Una velada elegante con cena de 5 tiempos maridada con vinos premium de todo el mundo."}'::jsonb,
     'https://image.pollinations.ai/prompt/Elegant%20wine%20pairing%20dinner%20setting', '2025-01-25'::date, '19:30:00'::time, '22:30:00'::time)
) AS event_data(title, description, image_url, event_date, start_time, end_time)
ON CONFLICT DO NOTHING;
