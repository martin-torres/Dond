-- TEMPLATE: Restaurant Setup with Menu, Promos, Events, and Tables
-- Copy this file and modify the values below for each new restaurant

-- === CONFIGURATION SECTION - MODIFY THESE VALUES ===
-- Restaurant basic information
-- REPLACE THESE VALUES FOR EACH NEW RESTAURANT
SET @restaurant_id = 'REPLACE_WITH_NEW_UUID';  -- Generate new UUID for each restaurant
SET @restaurant_slug = 'REPLACE_WITH_SLUG';   -- e.g., 'Los-tacos', 'La-pizza', etc.
SET @restaurant_name_en = 'REPLACE_WITH_ENGLISH_NAME';
SET @restaurant_name_es = 'REPLACE_WITH_SPANISH_NAME';
SET @restaurant_address_en = 'REPLACE_WITH_ENGLISH_ADDRESS';
SET @restaurant_address_es = 'REPLACE_WITH_SPANISH_ADDRESS';
SET @restaurant_hours = '{"open": "9:00 AM", "close": "10:00 PM"}'; -- Usually same in both languages
SET @restaurant_wait_time = 30;  -- minutes
SET @restaurant_distance = 100; -- meters

-- Menu theme/category (modify menu items below accordingly)
-- SET @menu_theme = 'tacos';  -- Use this to guide menu creation: 'tacos', 'pizza', 'seafood', etc.

-- === END CONFIGURATION ===

-- Insert Restaurant
INSERT INTO restaurants (id, slug, name, address, hours, wait_time, distance)
VALUES (
  @restaurant_id,
  @restaurant_slug,
  JSON_OBJECT('en', @restaurant_name_en, 'es', @restaurant_name_es),
  JSON_OBJECT('en', @restaurant_address_en, 'es', @restaurant_address_es),
  @restaurant_hours,
  @restaurant_wait_time,
  @restaurant_distance
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  hours = EXCLUDED.hours,
  wait_time = EXCLUDED.wait_time,
  distance = EXCLUDED.distance;

-- === MENU ITEMS SECTION ===
-- Customize these for each restaurant's theme/cuisine
INSERT INTO restaurant_menu_items (
  restaurant_id,
  kind,
  category,
  station,
  station_label,
  name,
  description,
  price,
  image_url,
  is_active,
  sort_order
) VALUES
-- Food Items - MODIFY THESE FOR EACH RESTAURANT
(@restaurant_id, 'food', 'REPLACE_CATEGORY_1', 'kitchen', 'Kitchen',
  JSON_OBJECT('en', 'REPLACE_FOOD_NAME_EN_1', 'es', 'REPLACE_FOOD_NAME_ES_1'),
  JSON_OBJECT('en', 'REPLACE_FOOD_DESC_EN_1', 'es', 'REPLACE_FOOD_DESC_ES_1'),
  0.00, 'REPLACE_IMAGE_URL_1', true, 1),

(@restaurant_id, 'food', 'REPLACE_CATEGORY_2', 'kitchen', 'Kitchen',
  JSON_OBJECT('en', 'REPLACE_FOOD_NAME_EN_2', 'es', 'REPLACE_FOOD_NAME_ES_2'),
  JSON_OBJECT('en', 'REPLACE_FOOD_DESC_EN_2', 'es', 'REPLACE_FOOD_DESC_ES_2'),
  0.00, 'REPLACE_IMAGE_URL_2', true, 2),

-- Add more food items as needed...

-- Drink Items - MODIFY THESE FOR EACH RESTAURANT
(@restaurant_id, 'drink', 'REPLACE_DRINK_CATEGORY_1', 'bar', 'Bar',
  JSON_OBJECT('en', 'REPLACE_DRINK_NAME_EN_1', 'es', 'REPLACE_DRINK_NAME_ES_1'),
  JSON_OBJECT('en', 'REPLACE_DRINK_DESC_EN_1', 'es', 'REPLACE_DRINK_DESC_ES_1'),
  0.00, 'REPLACE_DRINK_IMAGE_URL_1', true, 101),

(@restaurant_id, 'drink', 'REPLACE_DRINK_CATEGORY_2', 'bar', 'Bar',
  JSON_OBJECT('en', 'REPLACE_DRINK_NAME_EN_2', 'es', 'REPLACE_DRINK_NAME_ES_2'),
  JSON_OBJECT('en', 'REPLACE_DRINK_DESC_EN_2', 'es', 'REPLACE_DRINK_DESC_ES_2'),
  0.00, 'REPLACE_DRINK_IMAGE_URL_2', true, 102),

-- Add more drink items as needed...

ON CONFLICT (id) DO UPDATE SET
  restaurant_id = EXCLUDED.restaurant_id,
  kind = EXCLUDED.kind,
  category = EXCLUDED.category,
  station = EXCLUDED.station,
  station_label = EXCLUDED.station_label,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

-- === PROMOS SECTION ===
-- Customize these for each restaurant
INSERT INTO promos (
  restaurant_id,
  title,
  description,
  discount_percent,
  discount_amount,
  image_url,
  menu_item_id,
  menu_category,
  layout_type,
  is_active,
  start_date,
  end_date
) VALUES
-- Welcome Special - Usually keep similar for all restaurants
(@restaurant_id,
  JSON_OBJECT('en', 'Welcome Special', 'es', 'Especial de Bienvenida'),
  JSON_OBJECT('en', 'Get 15% off your first order when you scan the QR code',
              'es', 'Obtén 15% de descuento en tu primera orden al escanear el código QR'),
  15.00, 0.00, 'https://images.unsplash.com/photo-1571115177042-924b24948b2a?auto=format&fit=crop&w=800&q=80',
  NULL, 'all', 'full_width', true, '2025-01-01', '2025-12-31'),

-- Restaurant-specific promo
(@restaurant_id,
  JSON_OBJECT('en', 'REPLACE_PROMO_TITLE_EN', 'es', 'REPLACE_PROMO_TITLE_ES'),
  JSON_OBJECT('en', 'REPLACE_PROMO_DESC_EN', 'es', 'REPLACE_PROMO_DESC_ES'),
  20.00, 0.00, 'REPLACE_PROMO_IMAGE_URL',
  NULL, 'food', 'two_column', true, '2025-01-01', '2025-12-31'),

-- Add more promos as needed...

ON CONFLICT DO NOTHING;

-- === EVENTS SECTION ===
-- Customize these for each restaurant
INSERT INTO events (
  restaurant_id,
  title,
  description,
  image_url,
  event_date,
  start_time,
  end_time,
  is_active
) VALUES
-- Live Music/Event - customize per restaurant
(@restaurant_id,
  JSON_OBJECT('en', 'REPLACE_EVENT_TITLE_EN', 'es', 'REPLACE_EVENT_TITLE_ES'),
  JSON_OBJECT('en', 'REPLACE_EVENT_DESC_EN', 'es', 'REPLACE_EVENT_DESC_ES'),
  'REPLACE_EVENT_IMAGE_URL',
  '2025-01-03', '20:00:00', '23:00:00', true),

-- Special Event - customize per restaurant
(@restaurant_id,
  JSON_OBJECT('en', 'REPLACE_SPECIAL_TITLE_EN', 'es', 'REPLACE_SPECIAL_TITLE_ES'),
  JSON_OBJECT('en', 'REPLACE_SPECIAL_DESC_EN', 'es', 'REPLACE_SPECIAL_DESC_ES'),
  'REPLACE_SPECIAL_IMAGE_URL',
  '2025-01-15', '19:00:00', '21:00:00', true),

-- Add more events as needed...

ON CONFLICT DO NOTHING;

-- === TABLES SECTION ===
-- Standard table layout - modify coordinates as needed
INSERT INTO restaurant_tables (
  restaurant_id,
  restaurant_slug,
  display_name,
  table_number,
  seats,
  location,
  section,
  available,
  visible_to_customers,
  x,
  y,
  shape,
  rotation,
  is_interactive
) VALUES
-- Indoor tables (4 tables)
(@restaurant_id, @restaurant_slug, 'Mesa 1', 1, 4, 'middle', 'Centro', true, true, 50, 50, 'auto', 0, true),
(@restaurant_id, @restaurant_slug, 'Mesa 2', 2, 6, 'window', 'Ventana', true, true, 200, 50, 'auto', 0, true),
(@restaurant_id, @restaurant_slug, 'Mesa 3', 3, 4, 'middle', 'Centro', true, true, 350, 50, 'auto', 0, true),
(@restaurant_id, @restaurant_slug, 'Mesa 4', 4, 2, 'middle', 'Centro', true, true, 500, 50, 'auto', 0, true),

-- Outdoor/Patio tables (3 tables)
(@restaurant_id, @restaurant_slug, 'Terraza 1', 5, 4, 'patio', 'Terraza', true, true, 100, 200, 'auto', 0, true),
(@restaurant_id, @restaurant_slug, 'Terraza 2', 6, 6, 'patio', 'Terraza', true, true, 300, 200, 'auto', 0, true),
(@restaurant_id, @restaurant_slug, 'Terraza 3', 7, 4, 'patio', 'Terraza', true, true, 500, 200, 'auto', 0, true)

ON CONFLICT (id) DO UPDATE SET
  restaurant_id = EXCLUDED.restaurant_id,
  restaurant_slug = EXCLUDED.restaurant_slug,
  display_name = EXCLUDED.display_name,
  table_number = EXCLUDED.table_number,
  seats = EXCLUDED.seats,
  location = EXCLUDED.location,
  section = EXCLUDED.section,
  available = EXCLUDED.available,
  visible_to_customers = EXCLUDED.visible_to_customers,
  x = EXCLUDED.x,
  y = EXCLUDED.y,
  shape = EXCLUDED.shape,
  rotation = EXCLUDED.rotation,
  is_interactive = EXCLUDED.is_interactive;

-- Insert Floor Plan
INSERT INTO restaurant_floor_plans (
  restaurant_id,
  canvas_w,
  canvas_h,
  grid_size
) VALUES (
  @restaurant_id,
  700,  -- width
  400,  -- height
  10    -- grid size
)
ON CONFLICT (restaurant_id) DO UPDATE SET
  canvas_w = EXCLUDED.canvas_w,
  canvas_h = EXCLUDED.canvas_h,
  grid_size = EXCLUDED.grid_size;

-- === INDEXES ===
-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_promos_restaurant_id_template ON promos(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_promos_active_template ON promos(is_active);
CREATE INDEX IF NOT EXISTS idx_events_restaurant_id_template ON events(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_events_active_template ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_tables_restaurant_id_template ON restaurant_tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tables_available_template ON restaurant_tables(available, visible_to_customers);

-- === VERIFICATION ===
-- Run these queries separately to verify data insertion:
-- SELECT 'Restaurant' as entity, COUNT(*) as count FROM restaurants WHERE id = @restaurant_id;
-- SELECT 'Menu Items' as entity, COUNT(*) as count FROM restaurant_menu_items WHERE restaurant_id = @restaurant_id;
-- SELECT 'Promos' as entity, COUNT(*) as count FROM promos WHERE restaurant_id = @restaurant_id AND is_active = true;
-- SELECT 'Events' as entity, COUNT(*) as count FROM events WHERE restaurant_id = @restaurant_id AND is_active = true;
-- SELECT 'Tables' as entity, COUNT(*) as count FROM restaurant_tables WHERE restaurant_id = @restaurant_id AND visible_to_customers = true;

-- === NEXT STEPS ===
-- 1. Generate new UUID for @restaurant_id
-- 2. Set restaurant slug and names
-- 3. Customize menu items for restaurant theme
-- 4. Update promo and event content
-- 5. Adjust table layout if needed
-- 6. Run the script in Supabase
-- 7. Test by accessing ?restaurantId=YOUR_SLUG
