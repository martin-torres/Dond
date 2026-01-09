-- Migration: Convert orders.id from bigint to UUID
-- This must run BEFORE Step 3 of the main migration script
-- Run this in Supabase SQL Editor FIRST

-- IMPORTANT: Before running, backup your orders table data
-- This migration will generate new UUIDs for all existing orders

DO $$
DECLARE
    tbl text;
    col text;
    fk_name text;
BEGIN
    -- Step 1: Check current orders.id type
    RAISE NOTICE 'Checking orders table structure...';
    
    -- Step 2: Add new UUID column
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS id_uuid UUID DEFAULT gen_random_uuid();
    RAISE NOTICE 'Added id_uuid column';
    
    -- Step 3: Populate UUIDs for existing orders
    UPDATE orders SET id_uuid = gen_random_uuid() WHERE id_uuid IS NULL;
    RAISE NOTICE 'Generated UUIDs for existing orders';
    
    -- Step 4: Create index on new UUID column
    CREATE INDEX IF NOT EXISTS idx_orders_id_uuid ON orders(id_uuid);
    RAISE NOTICE 'Created index on id_uuid';
    
    -- Step 5: Drop foreign key constraints that reference orders.id
    -- We need to temporarily drop these to change the column type
    RAISE NOTICE 'Dropping foreign key constraints referencing orders.id...';
    
    FOR tbl, col, fk_name IN 
        SELECT conrelid::regclass::text, a.attname, c.conname
        FROM pg_constraint c
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = c.confkey[1]
        JOIN pg_class cl ON cl.oid = c.confrelid
        WHERE c.conrelid = 'orders'::regclass AND c.contype = 'f'
    LOOP
        RAISE NOTICE 'Dropping constraint % on column % in table %', fk_name, col, tbl;
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', tbl, fk_name);
    END LOOP;
    
    -- Step 6: Drop primary key constraint
    ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_pkey;
    RAISE NOTICE 'Dropped primary key constraint';
    
    -- Step 7: Drop old bigint id column
    ALTER TABLE orders DROP COLUMN IF EXISTS id CASCADE;
    RAISE NOTICE 'Dropped old id column';
    
    -- Step 8: Rename UUID column to id
    ALTER TABLE orders RENAME COLUMN id_uuid TO id;
    RAISE NOTICE 'Renamed id_uuid to id';
    
    -- Step 9: Add new primary key constraint
    ALTER TABLE orders ADD CONSTRAINT orders_pkey PRIMARY KEY (id);
    RAISE NOTICE 'Added new primary key constraint';
    
    -- Step 10: Recreate foreign key constraints
    RAISE NOTICE 'Recreating foreign key constraints...';
    
    -- Update all tables that have order_id columns
    -- Seats table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seats' AND column_name = 'order_id') THEN
        ALTER TABLE seats ALTER COLUMN order_id TYPE UUID USING order_id::UUID;
        ALTER TABLE seats ADD CONSTRAINT seats_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
        RAISE NOTICE 'Updated seats.order_id to UUID';
    END IF;
    
    -- Payments table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'order_id') THEN
        ALTER TABLE payments ALTER COLUMN order_id TYPE UUID USING order_id::UUID;
        ALTER TABLE payments ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
        RAISE NOTICE 'Updated payments.order_id to UUID';
    END IF;
    
    -- Order items table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'order_id') THEN
        ALTER TABLE order_items ALTER COLUMN order_id TYPE UUID USING order_id::UUID;
        ALTER TABLE order_items ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
        RAISE NOTICE 'Updated order_items.order_id to UUID';
    END IF;
    
    -- Outside orders table (this was failing)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'outside_orders' AND column_name = 'order_id') THEN
        ALTER TABLE outside_orders ALTER COLUMN order_id TYPE UUID USING order_id::UUID;
        ALTER TABLE outside_orders ADD CONSTRAINT outside_orders_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
        RAISE NOTICE 'Updated outside_orders.order_id to UUID';
    END IF;
    
    -- Togo orders table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'togo_orders' AND column_name = 'order_id') THEN
        ALTER TABLE togo_orders ALTER COLUMN order_id TYPE UUID USING order_id::UUID;
        ALTER TABLE togo_orders ADD CONSTRAINT togo_orders_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
        RAISE NOTICE 'Updated togo_orders.order_id to UUID';
    END IF;
    
    -- Table move requests table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'table_move_requests' AND column_name = 'order_id') THEN
        ALTER TABLE table_move_requests ALTER COLUMN order_id TYPE UUID USING order_id::UUID;
        ALTER TABLE table_move_requests ADD CONSTRAINT table_move_requests_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
        RAISE NOTICE 'Updated table_move_requests.order_id to UUID';
    END IF;
    
    -- Order sync groups table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_sync_groups' AND column_name = 'order_id') THEN
        ALTER TABLE order_sync_groups ALTER COLUMN order_id TYPE UUID USING order_id::UUID;
        ALTER TABLE order_sync_groups ADD CONSTRAINT order_sync_groups_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
        RAISE NOTICE 'Updated order_sync_groups.order_id to UUID';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'orders.id is now UUID type';
    RAISE NOTICE 'All foreign key constraints recreated';
    RAISE NOTICE '============================================';
END $$;

-- Verify the migration
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Verification:';
    RAISE NOTICE 'orders.id type: %', (SELECT data_type FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'id');
    RAISE NOTICE 'seats.order_id type: %', (SELECT data_type FROM information_schema.columns WHERE table_name = 'seats' AND column_name = 'order_id');
    RAISE NOTICE 'payments.order_id type: %', (SELECT data_type FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'order_id');
