-- ========================================
-- COMPLETE FRESH DATABASE SETUP
-- Run this in a NEW Supabase project
-- ========================================
-- This creates the canonical schema and seeds test data
-- All columns use UUID primary keys

-- ========================================
-- PART 1: CREATE TABLES (Canonical Schema)
-- ========================================

-- Restaurants
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name JSONB NOT NULL DEFAULT '{"en":"Restaurant","es":"Restaurante"}',
    slug TEXT UNIQUE,
    address JSONB DEFAULT '{}',
    phone TEXT,
    hours JSONB DEFAULT '{"open":"9:00 AM","close":"10:00 PM"}',
    timezone TEXT DEFAULT 'America/Monterrey',
    currency TEXT DEFAULT 'MXN',
    tax_rate DECIMAL(5,2) DEFAULT 16.00,
    service_fee_percent DECIMAL(5,2) DEFAULT 0.00,
    auto_close_minutes INTEGER DEFAULT 3,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    geofence_radius_meters DECIMAL(10,2) DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurant Tables
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number INTEGER NOT NULL,
    display_name TEXT,
    seats INTEGER DEFAULT 4,
    location TEXT DEFAULT 'middle',
    x DECIMAL(10,2) DEFAULT 0,
    y DECIMAL(10,2) DEFAULT 0,
    visible_to_customers BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(restaurant_id, table_number)
);

-- Restaurant Menu Items
CREATE TABLE IF NOT EXISTS restaurant_menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name JSONB NOT NULL DEFAULT '{"en":"Item"}',
    description JSONB DEFAULT '{}',
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('food', 'drink')),
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promos
CREATE TABLE IF NOT EXISTS promos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    title JSONB NOT NULL DEFAULT '{"en":"Promo"}',
    description JSONB DEFAULT '{}',
    discount_percent DECIMAL(5,2) DEFAULT 0,
    menu_item_id UUID REFERENCES restaurant_menu_items(id) ON DELETE SET NULL,
    menu_category TEXT,
    image_url TEXT,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE DEFAULT CURRENT_DATE + INTERVAL '1 year',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    title JSONB NOT NULL DEFAULT '{"en":"Event"}',
    description JSONB DEFAULT '{}',
    event_date DATE,
    start_time TIME,
    end_time TIME,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    customer_id UUID,
    customer_name TEXT,
    order_type TEXT DEFAULT 'customer' CHECK (order_type IN ('customer', 'request', 'kitchen', 'bar', 'internal')),
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUBMITTED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'COMPLETED', 'CANCELLED')),
    total_amount DECIMAL(10,2) DEFAULT 0,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES restaurant_menu_items(id) ON DELETE SET NULL,
    seat_id UUID,
    table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    item_name TEXT,
    item_price DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seats
CREATE TABLE IF NOT EXISTS seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    seat_name TEXT NOT NULL,
    seat_number INTEGER,
    customer_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payer_customer_id UUID,
    amount DECIMAL(10,2) NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('cash', 'card', 'digital', 'auto_charge')),
    status TEXT DEFAULT 'initiated' CHECK (status IN ('initiated', 'completed', 'failed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer Profiles
CREATE TABLE IF NOT EXISTS customer_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone TEXT,
    email TEXT,
    preferred_language TEXT DEFAULT 'en',
    device_token TEXT,
    default_payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Outside Orders (for geofence-based orders)
CREATE TABLE IF NOT EXISTS outside_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
    distance_at_order DECIMAL(10,2),
    distance_threshold_meters DECIMAL(10,2) DEFAULT 100,
    auto_charge_enabled BOOLEAN DEFAULT true,
    charged_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'charging', 'charged', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Togo Orders (for takeout)
CREATE TABLE IF NOT EXISTS togo_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
    customer_name TEXT,
    pickup_confirmed BOOLEAN DEFAULT false,
    pickup_confirmed_at TIMESTAMPTZ,
    qr_code_data TEXT UNIQUE,
    estimated_pickup_time TIMESTAMPTZ,
    actual_pickup_time TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'picked_up', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Roles
CREATE TABLE IF NOT EXISTS staff_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'kitchen', 'bar', 'foh', 'host')),
    station_assignment TEXT CHECK (station_assignment IN ('kitchen', 'bar', 'foh', 'host', 'mixed', 'none')),
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(restaurant_id, user_id, role)
);

-- ========================================
-- PART 2: CREATE VIEWS (Canonical)
-- ========================================

-- Order Payment Status View
CREATE OR REPLACE VIEW order_payment_status AS
SELECT 
    o.id AS order_id,
    o.table_id,
    o.restaurant_id,
    o.status AS order_status,
    COALESCE(SUM(p.amount), 0) AS total_paid,
    COALESCE(o.total_amount, 0) AS total_due,
    COALESCE(SUM(p.amount), 0) >= COALESCE(o.total_amount, 0) AS is_payment_complete
FROM orders o
LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'completed'
GROUP BY o.id;

-- Table Availability View
CREATE OR REPLACE VIEW table_availability AS
SELECT
    rt.id AS table_id,
    rt.restaurant_id,
    rt.display_name,
    rt.table_number,
    rt.seats,
    rt.location,
    rt.x,
    rt.y,
    rt.visible_to_customers,
    NOT EXISTS (
        SELECT 1
        FROM orders o
        LEFT JOIN order_payment_status ops ON ops.order_id = o.id
        WHERE o.table_id = rt.id
            AND o.status != 'DELIVERED'
            AND (ops.order_id IS NULL OR ops.is_payment_complete = false)
    ) AS available
FROM restaurant_tables rt;

-- ========================================
-- PART 3: CREATE INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_table_id ON order_items(table_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_seats_order_id ON seats(order_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_restaurant_id ON restaurant_tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_menu_items_restaurant_id ON restaurant_menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_menu_items_kind ON restaurant_menu_items(kind);
CREATE INDEX IF NOT EXISTS idx_restaurant_menu_items_category ON restaurant_menu_items(category);

-- ========================================
-- PART 4: SEED TEST DATA
-- ========================================

DO $$
DECLARE
    demo_rest_id UUID;
    makai_rest_id UUID;
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'SEEDING TEST DATA';
    RAISE NOTICE '============================================';
    
    -- Create Demo Restaurant
    INSERT INTO restaurants (id, name, slug, address, phone, hours, timezone, currency, tax_rate)
    VALUES (
        gen_random_uuid(),
        '{"en":"Demo Restaurant","es":"Restaurante Demo"}',
        'demo-restaurant',
        '{"en":"123 Main St","es":"123 Calle Principal"}',
        '+52 555 123 4567',
        '{"open":"9:00 AM","close":"10:00 PM"}',
        'America/Monterrey',
        'MXN',
        16.00
    )
    ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO demo_rest_id;
    
    IF demo_rest_id IS NULL THEN
        SELECT id INTO demo_rest_id FROM restaurants WHERE slug = 'demo-restaurant';
    END IF;
    
    RAISE NOTICE 'Created: demo-restaurant';
    
    -- Create Makai Restaurant
    INSERT INTO restaurants (id, name, slug, address, phone, hours, timezone, currency, tax_rate)
    VALUES (
        gen_random_uuid(),
        '{"en":"Makai Restaurant","es":"Makai Restaurante"}',
        'makai-restaurant',
        '{"en":"456 Beach Ave","es":"456 Avenida Playa"}',
        '+52 555 789 0123',
        '{"open":"11:00 AM","close":"11:00 PM"}',
        'America/Monterrey',
        'USD',
        10.00
    )
    ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO makai_rest_id;
    
    IF makai_rest_id IS NULL THEN
        SELECT id INTO makai_rest_id FROM restaurants WHERE slug = 'makai-restaurant';
    END IF;
    
    RAISE NOTICE 'Created: makai-restaurant';
    
    -- Create Tables for Demo
    INSERT INTO restaurant_tables (id, restaurant_id, table_number, display_name, seats, location, x, y)
    VALUES
        (gen_random_uuid(), demo_rest_id, 1, 'Table 1', 4, 'middle', 100, 100),
        (gen_random_uuid(), demo_rest_id, 2, 'Table 2', 6, 'patio', 200, 100),
        (gen_random_uuid(), demo_rest_id, 3, 'Table 3', 2, 'window', 300, 100),
        (gen_random_uuid(), demo_rest_id, 4, 'Table 4', 8, 'middle', 100, 200),
        (gen_random_uuid(), demo_rest_id, 5, 'Table 5', 4, 'balcony', 200, 200)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Created: 5 tables for demo-restaurant';
    
    -- Create Tables for Makai
    INSERT INTO restaurant_tables (id, restaurant_id, table_number, display_name, seats, location, x, y)
    VALUES
        (gen_random_uuid(), makai_rest_id, 1, 'Bar Seat 1', 2, 'bar', 50, 50),
        (gen_random_uuid(), makai_rest_id, 2, 'Bar Seat 2', 2, 'bar', 100, 50),
        (gen_random_uuid(), makai_rest_id, 3, 'Ocean View 1', 4, 'window', 150, 100),
        (gen_random_uuid(), makai_rest_id, 4, 'Ocean View 2', 4, 'window', 200, 100),
        (gen_random_uuid(), makai_rest_id, 5, 'Patio 1', 6, 'patio', 100, 200),
        (gen_random_uuid(), makai_rest_id, 6, 'Patio 2', 6, 'patio', 200, 200)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Created: 6 tables for makai-restaurant';
    
    -- Create Menu Items for Demo (Food)
    INSERT INTO restaurant_menu_items (id, restaurant_id, name, description, price, category, kind, sort_order)
    VALUES
        (gen_random_uuid(), demo_rest_id, '{"en":"Burrito","es":"Burrito"}', '{"en":"Large flour tortilla with meat, beans, rice, cheese","es":"Tortilla grande de harina con carne, frijoles, arroz, queso"}', 120.00, 'food', 'food', 1),
        (gen_random_uuid(), demo_rest_id, '{"en":"Tacos","es":"Tacos"}', '{"en":"Three corn tortillas with your choice of meat","es":"Tres tortillas de maíz con tu elección de carne"}', 85.00, 'food', 'food', 2),
        (gen_random_uuid(), demo_rest_id, '{"en":"Quesadilla","es":"Quesadilla"}', '{"en":"Grilled tortilla with melted cheese","es":"Tortilla grill con queso derretido"}', 95.00, 'food', 'food', 3),
        (gen_random_uuid(), demo_rest_id, '{"en":"Enchiladas","es":"Enchiladas"}', '{"en":"Three corn tortillas rolled with chicken in salsa","es":"Tres tortillas de maíz enrolladas con pollo en salsa"}', 110.00, 'food', 'food', 4),
        (gen_random_uuid(), demo_rest_id, '{"en":"Guacamole & Chips","es":"Guacamole con Totopos"}', '{"en":"Fresh guacamole with crispy tortilla chips","es":"Guacamole fresco con totopos crujientes"}', 75.00, 'food', 'food', 5)
    ON CONFLICT DO NOTHING;
    
    -- Create Menu Items for Demo (Drinks)
    INSERT INTO restaurant_menu_items (id, restaurant_id, name, description, price, category, kind, sort_order)
    VALUES
        (gen_random_uuid(), demo_rest_id, '{"en":"Coca Cola","es":"Coca Cola"}', '{"en":"Cold soda 500ml","es":"Refresco frío 500ml"}', 35.00, 'drinks', 'drink', 1),
        (gen_random_uuid(), demo_rest_id, '{"en":"Limeade","es":"Limonada"}', '{"en":"Fresh squeezed lime juice with sugar","es":"Jugo de limón exprimido con azúcar"}', 40.00, 'drinks', 'drink', 2),
        (gen_random_uuid(), demo_rest_id, '{"en":"Horchata","es":"Horchata"}', '{"en":"Traditional rice cinnamon drink","es":"Bebida tradicional de arroz con canela"}', 45.00, 'drinks', 'drink', 3),
        (gen_random_uuid(), demo_rest_id, '{"en":"Michelada","es":"Michelada"}', '{"en":"Beer with lime, salt, spices","es":"Cerveza con lima, sal, especias"}', 65.00, 'drinks', 'drink', 4),
        (gen_random_uuid(), demo_rest_id, '{"en":"Domestic Beer","es":"Cerveza Nacional"}', '{"en":"Light beer 355ml","es":"Cerveza ligera 355ml"}', 50.00, 'drinks', 'drink', 5)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Created: 10 menu items for demo-restaurant';
    
    -- Create Menu Items for Makai (Food)
    INSERT INTO restaurant_menu_items (id, restaurant_id, name, description, price, category, kind, sort_order)
    VALUES
        (gen_random_uuid(), makai_rest_id, '{"en":"Fresh Catch Ceviche","es":"Ceviche del Día"}', '{"en":"Citrus-marinated fish with avocado","es":"Pescado marinado en cítricos con aguacate"}', 16.00, 'food', 'food', 1),
        (gen_random_uuid(), makai_rest_id, '{"en":"Fish Tacos","es":"Tacos de Pescado"}', '{"en":"Battered fish in corn tortillas with slaw","es":"Pescado empanizado en tortillas de maíz con col"}', 15.00, 'food', 'food', 2),
        (gen_random_uuid(), makai_rest_id, '{"en":"Shrimp Plate","es":"Plate de Camarón"}', '{"en":"Grilled shrimp with rice and vegetables","es":"Camarón grill con arroz y verduras"}', 22.00, 'food', 'food', 3),
        (gen_random_uuid(), makai_rest_id, '{"en":"Lobster Roll","es":"Roll de Langosta"}', '{"en":"Maine lobster in butter with celery","es":"Langosta de Maine en mantequilla con apio"}', 28.00, 'food', 'food', 4),
        (gen_random_uuid(), makai_rest_id, '{"en":"Kalua Pig","es":"Cerdo Kalua"}', '{"en":"Slow-roasted pulled pork with cabbage","es":"Cerdo deshilachado a fuego lento con col"}', 18.00, 'food', 'food', 5)
    ON CONFLICT DO NOTHING;
    
    -- Create Menu Items for Makai (Drinks)
    INSERT INTO restaurant_menu_items (id, restaurant_id, name, description, price, category, kind, sort_order)
    VALUES
        (gen_random_uuid(), makai_rest_id, '{"en":"Mai Tai","es":"Mai Tai"}', '{"en":"Rum, orange, lime, almond","es":"Ron, naranja, lima, almendras"}', 12.00, 'drinks', 'drink', 1),
        (gen_random_uuid(), makai_rest_id, '{"en":"Blue Hawaiian","es":"Hawaiano Azul"}', '{"en":"Rum, pineapple, coconut, blue curaçao","es":"Ron, piña, coco, blue curaçao"}', 12.00, 'drinks', 'drink', 2),
        (gen_random_uuid(), makai_rest_id, '{"en":"Pina Colada","es":"Piña Colada"}', '{"en":"Rum, pineapple, coconut cream","es":"Ron, piña, crema de coco"}', 11.00, 'drinks', 'drink', 3),
        (gen_random_uuid(), makai_rest_id, '{"en":"Fresh Lemonade","es":"Limonada Natural"}', '{"en":"Fresh squeezed lemons with mint","es":"Limones exprimidos con menta"}', 5.00, 'drinks', 'drink', 4),
        (gen_random_uuid(), makai_rest_id, '{"en":"Coconut Water","es":"Agua de Coco"}', '{"en":"Fresh young coconut water","es":"Agua de coco joven fresca"}', 6.00, 'drinks', 'drink', 5)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Created: 10 menu items for makai-restaurant';
    
    -- Create Promos
    INSERT INTO promos (id, restaurant_id, title, description, discount_percent, menu_category, is_active)
    VALUES
        (gen_random_uuid(), demo_rest_id, '{"en":"Happy Hour","es":"Hora Feliz"}', '{"en":"50% off all drinks from 3-6pm","es":"50%% descuento en todas las bebidas de 3-6pm"}', 50, 'drinks', true),
        (gen_random_uuid(), demo_rest_id, '{"en":"Food Special","es":"Especial de Comida"}', '{"en":"Free appetizer with main course","es":"Aperitivo gratis con plato principal"}', 100, 'food', true)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Created: 2 promos';
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'TEST DATA SEEDED SUCCESSFULLY';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Restaurants: demo-restaurant, makai-restaurant';
    RAISE NOTICE 'QR Codes to scan:';
    RAISE NOTICE '  - demo-restaurant/table-1';
    RAISE NOTICE '  - demo-restaurant/table-2';
    RAISE NOTICE '  - makai-restaurant/bar-seat-1';
    RAISE NOTICE '';
    RAISE NOTICE 'Scan any of these QR codes to test the app!';
END $$;

-- ========================================
-- PART 5: VERIFICATION
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'DATABASE SETUP COMPLETE';
    RAISE NOTICE '============================================';
    
    -- Count records
    RAISE NOTICE '';
    RAISE NOTICE 'Record Counts:';
    RAISE NOTICE '  Restaurants: %', (SELECT COUNT(*) FROM restaurants);
    RAISE NOTICE '  Tables: %', (SELECT COUNT(*) FROM restaurant_tables);
    RAISE NOTICE '  Menu Items: %', (SELECT COUNT(*) FROM restaurant_menu_items);
    RAISE NOTICE '  Promos: %', (SELECT COUNT(*) FROM promos);
    RAISE NOTICE '  Events: %', (SELECT COUNT(*) FROM events);
    RAISE NOTICE '  Orders: %', (SELECT COUNT(*) FROM orders);
    RAISE NOTICE '  Order Items: %', (SELECT COUNT(*) FROM order_items);
    RAISE NOTICE '  Payments: %', (SELECT COUNT(*) FROM payments);
    
    RAISE NOTICE '';
    RAISE NOTICE 'Schema is canonical-compliant (all UUID primary keys)!';
END $$;
