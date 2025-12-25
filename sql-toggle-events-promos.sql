-- SQL Script to Toggle Events and Promos On/Off
-- Run these commands in Supabase SQL Editor to control visibility

-- === TOGGLE EVENTS ON/OFF ===

-- Show/Hide specific events by setting is_active
-- Set to true to SHOW, false to HIDE

-- Show all events (default)
UPDATE events SET is_active = true WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565';

-- Hide all events (show none)
UPDATE events SET is_active = false WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565';

-- Show only "Música en Vivo Viernes" (hide others)
UPDATE events SET is_active = false WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565';
UPDATE events SET is_active = true WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565' AND title->>'es' = 'Música en Vivo Viernes';

-- Show only "Menú Especial del Chef" (hide others)
UPDATE events SET is_active = false WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565';
UPDATE events SET is_active = true WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565' AND title->>'es' = 'Menú Especial del Chef';

-- Show first 2 events only
UPDATE events SET is_active = true WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565' AND id IN (
    SELECT id FROM events WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565' ORDER BY event_date LIMIT 2
);
UPDATE events SET is_active = false WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565' AND id NOT IN (
    SELECT id FROM events WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565' ORDER BY event_date LIMIT 2
);

-- === TOGGLE PROMOS ON/OFF ===

-- Show/Hide specific promos by setting is_active
-- Set to true to SHOW, false to HIDE

-- Show all promos (default)
UPDATE promos SET is_active = true WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565';

-- Hide all promos (show none)
UPDATE promos SET is_active = false WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565';

-- Show only "Welcome Special" (hide others)
UPDATE promos SET is_active = false WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565';
UPDATE promos SET is_active = true WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565' AND title->>'es' = 'Especial de Bienvenida';

-- Show only "Happy Hour" (hide others)
UPDATE promos SET is_active = false WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565';
UPDATE promos SET is_active = true WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565' AND title->>'es' = 'Hora Feliz';

-- Show first 2 promos only
UPDATE promos SET is_active = true WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565' AND id IN (
    SELECT id FROM promos WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565' ORDER BY created_at LIMIT 2
);
UPDATE promos SET is_active = false WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565' AND id NOT IN (
    SELECT id FROM promos WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565' ORDER BY created_at LIMIT 2
);

-- === CHECK CURRENT STATUS ===

-- See which events are currently active
SELECT title->>'es' as event_title, is_active FROM events WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565' ORDER BY event_date;

-- See which promos are currently active
SELECT title->>'es' as promo_title, is_active FROM promos WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565' ORDER BY created_at;

-- Count active items
SELECT
  'Active Events' as type,
  COUNT(*) as count
FROM events
WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565' AND is_active = true

UNION ALL

SELECT
  'Active Promos' as type,
  COUNT(*) as count
FROM promos
WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565' AND is_active = true;

-- === FOR OTHER RESTAURANTS ===
-- Replace the restaurant_id with the UUID of your other restaurants
-- Example for "Los Tacos" (replace with actual UUID):
-- UPDATE events SET is_active = true WHERE restaurant_id = 'LOS-TACOS-UUID-HERE';
-- UPDATE promos SET is_active = false WHERE restaurant_id = 'LOS-TACOS-UUID-HERE';
