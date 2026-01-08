-- Migration to add 'request' support to menu_items kind field
-- This allows FOH items like water, salt, chips, salsa, utensils, refills, etc.

-- First, drop the existing check constraint
ALTER TABLE restaurant_menu_items
DROP CONSTRAINT IF EXISTS restaurant_menu_items_kind_check;

-- Add the new check constraint that includes 'request'
ALTER TABLE restaurant_menu_items
ADD CONSTRAINT restaurant_menu_items_kind_check
CHECK (kind IN ('food', 'drink', 'request'));

-- Add some sample FOH request items
WITH restaurant_data AS (
  SELECT id FROM restaurants WHERE slug = 'rest-one-maui'
)
INSERT INTO restaurant_menu_items (restaurant_id, kind, category, station, name, description, price, image_url, sort_order)
SELECT
  rd.id,
  menu_data.kind,
  menu_data.category,
  menu_data.station,
  menu_data.name,
  menu_data.description,
  menu_data.price,
  menu_data.image_url,
  menu_data.sort_order
FROM restaurant_data rd
CROSS JOIN (
  VALUES
    -- FOH Request Items (typically no charge or minimal charge)
    ('request'::text, 'Beverages'::text, 'foh'::station_type,
     '{"en": "Water", "es": "Agua"}'::jsonb,
     '{"en": "Complimentary water refill", "es": "Recarga de agua gratuita"}'::jsonb,
     0.00, 'https://image.pollinations.ai/prompt/Glass%20of%20fresh%20water%20with%20ice%20and%20lemon', 100),

    ('request', 'Condiments', 'foh'::station_type,
     '{"en": "Salt", "es": "Sal"}'::jsonb,
     '{"en": "Table salt shaker refill", "es": "Recarga de sal de mesa"}'::jsonb,
     0.00, 'https://image.pollinations.ai/prompt/Salt%20shaker%20on%20restaurant%20table', 101),

    ('request', 'Snacks', 'foh'::station_type,
     '{"en": "Chips", "es": "Chips"}'::jsonb,
     '{"en": "Complimentary tortilla chips", "es": "Chips de tortilla gratuitos"}'::jsonb,
     0.00, 'https://image.pollinations.ai/prompt/Bowl%20of%20tortilla%20chips%20on%20restaurant%20table', 102),

    ('request', 'Condiments', 'foh'::station_type,
     '{"en": "Salsa", "es": "Salsa"}'::jsonb,
     '{"en": "Complimentary salsa", "es": "Salsa gratuita"}'::jsonb,
     0.00, 'https://image.pollinations.ai/prompt/Bowl%20of%20red%20salsa%20with%20tortilla%20chips', 103),

    ('request', 'Utensils', 'foh'::station_type,
     '{"en": "New Fork", "es": "Tenedor Nuevo"}'::jsonb,
     '{"en": "Clean fork replacement", "es": "Reemplazo de tenedor limpio"}'::jsonb,
     0.00, 'https://image.pollinations.ai/prompt/Clean%20fork%20on%20restaurant%20table', 104),

    ('request', 'Utensils', 'foh'::station_type,
     '{"en": "New Knife", "es": "Cuchillo Nuevo"}'::jsonb,
     '{"en": "Clean knife replacement", "es": "Reemplazo de cuchillo limpio"}'::jsonb,
     0.00, 'https://image.pollinations.ai/prompt/Clean%20knife%20on%20restaurant%20table', 105),

    ('request', 'Utensils', 'foh'::station_type,
     '{"en": "New Spoon", "es": "Cuchara Nueva"}'::jsonb,
     '{"en": "Clean spoon replacement", "es": "Reemplazo de cuchara limpia"}'::jsonb,
     0.00, 'https://image.pollinations.ai/prompt/Clean%20spoon%20on%20restaurant%20table', 106),

    ('request', 'Beverages', 'foh'::station_type,
     '{"en": "Coffee Refill", "es": "Recarga de Café"}'::jsonb,
     '{"en": "Hot coffee refill", "es": "Recarga de café caliente"}'::jsonb,
     0.00, 'https://image.pollinations.ai/prompt/Cup%20of%20hot%20coffee%20with%20steam', 107),

    ('request', 'Beverages', 'foh'::station_type,
     '{"en": "Soda Refill", "es": "Recarga de Refresco"}'::jsonb,
     '{"en": "Soft drink refill", "es": "Recarga de refresco"}'::jsonb,
     0.00, 'https://image.pollinations.ai/prompt/Glass%20of%20soda%20with%20ice', 108),

    ('request', 'Service', 'foh'::station_type,
     '{"en": "Extra Napkins", "es": "Servilletas Extra"}'::jsonb,
     '{"en": "Additional napkins", "es": "Servilletas adicionales"}'::jsonb,
     0.00, 'https://image.pollinations.ai/prompt/Stack%20of%20paper%20napkins%20on%20table', 109)
) AS menu_data(kind, category, station, name, description, price, image_url, sort_order)
ON CONFLICT DO NOTHING;
