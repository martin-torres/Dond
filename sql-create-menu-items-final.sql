-- Create restaurant_menu_items table for menu management
CREATE TABLE IF NOT EXISTS restaurant_menu_items (
  id UUID PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('food', 'drink')),
  category TEXT,
  station TEXT NOT NULL DEFAULT 'kitchen' CHECK (station IN ('foh', 'bar', 'kitchen')),
  station_label TEXT,
  name JSONB NOT NULL DEFAULT '{"en": "", "es": ""}'::jsonb,
  description JSONB DEFAULT '{"en": "", "es": ""}'::jsonb,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE restaurant_menu_items ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public read access" ON restaurant_menu_items
  FOR SELECT USING (is_active = true);

-- Create policy for authenticated users to manage menu items
CREATE POLICY "Authenticated users can manage menu items" ON restaurant_menu_items
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Add indexes for performance
CREATE INDEX idx_menu_items_restaurant_id ON restaurant_menu_items(restaurant_id);
CREATE INDEX idx_menu_items_kind ON restaurant_menu_items(kind);
CREATE INDEX idx_menu_items_category ON restaurant_menu_items(category);
CREATE INDEX idx_menu_items_active ON restaurant_menu_items(is_active);
CREATE INDEX idx_menu_items_sort ON restaurant_menu_items(restaurant_id, kind, category, sort_order);
CREATE INDEX idx_menu_items_name ON restaurant_menu_items USING GIN(name);

-- Sample menu items for Maui restaurant
INSERT INTO restaurant_menu_items (restaurant_id, kind, category, station, name, description, price, image_url, sort_order) VALUES
-- Drinks
('rest-one-maui'::uuid, 'drink', 'Signature Slush', 'bar', 
'{"en": "Nalu Wailele", "es": "Nalu Wailele"}', 
'{"en": "Sprite Zero slush with blue Hawaii coconut-vanilla foam.", "es": "Granizado de Sprite Zero con espuma blue Hawaii de coco y vainilla."}', 
80.00, 
'https://image.pollinations.ai/prompt/Icy%20blue%20mocktail%20served%20in%20a%20chilled%20highball,%20tropical%20lighting',
1),

('rest-one-maui'::uuid, 'drink', 'Signature Slush', 'bar', 
'{"en": "Nalu Hawaiian Rusa", "es": "Nalu Hawaiian Rusa"}', 
'{"en": "Squirt Zero slush splashed with orange, pineapple, and chamoy.", "es": "Granizado de Squirt Zero con toques de naranja, piña y chamoy."}', 
80.00, 
'https://image.pollinations.ai/prompt/Refreshing%20pink%20slushie%20mocktail%20with%20tamarind%20rim,%20studio%20food%20photo',
2),

('rest-one-maui'::uuid, 'drink', 'Signature Slush', 'bar', 
'{"en": "Nalu Coco Cola", "es": "Nalu Coco Cola"}', 
'{"en": "Coca Light blended on ice with coconut cream.", "es": "Coca Light congelada con un toque de crema de coco."}', 
80.00, 
'https://image.pollinations.ai/prompt/Frosty%20cola%20slush%20with%20coconut%20foam,%20moody%20bar%20lighting',
3),

('rest-one-maui'::uuid, 'drink', 'Refrescos', 'bar', 
'{"en": "Refresco Manzanita Sol", "es": "Refresco Manzanita Sol"}', 
'{"en": "Classic chilled Manzanita Sol to pair with your hot dog.", "es": "Refresco Manzanita Sol bien frío para acompañar tu hot dog."}', 
20.00, 
'https://image.pollinations.ai/prompt/Studio%20shot%20of%20a%20glass%20bottle%20of%20apple%20soda%20with%20condensation',
4),

-- Food
('rest-one-maui'::uuid, 'food', 'Antojitos', 'kitchen', 
'{"en": "Empanadas", "es": "Empanadas"}', 
'{"en": "Four assorted empanadas—pollo, deshebrada, and queso—served with garlicky salsa.", "es": "4 empanadas con guisos surtidos de pollo, deshebrada y queso, acompañadas de salsa de ajo."}', 
230.00, 
'https://image.pollinations.ai/prompt/Golden%20Latin%20empanadas%20with%20garlic%20sauce%20on%20a%20wooden%20board',
10),

('rest-one-maui'::uuid, 'food', 'Antojitos', 'kitchen', 
'{"en": "Arepas", "es": "Arepas"}', 
'{"en": "Four freshly griddled crunchy corn arepas filled with shredded beef, chicken, and melty cheese.", "es": "4 arepas de maíz crujiente hechas al momento con guiso de deshebrada, pollo y queso."}', 
230.00, 
'https://image.pollinations.ai/prompt/Crunchy%20Venezuelan%20arepas%20stuffed%20with%20shredded%20meats%20and%20cheese',
11),

('rest-one-maui'::uuid, 'food', 'Para compartir', 'kitchen', 
'{"en": "Nachos Patacón", "es": "Nachos Patacón"}', 
'{"en": "Crispy patacón base loaded with molten queso, beef, pico de gallo, and crema ácida.", "es": "Crujientes patacones como base, cubiertos de queso fundido, carne, pico de gallo y crema ácida."}', 
250.00, 
'https://image.pollinations.ai/prompt/Loaded%20patacon%20nachos%20with%20melted%20cheese%20and%20pico%20de%20gallo',
12),

('rest-one-maui'::uuid, 'food', 'Tacos', 'kitchen', 
'{"en": "Tacos Gobernador", "es": "Tacos Gobernador"}', 
'{"en": "Sautéed shrimp with peppers tucked into tortillas with a manchego cheese crust.", "es": "Camarones frescos salteados con pimientos dentro de tortillas con costra de queso manchego."}', 
195.00, 
'https://image.pollinations.ai/prompt/Gourmet%20shrimp%20gobernador%20tacos%20with%20manchego%20cheese%20crust',
13)
ON CONFLICT DO NOTHING;
