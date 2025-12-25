-- UPDATE Existing Los Tacos Restaurant with Authentic Monterrey Menu
-- Uses existing restaurant ID: f7b63f8a-b294-4fc3-baac-069adee54191
-- SUPABASE COMPATIBLE VERSION (no @ variables)

-- === CLEAN UP OLD DATA ===
-- Delete existing menu, promos, events, and tables for Los Tacos restaurant
DELETE FROM restaurant_menu_items WHERE restaurant_id = 'f7b63f8a-b294-4fc3-baac-069adee54191';
DELETE FROM promos WHERE restaurant_id = 'f7b63f8a-b294-4fc3-baac-069adee54191';
DELETE FROM events WHERE restaurant_id = 'f7b63f8a-b294-4fc3-baac-069adee54191';
DELETE FROM restaurant_tables WHERE restaurant_id = 'f7b63f8a-b294-4fc3-baac-069adee54191';
DELETE FROM restaurant_floor_plans WHERE restaurant_id = 'f7b63f8a-b294-4fc3-baac-069adee54191';

-- === UPDATE RESTAURANT INFO ===
-- Update restaurant with late-night taco stand details
UPDATE restaurants SET
  name = '{"en": "Los Tacos", "es": "Los Tacos"}',
  address = '{"en": "Diego De Montemayor 456, Centro, Monterrey", "es": "Diego De Montemayor 456, Centro, Monterrey"}',
  hours = '{"open": "6:00 PM", "close": "4:00 AM"}',
  wait_time = 15,
  distance = 50
WHERE id = 'f7b63f8a-b294-4fc3-baac-069adee54191';

-- === INSERT AUTHENTIC MONTERREY TACO MENU ===
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
('f7b63f8a-b294-4fc3-baac-069adee54191', 'food', 'Tacos Tradicionales', 'kitchen', 'Kitchen',
  '{"en": "Carne Asada Taco", "es": "Taco de Carne Asada"}',
  '{"en": "Grilled beef tenderloin with onions and cilantro", "es": "Arrachera de res a la parrilla con cebolla y cilantro"}',
  45.00, 'https://images.unsplash.com/photo-1551782450-17144efb5723?auto=format&fit=crop&w=800&q=80', true, 1),

('f7b63f8a-b294-4fc3-baac-069adee54191', 'food', 'Tacos Tradicionales', 'kitchen', 'Kitchen',
  '{"en": "Al Pastor Taco", "es": "Taco al Pastor"}',
  '{"en": "Marinated pork with pineapple, onion and cilantro", "es": "Cerdo marinado con piña, cebolla y cilantro"}',
  40.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80', true, 2),

('f7b63f8a-b294-4fc3-baac-069adee54191', 'food', 'Tacos Tradicionales', 'kitchen', 'Kitchen',
  '{"en": "Chorizo Taco", "es": "Taco de Chorizo"}',
  '{"en": "Mexican sausage with potatoes and cheese", "es": "Chorizo mexicano con papas y queso"}',
  42.00, 'https://images.unsplash.com/photo-1607532941433-304405c4a27b?auto=format&fit=crop&w=800&q=80', true, 3),

('f7b63f8a-b294-4fc3-baac-069adee54191', 'food', 'Tacos Tradicionales', 'kitchen', 'Kitchen',
  '{"en": "Suadero Taco", "es": "Taco de Suadero"}',
  '{"en": "Slow-cooked beef brisket with crispy edges", "es": "Punta de res cocida lentamente con orillas crujientes"}',
  48.00, 'https://images.unsplash.com/photo-1614094082869-7f63da5e5249?auto=format&fit=crop&w=800&q=80', true, 4),

-- TACOS CREATIVOS (Creative/Modern Tacos)
('f7b63f8a-b294-4fc3-baac-069adee54191', 'food', 'Tacos Creativos', 'kitchen', 'Kitchen',
  '{"en": "Gringa Taco", "es": "Taco Gringa"}',
  '{"en": "Carne asada with cheese, bacon and avocado", "es": "Carne asada con queso, tocino y aguacate"}',
  55.00, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80', true, 5),

('f7b63f8a-b294-4fc3-baac-069adee54191', 'food', 'Tacos Creativos', 'kitchen', 'Kitchen',
  '{"en": "Pirata Taco", "es": "Taco Pirata"}',
  '{"en": "Carne asada with chorizo and cheese", "es": "Carne asada con chorizo y queso"}',
  52.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80', true, 6),

('f7b63f8a-b294-4fc3-baac-069adee54191', 'food', 'Tacos Creativos', 'kitchen', 'Kitchen',
  '{"en": "Papa Asada Taco", "es": "Taco de Papa Asada"}',
  '{"en": "Grilled potato with chorizo and cheese", "es": "Papa a la parrilla con chorizo y queso"}',
  38.00, 'https://images.unsplash.com/photo-1607532941433-304405c4a27b?auto=format&fit=crop&w=800&q=80', true, 7),

('f7b63f8a-b294-4fc3-baac-069adee54191', 'food', 'Tacos Creativos', 'kitchen', 'Kitchen',
  '{"en": "Frijoles Taco", "es": "Taco de Frijoles"}',
  '{"en": "Refried beans with cheese and pico de gallo", "es": "Frijoles refritos con queso y pico de gallo"}',
  35.00, 'https://images.unsplash.com/photo-1626269974663-a1300f1e0f4b?auto=format&fit=crop&w=800&q=80', true, 8),

-- TACOS MATUTINOS (Morning Tacos - Late Night Option)
('f7b63f8a-b294-4fc3-baac-069adee54191', 'food', 'Tacos Matutinos', 'kitchen', 'Kitchen',
  '{"en": "Guisados Taco", "es": "Taco de Guisados"}',
  '{"en": "Seasoned beef stew with vegetables", "es": "Carne guisada sazonada con verduras"}',
  42.00, 'https://images.unsplash.com/photo-1614094082869-7f63da5e5249?auto=format&fit=crop&w=800&q=80', true, 9),

('f7b63f8a-b294-4fc3-baac-069adee54191', 'food', 'Tacos Matutinos', 'kitchen', 'Kitchen',
  '{"en": "Barbacoa Taco", "es": "Taco de Barbacoa"}',
  '{"en": "Slow-cooked lamb with herbs and spices", "es": "Borrega cocida lentamente con hierbas y especies"}',
  50.00, 'https://images.unsplash.com/photo-1563245372-f21e161e31a6?auto=format&fit=crop&w=800&q=80', true, 10),

('f7b63f8a-b294-4fc3-baac-069adee54191', 'food', 'Tacos Matutinos', 'kitchen', 'Kitchen',
  '{"en": "Chicharrón en Salsa Verde", "es": "Chicharrón en Salsa Verde"}',
  '{"en": "Crispy pork rinds in tangy green tomatillo salsa", "es": "Chicharrón crujiente en salsa verde de tomatillo ácida"}',
  48.00, 'https://images.unsplash.com/photo-1626269994151-449421fe990c?auto=format&fit=crop&w=800&q=80', true, 11),

-- TACOS ESPECIALES (Specialty/Organ Meat Tacos)
('f7b63f8a-b294-4fc3-baac-069adee54191', 'food', 'Tacos Especiales', 'kitchen', 'Kitchen',
  '{"en": "Lengua Taco", "es": "Taco de Lengua"}',
  '{"en": "Beef tongue with onions and cilantro", "es": "Lengua de res con cebolla y cilantro"}',
  55.00, 'https://images.unsplash.com/photo-1626082936010-6a70172ae615?auto=format&fit=crop&w=800&q=80', true, 12),

('f7b63f8a-b294-4fc3-baac-069adee54191', 'food', 'Tacos Especiales', 'kitchen', 'Kitchen',
  '{"en": "Buche Taco", "es": "Taco de Buche"}',
  '{"en": "Beef tripe with special seasoning", "es": "Pancita de res con sazón especial"}',
  52.00, 'https://images.unsplash.com/photo-1607532941433-304405c4a27b?auto=format&fit=crop&w=800&q=80', true, 13),

-- Drink Items
('f7b63f8a-b294-4fc3-baac-069adee54191', 'drink', 'Cervezas', 'bar', 'Bar',
  '{"en": "Modelo Especial", "es": "Modelo Especial"}',
  '{"en": "Mexican lager beer, crisp and refreshing", "es": "Cerveza tipo lager mexicana, crujiente y refrescante"}',
  35.00, 'https://images.unsplash.com/photo-1551024709-90346f49a031?auto=format&fit=crop&w=800&q=80', true, 101),

('f7b63f8a-b294-4fc3-baac-069adee54191', 'drink', 'Refrescos', 'bar', 'Bar',
  '{"en": "Coca-Cola", "es": "Coca-Cola"}',
  '{"en": "Classic cola soft drink", "es": "Refresco de cola clásico"}',
  25.00, 'https://images.unsplash.com/photo-1622597467836-942f207708c3?auto=format&fit=crop&w=800&q=80', true, 102),

('f7b63f8a-b294-4fc3-baac-069adee54191', 'drink', 'Aguas Frescas', 'bar', 'Bar',
  '{"en": "Agua de Jamaica", "es": "Agua de Jamaica"}',
  '{"en": "Hibiscus iced tea, tart and refreshing", "es": "Té frío de jamaica, ácido y refrescante"}',
  20.00, 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80', true, 103);

-- === INSERT UPDATED PROMOS ===
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
('f7b63f8a-b294-4fc3-baac-069adee54191',
  '{"en": "Welcome to Los Tacos", "es": "Bienvenido a Los Tacos"}',
  '{"en": "Get 15% off your first taco order after 10 PM", "es": "Obtén 15% de descuento en tu primera orden de tacos después de las 10 PM"}',
  15.00, 0.00, 'https://images.unsplash.com/photo-1571115177042-924b24948b2a?auto=format&fit=crop&w=800&q=80',
  NULL, 'food', 'full_width', true, '2025-01-01', '2025-12-31'),

-- Late Night Special
('f7b63f8a-b294-4fc3-baac-069adee54191',
  '{"en": "Late Night Special", "es": "Especial Nocturno"}',
  '{"en": "Buy 3 tacos, get 1 free after midnight", "es": "Compra 3 tacos, obtén 1 gratis después de medianoche"}',
  0.00, 0.00, 'https://images.unsplash.com/photo-1546549022-3b23b8b9a344?auto=format&fit=crop&w=800&q=80',
  NULL, 'food', 'two_column', true, '2025-01-01', '2025-12-31'),

-- Carne Asada Deal
('f7b63f8a-b294-4fc3-baac-069adee54191',
  '{"en": "Carne Asada Night", "es": "Noche de Carne Asada"}',
  '{"en": "All carne asada tacos 10% off on Wednesdays", "es": "Todos los tacos de carne asada 10% de descuento los miércoles"}',
  10.00, 0.00, 'https://images.unsplash.com/photo-1551782450-17144efb5723?auto=format&fit=crop&w=800&q=80',
  NULL, 'food', 'three_column', true, '2025-01-01', '2025-12-31');

-- === INSERT UPDATED EVENTS ===
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
('f7b63f8a-b294-4fc3-baac-069adee54191',
  '{"en": "Late Night Taco Fest", "es": "Festival Nocturno de Tacos"}',
  '{"en": "Special late-night taco menu with extended hours every Friday and Saturday", "es": "Menú especial de tacos nocturnos con horario extendido todos los viernes y sábado"}',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
  '2025-01-03',
  '22:00:00',
  '04:00:00',
  true
),

-- Taco Making Class
('f7b63f8a-b294-4fc3-baac-069adee54191',
  '{"en": "Taco Making Class", "es": "Clase de Hacer Tacos"}',
  '{"en": "Learn authentic taco preparation techniques every Sunday afternoon", "es": "Aprende técnicas auténticas de preparación de tacos todas las tardes de domingo"}',
  'https://images.unsplash.com/photo-1546549022-3b23b8b9a344?auto=format&fit=crop&w=800&q=80',
  '2025-01-05',
  '16:00:00',
  '18:00:00',
  true
);

-- === INSERT COUNTER TABLES FOR TACO STAND ===
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
('f7b63f8a-b294-4fc3-baac-069adee54191', 'Rest-one-lostacos', 'Counter 1', 1, 1, 'counter', 'Counter', true, true, 50, 50, 'auto', 0, true),
('f7b63f8a-b294-4fc3-baac-069adee54191', 'Rest-one-lostacos', 'Counter 2', 2, 1, 'counter', 'Counter', true, true, 100, 50, 'auto', 0, true),
('f7b63f8a-b294-4fc3-baac-069adee54191', 'Rest-one-lostacos', 'Counter 3', 3, 1, 'counter', 'Counter', true, true, 150, 50, 'auto', 0, true),
('f7b63f8a-b294-4fc3-baac-069adee54191', 'Rest-one-lostacos', 'Counter 4', 4, 1, 'counter', 'Counter', true, true, 200, 50, 'auto', 0, true),
('f7b63f8a-b294-4fc3-baac-069adee54191', 'Rest-one-lostacos', 'Counter 5', 5, 1, 'counter', 'Counter', true, true, 250, 50, 'auto', 0, true),
('f7b63f8a-b294-4fc3-baac-069adee54191', 'Rest-one-lostacos', 'Counter 6', 6, 1, 'counter', 'Counter', true, true, 300, 50, 'auto', 0, true),

-- Outdoor seating (2 tables)
('f7b63f8a-b294-4fc3-baac-069adee54191', 'Rest-one-lostacos', 'Terraza 1', 7, 4, 'patio', 'Terraza', true, true, 150, 150, 'auto', 0, true),
('f7b63f8a-b294-4fc3-baac-069adee54191', 'Rest-one-lostacos', 'Terraza 2', 8, 4, 'patio', 'Terraza', true, true, 250, 150, 'auto', 0, true);

-- Insert Floor Plan
INSERT INTO restaurant_floor_plans (
  restaurant_id,
  canvas_w,
  canvas_h,
  grid_size
) VALUES (
  'f7b63f8a-b294-4fc3-baac-069adee54191',
  500,  -- smaller for taco stand
  300,  -- smaller for taco stand
  10
);

-- === VERIFICATION ===
-- Check the updated Los Tacos setup
SELECT
  'Los Tacos Menu Items' as type,
  COUNT(*) as count
FROM restaurant_menu_items
WHERE restaurant_id = 'f7b63f8a-b294-4fc3-baac-069adee54191'

UNION ALL

SELECT
  'Los Tacos Promos' as type,
  COUNT(*) as count
FROM promos
WHERE restaurant_id = 'f7b63f8a-b294-4fc3-baac-069adee54191'

UNION ALL

SELECT
  'Los Tacos Events' as type,
  COUNT(*) as count
FROM events
WHERE restaurant_id = 'f7b63f8a-b294-4fc3-baac-069adee54191'

UNION ALL

SELECT
  'Los Tacos Tables' as type,
  COUNT(*) as count
FROM restaurant_tables
WHERE restaurant_id = 'f7b63f8a-b294-4fc3-baac-069adee54191';

-- Show updated restaurant info
SELECT 'Updated Restaurant' as type, id, slug, name, address, hours
FROM restaurants
WHERE id = 'f7b63f8a-b294-4fc3-baac-069adee54191';

-- Show sample of new menu
SELECT 'New Los Tacos Menu' as restaurant, name->>'es' as item, category, price::text || ' MXN' as price
FROM restaurant_menu_items
WHERE restaurant_id = 'f7b63f8a-b294-4fc3-baac-069adee54191'
ORDER BY kind, category, sort_order
LIMIT 8;
