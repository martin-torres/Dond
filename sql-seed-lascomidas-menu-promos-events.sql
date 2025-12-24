-- SQL script to seed LasComidas restaurant with authentic Monterrey menu, promos, and events
-- Restaurant ID: 115e05ba-f4ea-4013-837d-70b88acbf565 (LasComidas)

-- First, ensure the restaurant exists (LasComidas)
INSERT INTO restaurants (id, slug, name, address, hours, wait_time, distance)
VALUES (
  '115e05ba-f4ea-4013-837d-70b88acbf565',
  'Rest-one-lascomidas',
  '{"en": "LasComidas", "es": "LasComidas"}',
  '{"en": "Pino Suarez 202, Centro, Monterrey, N.L.", "es": "Pino Suarez 202, Centro, Monterrey, N.L."}',
  '{"open": "9:00 AM", "close": "10:00 PM"}',
  30,
  100
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  hours = EXCLUDED.hours,
  wait_time = EXCLUDED.wait_time,
  distance = EXCLUDED.distance;

-- Insert Menu Items for LasComidas (Authentic Monterrey Cuisine)
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
-- Food Items (Comida)
('115e05ba-f4ea-4013-837d-70b88acbf565', 'food', 'Entradas', 'kitchen', 'Kitchen', '{"en": "Machacado con Huevo", "es": "Machacado con Huevo"}', '{"en": "Traditional dried beef with scrambled eggs, served with handmade tortillas", "es": "Carne seca tradicional con huevos revueltos, servida con tortillas artesanales"}', 85.00, 'https://images.unsplash.com/photo-1614094082869-7f63da5e5249?auto=format&fit=crop&w=800&q=80', true, 1),
('115e05ba-f4ea-4013-837d-70b88acbf565', 'food', 'Entradas', 'kitchen', 'Kitchen', '{"en": "Albóndigas en Salsa", "es": "Albóndigas en Salsa"}', '{"en": "Homemade meatballs in rich tomato sauce, served with rice", "es": "Albóndigas caseras en salsa de tomate rico, servidas con arroz"}', 95.00, 'https://images.unsplash.com/photo-1563245372-f21e161e31a6?auto=format&fit=crop&w=800&q=80', true, 2),
('115e05ba-f4ea-4013-837d-70b88acbf565', 'food', 'Platos Fuertes', 'kitchen', 'Kitchen', '{"en": "Asado de Puerco", "es": "Asado de Puerco"}', '{"en": "Slow-roasted pork shoulder with traditional norteño seasoning", "es": "Pierna de puerco asada lentamente con sazón norteña tradicional"}', 140.00, 'https://images.unsplash.com/photo-1607532941433-304405c4a27b?auto=format&fit=crop&w=800&q=80', true, 3),
('115e05ba-f4ea-4013-837d-70b88acbf565', 'food', 'Platos Fuertes', 'kitchen', 'Kitchen', '{"en": "Milanesa de Res", "es": "Milanesa de Res"}', '{"en": "Breaded beef cutlet served with fries and salad", "es": "Milanesa de res empanizada servida con papas fritas y ensalada"}', 120.00, 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80', true, 4),
('115e05ba-f4ea-4013-837d-70b88acbf565', 'food', 'Platos Fuertes', 'kitchen', 'Kitchen', '{"en": "Milanesa de Pollo Rellena", "es": "Milanesa de Pollo Rellena"}', '{"en": "Breaded chicken stuffed with ham and cheese, served with rice", "es": "Milanesa de pollo rellena con jamón y queso, servida con arroz"}', 125.00, 'https://images.unsplash.com/photo-1626078272561-a35204063373?auto=format&fit=crop&w=800&q=80', true, 5),
('115e05ba-f4ea-4013-837d-70b88acbf565', 'food', 'Platos Fuertes', 'kitchen', 'Kitchen', '{"en": "Cortadillo", "es": "Cortadillo"}', '{"en": "Traditional beef dish with onions and chilies, a Monterrey classic", "es": "Plato tradicional de res con cebollas y chiles, un clásico de Monterrey"}', 135.00, 'https://images.unsplash.com/photo-1626082936010-6a70172ae615?auto=format&fit=crop&w=800&q=80', true, 6),
('115e05ba-f4ea-4013-837d-70b88acbf565', 'food', 'Sopas', 'kitchen', 'Kitchen', '{"en": "Caldo de Res", "es": "Caldo de Res"}', '{"en": "Hearty beef soup with corn, carrots, cabbage, and hominy", "es": "Caldo de res contundente con maíz, zanahorias, col y maíz pozolero"}', 90.00, 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80', true, 7),
('115e05ba-f4ea-4013-837d-70b88acbf565', 'food', 'Botanas', 'kitchen', 'Kitchen', '{"en": "Chicharrón en Salsa Verde", "es": "Chicharrón en Salsa Verde"}', '{"en": "Crispy pork rinds in tangy green tomatillo salsa", "es": "Chicharrón crujiente en salsa verde de tomatillo ácida"}', 80.00, 'https://images.unsplash.com/photo-1626269994151-449421fe990c?auto=format&fit=crop&w=800&q=80', true, 8),
('115e05ba-f4ea-4013-837d-70b88acbf565', 'food', 'Postres', 'kitchen', 'Kitchen', '{"en": "Flan Napolitano", "es": "Flan Napolitano"}', '{"en": "Traditional Mexican custard with caramel sauce", "es": "Flan mexicano tradicional con salsa de caramelo"}', 45.00, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80', true, 9),
('115e05ba-f4ea-4013-837d-70b88acbf565', 'food', 'Postres', 'kitchen', 'Kitchen', '{"en": "Arroz con Leche", "es": "Arroz con Leche"}', '{"en": "Creamy rice pudding with cinnamon and vanilla", "es": "Arroz con leche cremoso con canela y vainilla"}', 40.00, 'https://images.unsplash.com/photo-1626269974663-a1300f1e0f4b?auto=format&fit=crop&w=800&q=80', true, 10),

-- Drink Items (Bebidas)
('115e05ba-f4ea-4013-837d-70b88acbf565', 'drink', 'Refrescos', 'bar', 'Bar', '{"en": "Coca-Cola", "es": "Coca-Cola"}', '{"en": "Classic cola soft drink", "es": "Refresco de cola clásico"}', 25.00, 'https://images.unsplash.com/photo-1622597467836-942f207708c3?auto=format&fit=crop&w=800&q=80', true, 11),
('115e05ba-f4ea-4013-837d-70b88acbf565', 'drink', 'Refrescos', 'bar', 'Bar', '{"en": "Sprite", "es": "Sprite"}', '{"en": "Lemon-lime flavored soft drink", "es": "Refresco con sabor a limón y lima"}', 25.00, 'https://images.unsplash.com/photo-1622597467836-942f207708c3?auto=format&fit=crop&w=800&q=80', true, 12),
('115e05ba-f4ea-4013-837d-70b88acbf565', 'drink', 'Refrescos', 'bar', 'Bar', '{"en": "Fanta", "es": "Fanta"}', '{"en": "Orange flavored soft drink", "es": "Refresco con sabor a naranja"}', 25.00, 'https://images.unsplash.com/photo-1622597467836-942f207708c3?auto=format&fit=crop&w=800&q=80', true, 13),
('115e05ba-f4ea-4013-837d-70b88acbf565', 'drink', 'Refrescos', 'bar', 'Bar', '{"en": "Squirt", "es": "Squirt"}', '{"en": "Grapefruit flavored soft drink", "es": "Refresco con sabor a toronja"}', 25.00, 'https://images.unsplash.com/photo-1622597467836-942f207708c3?auto=format&fit=crop&w=800&q=80', true, 14),
('115e05ba-f4ea-4013-837d-70b88acbf565', 'drink', 'Aguas Frescas', 'bar', 'Bar', '{"en": "Horchata", "es": "Horchata"}', '{"en": "Traditional rice water with cinnamon and vanilla", "es": "Agua de arroz tradicional con canela y vainilla"}', 20.00, 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80', true, 15),
('115e05ba-f4ea-4013-837d-70b88acbf565', 'drink', 'Aguas Frescas', 'bar', 'Bar', '{"en": "Agua de Jamaica", "es": "Agua de Jamaica"}', '{"en": "Hibiscus iced tea, tart and refreshing", "es": "Té frío de jamaica, ácido y refrescante"}', 20.00, 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80', true, 16),
('115e05ba-f4ea-4013-837d-70b88acbf565', 'drink', 'Aguas Frescas', 'bar', 'Bar', '{"en": "Agua de Tamarindo", "es": "Agua de Tamarindo"}', '{"en": "Tamarind iced drink, sweet and tangy", "es": "Agua de tamarindo, dulce y ácida"}', 20.00, 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80', true, 17),
('115e05ba-f4ea-4013-837d-70b88acbf565', 'drink', 'Cervezas', 'bar', 'Bar', '{"en": "Modelo Especial", "es": "Modelo Especial"}', '{"en": "Mexican lager beer, crisp and refreshing", "es": "Cerveza tipo lager mexicana, crujiente y refrescante"}', 35.00, 'https://images.unsplash.com/photo-1551024709-90346f49a031?auto=format&fit=crop&w=800&q=80', true, 18),
('115e05ba-f4ea-4013-837d-70b88acbf565', 'drink', 'Cervezas', 'bar', 'Bar', '{"en": "Corona", "es": "Corona"}', '{"en": "Light Mexican beer, best with lime", "es": "Cerveza ligera mexicana, mejor con limón"}', 35.00, 'https://images.unsplash.com/photo-1551024709-90346f49a031?auto=format&fit=crop&w=800&q=80', true, 19),
('115e05ba-f4ea-4013-837d-70b88acbf565', 'drink', 'Cervezas', 'bar', 'Bar', '{"en": "Pacífico", "es": "Pacífico"}', '{"en": "Mexican pale lager from Pacific coast", "es": "Cerveza tipo lager mexicana de la costa pacífica"}', 35.00, 'https://images.unsplash.com/photo-1551024709-90346f49a031?auto=format&fit=crop&w=800&q=80', true, 20)
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

-- Insert Promos for LasComidas
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
-- Welcome Special Promo
('115e05ba-f4ea-4013-837d-70b88acbf565', 
  '{"en": "Welcome Special", "es": "Especial de Bienvenida"}',
  '{"en": "Get 15% off your first order when you scan the QR code and join us for lunch or dinner", "es": "Obtén 15% de descuento en tu primera orden al escanear el código QR y acompañarnos para el almuerzo o la cena"}',
  15.00,
  0.00,
  'https://images.unsplash.com/photo-1571115177042-924b24948b2a?auto=format&fit=crop&w=800&q=80',
  NULL,
  'all',
  'full_width',
  true,
  '2025-01-01',
  '2025-12-31'
),

-- Happy Hour Promo (links to specific drinks)
('115e05ba-f4ea-4013-837d-70b88acbf565',
  '{"en": "Happy Hour", "es": "Hora Feliz"}',
  '{"en": "All soft drinks 20% off from 2 PM to 5 PM every weekday", "es": "Todos los refrescos 20% de descuento de 2 PM a 5 PM entre semana"}',
  20.00,
  0.00,
  'https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?auto=format&fit=crop&w=800&q=80',
  NULL,
  'drinks',
  'two_column',
  true,
  '2025-01-01',
  '2025-12-31'
),

-- Family Feast Promo (links to main dishes)
('115e05ba-f4ea-4013-837d-70b88acbf565',
  '{"en": "Family Feast", "es": "Fiesta Familiar"}',
  '{"en": "Buy 2 main dishes, get a free appetizer. Perfect for family dinners!", "es": "Compra 2 platos fuertes, obtén una entrada gratis. ¡Perfecto para cenas familiares!"}',
  0.00,
  0.00,
  'https://images.unsplash.com/photo-1546549022-3b23b8b9a344?auto=format&fit=crop&w=800&q=80',
  NULL,
  'food',
  'three_column',
  true,
  '2025-01-01',
  '2025-12-31'
),

-- Machacado Special (links to specific menu item)
('115e05ba-f4ea-4013-837d-70b88acbf565',
  '{"en": "Machacado Morning", "es": "Machacado Matutino"}',
  '{"en": "Try our traditional Machacado con Huevo, a true norteño breakfast classic", "es": "Prueba nuestro tradicional Machacado con Huevo, un clásico norteño del desayuno"}',
  10.00,
  0.00,
  'https://images.unsplash.com/photo-1614094082869-7f63da5e5249?auto=format&fit=crop&w=800&q=80',
  (SELECT id FROM restaurant_menu_items WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565' AND name->>'en' = 'Machacado con Huevo'),
  'food',
  'full_width',
  true,
  '2025-01-01',
  '2025-12-31'
),

-- Caldo de Res Comfort (links to specific menu item)
('115e05ba-f4ea-4013-837d-70b88acbf565',
  '{"en": "Comfort Soup", "es": "Sopa Confort"}',
  '{"en": "Warm up with our traditional Caldo de Res, the perfect comfort food", "es": "Calientate con nuestro tradicional Caldo de Res, la comida reconfortante perfecta"}',
  5.00,
  0.00,
  'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
  (SELECT id FROM restaurant_menu_items WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565' AND name->>'en' = 'Caldo de Res'),
  'food',
  'two_column',
  true,
  '2025-01-01',
  '2025-12-31'
)
ON CONFLICT DO NOTHING;

-- Insert Events for LasComidas
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_promos_restaurant_id_lascomidas ON promos(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_promos_active_lascomidas ON promos(is_active);
CREATE INDEX IF NOT EXISTS idx_events_restaurant_id_lascomidas ON events(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_events_active_lascomidas ON events(is_active);

-- Verification queries (run these separately if needed):

-- Check data insertion counts
-- SELECT 'Restaurant LasComidas' as entity, COUNT(*) as count FROM restaurants WHERE id = '115e05ba-f4ea-4013-837d-70b88acbf565';
-- SELECT 'Menu Items' as entity, COUNT(*) as count FROM restaurant_menu_items WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565';
-- SELECT 'Promos' as entity, COUNT(*) as count FROM promos WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565' AND is_active = true;
-- SELECT 'Events' as entity, COUNT(*) as count FROM events WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565' AND is_active = true;

-- Sample data verification queries (run these separately if needed):
-- SELECT name->>'es' as spanish_name, name->>'en' as english_name, category, kind, price::text || ' MXN' as price FROM restaurant_menu_items WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565' ORDER BY kind, category, sort_order LIMIT 5;
-- SELECT title->>'es' as spanish_name, title->>'en' as english_name, layout_type, discount_percent::text || '% off' as discount FROM promos WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565' AND is_active = true;
-- SELECT title->>'es' as spanish_name, title->>'en' as english_name, event_date, start_time, end_time FROM events WHERE restaurant_id = '115e05ba-f4ea-4013-837d-70b88acbf565' AND is_active = true;
