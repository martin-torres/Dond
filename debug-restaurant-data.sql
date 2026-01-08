-- Debug: Check if LasComidas data exists in database

-- Check restaurants table
SELECT 'RESTAURANTS' as table_name, COUNT(*) as count FROM restaurants;
SELECT id, slug, name, address FROM restaurants WHERE slug = 'Rest-one-lascomidas';

-- Check if menu items exist
SELECT 'MENU ITEMS' as table_name, COUNT(*) as count
FROM restaurant_menu_items
WHERE restaurant_id = (SELECT id FROM restaurants WHERE slug = 'Rest-one-lascomidas');

-- Check if promos exist
SELECT 'PROMOS' as table_name, COUNT(*) as count
FROM promos
WHERE restaurant_id = (SELECT id FROM restaurants WHERE slug = 'Rest-one-lascomidas');

-- Check if events exist
SELECT 'EVENTS' as table_name, COUNT(*) as count
FROM events
WHERE restaurant_id = (SELECT id FROM restaurants WHERE slug = 'Rest-one-lascomidas');

-- Check if tables exist
SELECT 'TABLES' as table_name, COUNT(*) as count
FROM restaurant_tables
WHERE restaurant_id = (SELECT id FROM restaurants WHERE slug = 'Rest-one-lascomidas');

-- Show sample data
SELECT 'Sample Restaurant' as type, id, slug, name, address
FROM restaurants
WHERE slug = 'Rest-one-lascomidas';

SELECT 'Sample Menu' as type, name->>'es' as name, kind, category
FROM restaurant_menu_items
WHERE restaurant_id = (SELECT id FROM restaurants WHERE slug = 'Rest-one-lascomidas')
ORDER BY kind, sort_order
LIMIT 3;

SELECT 'Sample Promos' as type, title->>'es' as title
FROM promos
WHERE restaurant_id = (SELECT id FROM restaurants WHERE slug = 'Rest-one-lascomidas')
LIMIT 2;

SELECT 'Sample Events' as type, title->>'es' as title
FROM events
WHERE restaurant_id = (SELECT id FROM restaurants WHERE slug = 'Rest-one-lascomidas')
LIMIT 2;
