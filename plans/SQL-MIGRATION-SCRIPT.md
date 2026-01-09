# SQL Migration Script for Supabase

**Copy and paste this entire script into Supabase SQL Editor**

---

## STEP 1: RUN PENDING MIGRATIONS

```sql
-- Remove the 'available' column from restaurant_tables (canonical compliance)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'restaurant_tables' AND column_name = 'available'
    ) THEN
        ALTER TABLE restaurant_tables DROP COLUMN IF EXISTS available;
        RAISE NOTICE 'Column "available" removed from restaurant_tables';
    ELSE
        RAISE NOTICE 'Column "available" does not exist';
    END IF;
END $$;
```

---

## STEP 2: ADD NEW COLUMNS TO EXISTING TABLES

```sql
-- Add columns to restaurants table
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Monterrey';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'MXN';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5, 2) DEFAULT 16.00;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS service_fee_percent DECIMAL(5, 2) DEFAULT 0.00;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS auto_close_minutes INTEGER DEFAULT 3;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11, 8);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS geofence_radius_meters DECIMAL(10, 2) DEFAULT 100;

-- Add columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_outside_order BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_togo_order BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_ready_time TIMESTAMPTZ;

-- Add columns to seats table
ALTER TABLE seats ADD COLUMN IF NOT EXISTS seat_position INTEGER;
ALTER TABLE seats ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE seats ADD COLUMN IF NOT EXISTS is_primary_seat BOOLEAN DEFAULT false;

-- Add columns to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'digital', 'auto_charge', 'external_terminal'));
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS tip_amount DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS tip_allocation JSONB DEFAULT '{}';

-- Add column to order_items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS seat_id UUID REFERENCES seats(id) ON DELETE SET NULL;
```

---

## STEP 3: CREATE NEW TABLES

```sql
-- Table: customer_profiles
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

-- Table: customer_location_history
CREATE TABLE IF NOT EXISTS customer_location_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(10, 2),
    distance_to_restaurant DECIMAL(10, 2),
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    event_type TEXT DEFAULT 'background_update' CHECK (event_type IN ('background_update', 'order_placed', 'order_charged', 'geofence_exit'))
);

-- Table: outside_orders
CREATE TABLE IF NOT EXISTS outside_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
    distance_at_order DECIMAL(10, 2),
    distance_threshold_meters DECIMAL(10, 2) DEFAULT 100,
    auto_charge_enabled BOOLEAN DEFAULT true,
    charged_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'charging', 'charged', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: table_shares
CREATE TABLE IF NOT EXISTS table_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES restaurant_tables(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    seat_id UUID REFERENCES seats(id) ON DELETE SET NULL,
    device_id TEXT NOT NULL,
    is_primary_device BOOLEAN DEFAULT false,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'removed'))
);

-- Table: togo_orders
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

-- Table: staff_roles
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

-- Table: table_move_requests
CREATE TABLE IF NOT EXISTS table_move_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
    from_table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    to_table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Table: order_sync_groups
CREATE TABLE IF NOT EXISTS order_sync_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES restaurant_tables(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    sync_token TEXT UNIQUE,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'submitting', 'submitted', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ
);

-- Table: order_sync_participants
CREATE TABLE IF NOT EXISTS order_sync_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_group_id UUID NOT NULL REFERENCES order_sync_groups(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
    device_id TEXT NOT NULL,
    is_ready BOOLEAN DEFAULT false,
    ready_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## STEP 4: ADD INDEXES

```sql
-- customer_profiles indexes
CREATE INDEX IF NOT EXISTS idx_customer_profiles_email ON customer_profiles(email);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_phone ON customer_profiles(phone);

-- customer_location_history indexes
CREATE INDEX IF NOT EXISTS idx_customer_location_customer_id ON customer_location_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_location_restaurant_id ON customer_location_history(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_customer_location_recorded_at ON customer_location_history(recorded_at);

-- outside_orders indexes
CREATE INDEX IF NOT EXISTS idx_outside_orders_order_id ON outside_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_outside_orders_status ON outside_orders(status);

-- table_shares indexes
CREATE INDEX IF NOT EXISTS idx_table_shares_table_id ON table_shares(table_id);
CREATE INDEX IF NOT EXISTS idx_table_shares_customer_id ON table_shares(customer_id);

-- togo_orders indexes
CREATE INDEX IF NOT EXISTS idx_togo_orders_qr_code ON togo_orders(qr_code_data);
CREATE INDEX IF NOT EXISTS idx_togo_orders_status ON togo_orders(status);

-- staff_roles indexes
CREATE INDEX IF NOT EXISTS idx_staff_roles_restaurant_id ON staff_roles(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_roles_user_id ON staff_roles(user_id);

-- order_sync_groups indexes
CREATE INDEX IF NOT EXISTS idx_order_sync_groups_table_id ON order_sync_groups(table_id);

-- order_items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_seat_id ON order_items(seat_id);
```

---

## STEP 5: ADD RLS POLICIES

```sql
-- customer_profiles RLS
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can read own profile" ON customer_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Customers can update own profile" ON customer_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Authenticated can manage customer profiles" ON customer_profiles FOR ALL USING (auth.role() = 'authenticated');

-- customer_location_history RLS
ALTER TABLE customer_location_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can read own location" ON customer_location_history FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Service role can manage location" ON customer_location_history FOR ALL USING (auth.role() = 'service_role');

-- outside_orders RLS
ALTER TABLE outside_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage outside orders" ON outside_orders FOR ALL USING (auth.role() = 'authenticated');

-- table_shares RLS
ALTER TABLE table_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can read own table shares" ON table_shares FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Authenticated can manage table shares" ON table_shares FOR ALL USING (auth.role() = 'authenticated');

-- togo_orders RLS
ALTER TABLE togo_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read togo orders" ON togo_orders FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage togo orders" ON togo_orders FOR ALL USING (auth.role() = 'authenticated');

-- staff_roles RLS
ALTER TABLE staff_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read own roles" ON staff_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owner/Manager can manage staff roles" ON staff_roles FOR ALL USING (
    EXISTS (SELECT 1 FROM staff_roles sr2 WHERE sr2.restaurant_id = staff_roles.restaurant_id AND sr2.user_id = auth.uid() AND sr2.role IN ('owner', 'manager') AND sr2.is_active = true)
);
CREATE POLICY "Service role can manage staff roles" ON staff_roles FOR ALL USING (auth.role() = 'service_role');

-- table_move_requests RLS
ALTER TABLE table_move_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage table move requests" ON table_move_requests FOR ALL USING (auth.role() = 'authenticated');

-- order_sync_groups RLS
ALTER TABLE order_sync_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read order sync groups" ON order_sync_groups FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage order sync groups" ON order_sync_groups FOR ALL USING (auth.role() = 'authenticated');

-- order_sync_participants RLS
ALTER TABLE order_sync_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read sync participants" ON order_sync_participants FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage sync participants" ON order_sync_participants FOR ALL USING (auth.role() = 'authenticated');
```

---

## STEP 6: HELPER FUNCTIONS

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_customer_profiles_updated_at BEFORE UPDATE ON customer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_outside_orders_updated_at BEFORE UPDATE ON outside_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_togo_orders_updated_at BEFORE UPDATE ON togo_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_roles_updated_at BEFORE UPDATE ON staff_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate distance (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(lat1 DECIMAL, lng1 DECIMAL, lat2 DECIMAL, lng2 DECIMAL)
RETURNS DECIMAL AS $$
DECLARE
    R CONSTANT DECIMAL := 6371000;
    phi1 DECIMAL := RADIANS(lat1);
    phi2 DECIMAL := RADIANS(lat2);
    dphi DECIMAL := RADIANS(lat2 - lat1);
    dlambda DECIMAL := RADIANS(lng2 - lng1);
    a DECIMAL;
    c DECIMAL;
BEGIN
    a := SIN(dphi/2)^2 + COS(phi1) * COS(phi2) * SIN(dlambda/2)^2;
    c := 2 * ATAN2(SQRT(a), SQRT(1-a));
    RETURN R * c;
END;
$$ LANGUAGE plpgsql;
```

---

## VERIFICATION

After running, verify with:

```sql
-- Check new tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN (
    'customer_profiles', 'customer_location_history', 'outside_orders', 'table_shares',
    'togo_orders', 'staff_roles', 'table_move_requests', 'order_sync_groups', 'order_sync_participants'
) ORDER BY table_name;

-- Check new columns in restaurants
SELECT column_name FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name IN (
    'slug', 'timezone', 'currency', 'tax_rate', 'service_fee_percent', 'auto_close_minutes',
    'location_lat', 'location_lng', 'geofence_radius_meters'
);
```

---

**Migration complete!** The database is now ready for the TypeScript implementation.
