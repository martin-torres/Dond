-- SAMPLE: Los Tacos Restaurant Setup
-- Complete example showing how to use sql-template-restaurant-setup.sql
-- for a taco restaurant with authentic Monterrey late-night offerings

-- === CONFIGURATION SECTION ===
SET @restaurant_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';  -- Generate new UUID
SET @restaurant_slug = 'Los-tacos';
SET @restaurant_name_en = 'Los Tacos';
SET @restaurant_name_es = 'Los Tacos';
SET @restaurant_address_en = 'Calle Hidalgo 456, Centro, Monterrey';
SET @restaurant_address_es = 'Calle Hidalgo 456, Centro, Monterrey';
SET @restaurant_hours = '{"open": "6:00 PM", "close": "4:00 AM"}';  -- Late night
SET @restaurant_wait_time = 15;  -- minutes (faster for tacos)
SET @restaurant_distance = 50; -- meters (city center)

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
-- TACOS TRADICIONALES (Traditional Tacos)
(@restaurant_id, 'food', 'Tacos Tradicionales', 'kitchen', 'Kitchen',
  JSON_OBJECT('en', 'Carne Asada Taco', 'es', 'Taco de Carne Asada'),
  JSON_OBJECT('en', 'Grilled beef tenderloin with onions and cilantro', 'es', 'Arrachera de res a la parrilla con cebolla y cilantro'),
  45.00, 'https://images.unsplash.com/photo-1551782450-17144efb5723?auto=format&fit=crop&w=800&q=80', true, 1),

(@restaurant_id, 'food', 'Tacos Tradicionales', 'kitchen', 'Kitchen',
  JSON_OBJECT('en', 'Al Pastor Taco', 'es', 'Taco al Pastor'),
  JSON_OBJECT('en', 'Marinated pork with pineapple, onion and cilantro', 'es', 'Cerdo marinado con piña, cebolla y cilantro'),
  40.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80', true, 2),

(@restaurant_id, 'food', 'Tacos Tradicionales', 'kitchen', 'Kitchen',
  JSON_OBJECT('en', 'Chorizo Taco', 'es', 'Taco de Chorizo'),
  JSON_OBJECT('en', 'Mexican sausage with potatoes and cheese', 'es', 'Chorizo mexicano con papas y queso'),
  42.00, 'https://images.unsplash.com/photo-1607532941433-304405c4a27b?auto=format&fit=crop&w=800&q=80', true, 3),

(@restaurant_id, 'food', 'Tacos Tradicionales', 'kitchen', 'Kitchen',
  JSON_OBJECT('en', 'Suadero Taco', 'es', 'Taco de Suadero'),
  JSON_OBJECT('en', 'Slow-cooked beef brisket with crispy edges', 'es', 'Punta de res cocida lentamente con orillas crujientes'),
  48.00, 'https://images.unsplash.com/photo-1614094082869-7f63da5e5249?auto=format&fit=crop&w=800&q=80', true, 4),

-- TACOS CREATIVOS (Creative/Modern Tacos)
(@restaurant_id, 'food', 'Tacos Creativos', 'kitchen', 'Kitchen',
  JSON_OBJECT('en', 'Gringa Taco', 'es', 'Taco Gringa'),
  JSON_OBJECT('en', 'Carne asada with cheese, bacon and avocado', 'es', 'Carne asada con queso, tocino y aguacate'),
  55.00, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80', true, 5),

(@restaurant_id, 'food', 'Tacos Creativos', 'kitchen', 'Kitchen',
  JSON_OBJECT('en', 'Pirata Taco', 'es', 'Taco Pirata'),
  JSON_OBJECT('en', 'Carne asada with chorizo and cheese', 'es', 'Carne asada con chorizo y queso'),
  52.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80', true, 6),

(@restaurant_id, 'food', 'Tacos Creativos', 'kitchen', 'Kitchen',
  JSON_OBJECT('en', 'Papa Asada Taco', 'es', 'Taco de Papa Asada'),
  JSON_OBJECT('en', 'Grilled potato with chorizo and cheese', 'es', 'Papa a la parrilla con chorizo y queso'),
  38.00, 'https://images.unsplash.com/photo-1607532941433-304405c4a27b?auto=format&fit=crop&w=800&q=80', true, 7),

(@restaurant_id, 'food', 'Tacos Creativos', 'kitchen', 'Kitchen',
  JSON_OBJECT('en', 'Frijoles Taco', 'es', 'Taco de Frijoles'),
  JSON_OBJECT('en', 'Refried beans with cheese and pico de gallo', 'es', 'Frijoles refritos con queso y pico de gallo'),
  35.00, 'https://images.unsplash.com/photo-1626269974663-a1300f1e0f4b?auto=format&fit=crop&w=800&q=80', true, 8),

-- TACOS MATUTINOS (Morning Tacos - Late Night Option)
(@restaurant_id, 'food', 'Tacos Matutinos', 'kitchen', 'Kitchen',
  JSON_OBJECT('en', 'Guisados Taco', 'es', 'Taco de Guisados'),
  JSON_OBJECT('en', 'Seasoned beef stew with vegetables', 'es', 'Carne guisada sazonada con verduras'),
  42.00, 'https://images.unsplash.com/photo-1614094082869-7f63da5e5249?auto=format&fit=crop&w=800&q=80', true, 9),

(@restaurant_id, 'food', 'Tacos Matutinos', 'kitchen', 'Kitchen',
  JSON_OBJECT('en', 'Barbacoa Taco', 'es', 'Taco de Barbacoa'),
  JSON_OBJECT('en', 'Slow-cooked lamb with herbs and spices', 'es', 'Borrega cocida lentamente con hierbas y especies'),
  50.00, 'https://images.unsplash.com/photo-1563245372-f21e161e31a6?auto=format&fit=crop&w=800&q=80', true, 10),

(@restaurant_id, 'food', 'Tacos Matutinos', 'kitchen', 'Kitchen',
  JSON_OBJECT('en', 'Chicharrón en Salsa Verde', 'es', 'Chicharrón en Salsa Verde'),
  JSON_OBJECT('en', 'Crispy pork rinds in tangy green tomatillo salsa', 'es', 'Chicharrón crujiente en salsa verde de tomatillo ácida'),
  48.00, 'https://images.unsplash.com/photo-1626269994151-449421fe990c?auto=format&fit=crop&w=800&q=80', true, 11),

-- TACOS ESPECIALES (Specialty/Organ Meat Tacos)
(@restaurant_id, 'food', 'Tacos Especiales', 'kitchen', 'Kitchen',
  JSON_OBJECT('en', 'Lengua Taco', 'es', 'Taco de Lengua'),
  JSON_OBJECT('en', 'Beef tongue with onions and cilantro', 'es', 'Lengua de res con cebolla y cilantro'),
  55.00, 'https://images.unsplash.com/photo-1626082936010-6a70172ae615?auto=format&fit=crop&w=800&q=80', true, 12),

(@restaurant_id, 'food', 'Tacos Especiales', 'kitchen', 'Kitchen',
  JSON_OBJECT('en', 'Buche Taco', 'es', 'Taco de Buche'),
  JSON_OBJECT('en', 'Beef tripe with special seasoning', 'es', 'Pancita de res con sazón especial'),
  52.00, 'https://images.unsplash.com/photo-1607532941433-304405c4a27b?auto=format&fit=crop&w=800&q=80', true, 13),

-- Drink Items (BEbidas)
(@restaurant_id, 'drink', 'Cervezas', 'bar', 'Bar',
  JSON_OBJECT('en', 'Modelo Especial', 'es', 'Modelo Especial'),
  JSON_OBJECT('en', 'Mexican lager beer, crisp and refreshing', 'es', 'Cerveza tipo lager mexicana, crujiente y refrescante'),
  35.00, 'https://images.unsplash.com/photo-1551024709-90346f49a031?auto=format&fit=crop&w=800&q=80', true, 101),

(@restaurant_id, 'drink', 'Refrescos', 'bar', 'Bar',
  JSON_OBJECT('en', 'Coca-Cola', 'es', 'Coca-Cola'),
  JSON_OBJECT('en', 'Classic cola soft drink', 'es', 'Refresco de cola clásico'),
  25.00, 'https://images.unsplash.com/photo-1622597467836-942f207708c3?auto=format&fit=crop&w=800&q=80', true, 102),

(@restaurant_id, 'drink', 'Aguas Frescas', 'bar', 'Bar',
  JSON_OBJECT('en', 'Agua de Jamaica', 'es', 'Agua de Jamaica'),
  JSON_OBJECT('en', 'Hibiscus iced tea, tart and refreshing', 'es', 'Té frío de jamaica, ácido y refrescante'),
  20.00, 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80', true, 103),

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
-- Welcome Special
(@restaurant_id,
  JSON_OBJECT('en', 'Welcome to Los Tacos', 'es', 'Bienvenido a Los Tacos'),
  JSON_OBJECT('en', 'Get 15% off your first taco order after 10 PM', 'es', 'Obtén 15% de descuento en tu primera orden de tacos después de las 10 PM'),
  15.00, 0.00, 'https://images.unsplash.com/photo-1571115177042-924b24948b2a?auto=format&fit=crop&w=800&q=80',
  NULL, 'food', 'full_width', true, '2025-01-01', '2025-12-31'),

-- Late Night Special
(@restaurant_id,
  JSON_OBJECT('en', 'Late Night Special', 'es', 'Especial Nocturno'),
  JSON_OBJECT('en', 'Buy 3 tacos, get 1 free after midnight', 'es', 'Compra 3 tacos, obtén 1 gratis después de medianoche'),
  0.00, 0.00, 'https://images.unsplash.com/photo-1546549022-3b23b8b9a344?auto=format&fit=crop&w=800&q=80',
  NULL, 'food', 'two_column', true, '2025-01-01', '2025-12-31'),

-- Carne Asada Deal
(@restaurant_id,
  JSON_OBJECT('en', 'Carne Asada Night', 'es', 'Noche de Carne Asada'),
  JSON_OBJECT('en', 'All carne asada tacos 10% off on Wednesdays', 'es', 'Todos los tacos de carne asada 10% de descuento los miércoles'),
  10.00, 0.00, 'https://images.unsplash.com/photo-1551782450-17144efb5723?auto=format&fit=crop&w=800&q=80',
  NULL, 'food', 'three_column', true, '2025-01-01', '2025-12-31'),

ON CONFLICT DO NOTHING;

-- === EVENTS SECTION ===
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
-- Late Night Taco Special
(@restaurant_id,
  JSON_OBJECT('en', 'Late Night Taco Fest', 'es', 'Festival Nocturno de Tacos'),
  JSON_OBJECT('en', 'Special late-night taco menu with extended hours every Friday and Saturday', 'es', 'Menú especial de tacos nocturnos con horario extendido todos los viernes y sábado'),
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
  '2025-01-03',
  '22:00:00',
  '04:00:00',
  true
),

-- Taco Making Class
(@restaurant_id,
  JSON_OBJECT('en', 'Taco Making Class', 'es', 'Clase de Hacer Tacos'),
  JSON_OBJECT('en', 'Learn authentic taco preparation techniques every Sunday afternoon', 'es', 'Aprende técnicas auténticas de preparación de tacos todas las tardes de domingo'),
  'https://images.unsplash.com/photo-1546549022-3b23b8b9a344?auto=format&fit=crop&w=800&q=80',
  '2025-01-05',
  '16:00:00',
  '18:00:00',
  true
),

ON CONFLICT DO NOTHING;

-- === TABLES SECTION ===
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
-- Indoor counter seating (6 seats)
(@restaurant_id, @restaurant_slug, 'Counter 1', 1, 1, 'counter', 'Counter', true, true, 50, 50, 'auto', 0, true),
(@restaurant_id, @restaurant_slug, 'Counter 2', 2, 1, 'counter', 'Counter', true, true, 100, 50, 'auto', 0, true),
(@restaurant_id, @restaurant_slug, 'Counter 3', 3, 1, 'counter', 'Counter', true, true, 150, 50, 'auto', 0, true),
(@restaurant_id, @restaurant_slug, 'Counter 4', 4, 1, 'counter', 'Counter', true, true, 200, 50, 'auto', 0, true),
(@restaurant_id, @restaurant_slug, 'Counter 5', 5, 1, 'counter', 'Counter', true, true, 250, 50, 'auto', 0, true),
(@restaurant_id, @restaurant_slug, 'Counter 6', 6, 1, 'counter', 'Counter', true, true, 300, 50, 'auto', 0, true),

-- Outdoor seating (2 tables)
(@restaurant_id, @restaurant_slug, 'Terraza 1', 7, 4, 'patio', 'Terraza', true, true, 150, 150, 'auto', 0, true),
(@restaurant_id, @restaurant_slug, 'Terraza 2', 8, 4, 'patio', 'Terraza', true, true, 250, 150, 'auto', 0, true)

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
  500,  -- smaller for taco stand
  300,  -- smaller for taco stand
  10
)
ON CONFLICT (restaurant_id) DO UPDATE SET
  canvas_w = EXCLUDED.canvas_w,
  canvas_h = EXCLUDED.canvas_h,
  grid_size = EXCLUDED.grid_size;

-- === INDEXES ===
CREATE INDEX IF NOT EXISTS idx_promos_los_tacos_restaurant_id ON promos(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_promos_los_tacos_active ON promos(is_active);
CREATE INDEX IF NOT EXISTS idx_events_los_tacos_restaurant_id ON events(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_events_los_tacos_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_tables_los_tacos_restaurant_id ON restaurant_tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tables_los_tacos_available ON restaurant_tables(available, visible_to_customers);

-- === VERIFICATION ===
-- Check the Los Tacos setup
SELECT
  'Los Tacos Menu Items' as type,
  COUNT(*) as count
FROM restaurant_menu_items
WHERE restaurant_id = @restaurant_id

UNION ALL

SELECT
  'Los Tacos Promos' as type,
  COUNT(*) as count
FROM promos
WHERE restaurant_id = @restaurant_id

UNION ALL

SELECT
  'Los Tacos Events' as type,
  COUNT(*) as count
FROM events
WHERE restaurant_id = @restaurant_id

UNION ALL

SELECT
  'Los Tacos Tables' as type,
  COUNT(*) as count
FROM restaurant_tables
WHERE restaurant_id = @restaurant_id;

-- Show sample menu
SELECT 'Los Tacos Menu' as restaurant, name->>'es' as item, category, price::text || ' MXN' as price
FROM restaurant_menu_items
WHERE restaurant_id = @restaurant_id
ORDER BY kind, category, sort_order
LIMIT 8;

-- === HOW TO ACCESS ===
-- Access via: ?restaurantId=Los-tacos
-- This will show the complete Los Tacos experience with authentic Monterrey taco offerings!
