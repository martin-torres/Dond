-- SQL Script to Clean Up Duplicates and Fix LasComidas Data
-- Run this in Supabase SQL Editor

-- === STEP 1: CHECK CURRENT DATA ===
-- Check for duplicates
SELECT 'Menu Items' as type, COUNT(*) as total, COUNT(DISTINCT name->>'es') as unique_names
FROM restaurant_menu_items
WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565';

SELECT 'Promos' as type, COUNT(*) as total, COUNT(DISTINCT title->>'es') as unique_titles
FROM promos
WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565';

SELECT 'Events' as type, COUNT(*) as total
FROM events
WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565';

-- === STEP 2: CLEAN UP DUPLICATE MENU ITEMS ===
-- Keep only the first occurrence of each menu item by name
DELETE FROM restaurant_menu_items
WHERE id NOT IN (
    SELECT DISTINCT ON (name->>'es') id
    FROM restaurant_menu_items
    WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565'
    ORDER BY name->>'es', created_at ASC
);

-- === STEP 3: CLEAN UP DUPLICATE PROMOS ===
-- Keep only the first occurrence of each promo by title
DELETE FROM promos
WHERE id NOT IN (
    SELECT DISTINCT ON (title->>'es') id
    FROM promos
    WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565'
    ORDER BY title->>'es', created_at ASC
);

-- === STEP 4: ENSURE EVENTS EXIST ===
-- Insert events if they don't exist
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
-- Live Music Event
('115e05ba-f4ea-4013-837d-70b88acbf565',
  '{"en": "Live Music Friday", "es": "Música en Vivo Viernes"}',
  '{"en": "Join us every Friday for live norteño music featuring local artists. Reservations recommended.", "es": "Acompáñanos todos los viernes para música norteña en vivo con artistas locales. Reservaciones recomendadas."}',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
  '2025-01-03',
  '20:00:00',
  '23:00:00',
  true
),
-- Chef Special Event
('115e05ba-f4ea-4013-837d-70b88acbf565',
  '{"en": "Chef Special Menu", "es": "Menú Especial del Chef"}',
  '{"en": "Monthly chef tasting menu featuring traditional Monterrey dishes with modern presentation", "es": "Menú degustación mensual del chef con platillos tradicionales de Monterrey con presentación moderna"}',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
  '2025-01-15',
  '19:00:00',
  '21:00:00',
  true
),
-- Family Night Event
('115e05ba-f4ea-4013-837d-70b88acbf565',
  '{"en": "Family Night", "es": "Noche de Familia"}',
  '{"en": "Every Wednesday is family night! Special kids menu and 10% off for families of 4 or more", "es": "¡Todos los miércoles es noche de familia! Menú especial para niños y 10% de descuento para familias de 4 o más"}',
  'https://images.unsplash.com/photo-1546549022-3b23b8b9a344?auto=format&fit=crop&w=800&q=80',
  '2025-01-01',
  '18:00:00',
  '22:00:00',
  true
),
-- Traditional Monterrey Event
('115e05ba-f4ea-4013-837d-70b88acbf565',
  '{"en": "Monterrey Traditions", "es": "Tradiciones de Monterrey"}',
  '{"en": "Experience authentic Monterrey cuisine every Sunday with our traditional menu specials", "es": "Disfruta de la auténtica cocina de Monterrey todos los domingos con nuestros platillos tradicionales"}',
  'https://images.unsplash.com/photo-1614094082869-7f63da5e5249?auto=format&fit=crop&w=800&q=80',
  '2025-01-05',
  '12:00:00',
  '16:00:00',
  true
)
ON CONFLICT DO NOTHING;

-- === STEP 5: UPDATE MENU ITEM IMAGES ===
-- Update images for menu items (replace with your preferred images)
UPDATE restaurant_menu_items
SET image_url = CASE
  -- Food Items
  WHEN name->>'es' = 'Machacado con Huevo' THEN 'https://images.unsplash.com/photo-1614094082869-7f63da5e5249?auto=format&fit=crop&w=800&q=80'
  WHEN name->>'es' = 'Albóndigas en Salsa' THEN 'https://images.unsplash.com/photo-1563245372-f21e161e31a6?auto=format&fit=crop&w=800&q=80'
  WHEN name->>'es' = 'Asado de Puerco' THEN 'https://images.unsplash.com/photo-1607532941433-304405c4a27b?auto=format&fit=crop&w=800&q=80'
  WHEN name->>'es' = 'Milanesa de Res' THEN 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80'
  WHEN name->>'es' = 'Milanesa de Pollo Rellena' THEN 'https://images.unsplash.com/photo-1626078272561-a35204063373?auto=format&fit=crop&w=800&q=80'
  WHEN name->>'es' = 'Cortadillo' THEN 'https://images.unsplash.com/photo-1626082936010-6a70172ae615?auto=format&fit=crop&w=800&q=80'
  WHEN name->>'es' = 'Caldo de Res' THEN 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80'
  WHEN name->>'es' = 'Chicharrón en Salsa Verde' THEN 'https://images.unsplash.com/photo-1626269994151-449421fe990c?auto=format&fit=crop&w=800&q=80'
  WHEN name->>'es' = 'Flan Napolitano' THEN 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80'
  WHEN name->>'es' = 'Arroz con Leche' THEN 'https://images.unsplash.com/photo-1626269974663-a1300f1e0f4b?auto=format&fit=crop&w=800&q=80'

  -- Drink Items
  WHEN name->>'es' = 'Coca-Cola' THEN 'https://images.unsplash.com/photo-1622597467836-942f207708c3?auto=format&fit=crop&w=800&q=80'
  WHEN name->>'es' = 'Sprite' THEN 'https://images.unsplash.com/photo-1622597467836-942f207708c3?auto=format&fit=crop&w=800&q=80'
  WHEN name->>'es' = 'Fanta' THEN 'https://images.unsplash.com/photo-1622597467836-942f207708c3?auto=format&fit=crop&w=800&q=80'
  WHEN name->>'es' = 'Squirt' THEN 'https://images.unsplash.com/photo-1622597467836-942f207708c3?auto=format&fit=crop&w=800&q=80'
  WHEN name->>'es' = 'Horchata' THEN 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80'
  WHEN name->>'es' = 'Agua de Jamaica' THEN 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80'
  WHEN name->>'es' = 'Agua de Tamarindo' THEN 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80'
  WHEN name->>'es' = 'Modelo Especial' THEN 'https://images.unsplash.com/photo-1551024709-90346f49a031?auto=format&fit=crop&w=800&q=80'
  WHEN name->>'es' = 'Corona' THEN 'https://images.unsplash.com/photo-1551024709-90346f49a031?auto=format&fit=crop&w=800&q=80'
  WHEN name->>'es' = 'Pacífico' THEN 'https://images.unsplash.com/photo-1551024709-90346f49a031?auto=format&fit=crop&w=800&q=80'

  ELSE image_url -- Keep existing if not matched
END
WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565';

-- === STEP 6: VERIFICATION ===
-- Check final counts after cleanup
SELECT
  'Menu Items' as type,
  COUNT(*) as count
FROM restaurant_menu_items
WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565'

UNION ALL

SELECT
  'Promos' as type,
  COUNT(*) as count
FROM promos
WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565'

UNION ALL

SELECT
  'Events' as type,
  COUNT(*) as count
FROM events
WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565'

UNION ALL

SELECT
  'Tables' as type,
  COUNT(*) as count
FROM restaurant_tables
WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565';

-- Show sample of cleaned data
SELECT 'Menu Items' as type, name->>'es' as name, image_url
FROM restaurant_menu_items
WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565'
ORDER BY kind, sort_order
LIMIT 5;

SELECT 'Events' as type, title->>'es' as title, event_date, start_time, end_time
FROM events
WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565'
ORDER BY event_date;
