# Fix: Order ID Type Mismatch Error

## Problem

```
Error: Failed to run sql query: ERROR: 42804: foreign key constraint "outside_orders_order_id_fkey" cannot be implemented
DETAIL: Key columns "order_id" and "id" are of incompatible types: uuid and bigint.
```

## Root Cause

The [`outside_orders`](plans/SQL-MIGRATION-SCRIPT.md:93) table expects `orders.id` to be `UUID`, but your `orders` table still has `id` as `bigint`.

## Solution

You must run a migration to convert `orders.id` from `bigint` to `UUID` **before** running Step 3 of the main migration script.

---

## Step 1: Run This Migration FIRST

Copy and paste this into Supabase SQL Editor:

```sql
-- Migration: Convert orders.id from bigint to UUID
-- Run this FIRST, then run Step 3 of the main migration script

-- IMPORTANT: Backup your data first!

DO $
DECLARE
    tbl text;
    col text;
    fk_name text;
BEGIN
    RAISE NOTICE 'Step 1: Adding id_uuid column...';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS id_uuid UUID DEFAULT gen_random_uuid();
    UPDATE orders SET id_uuid = gen_random_uuid() WHERE id_uuid IS NULL;
    
    RAISE NOTICE 'Step 2: Dropping foreign key constraints with CASCADE...';
    FOR tbl, col, fk_name IN 
        SELECT conrelid::regclass::text, a.attname, c.conname
        FROM pg_constraint c
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = c.confkey[1]
        WHERE c.conrelid = 'orders'::regclass AND c.contype = 'f'
    LOOP
        RAISE NOTICE 'Dropping constraint % on table %', fk_name, tbl;
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I CASCADE', tbl, fk_name);
    END LOOP;
    
    RAISE NOTICE 'Step 3: Replacing id column with UUID...';
    ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_pkey CASCADE;
    ALTER TABLE orders DROP COLUMN IF EXISTS id CASCADE;
    ALTER TABLE orders RENAME COLUMN id_uuid TO id;
    ALTER TABLE orders ADD CONSTRAINT orders_pkey PRIMARY KEY (id);
    
    RAISE NOTICE 'Step 4: Updating related tables...';
    
    -- Seats
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seats' AND column_name = 'order_id') THEN
        ALTER TABLE seats ALTER COLUMN order_id TYPE UUID USING order_id::UUID;
        ALTER TABLE seats ADD CONSTRAINT seats_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
        RAISE NOTICE '  - Updated seats.order_id';
    END IF;
    
    -- Payments
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'order_id') THEN
        ALTER TABLE payments ALTER COLUMN order_id TYPE UUID USING order_id::UUID;
        ALTER TABLE payments ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
        RAISE NOTICE '  - Updated payments.order_id';
    END IF;
    
    -- Order items
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'order_id') THEN
        ALTER TABLE order_items ALTER COLUMN order_id TYPE UUID USING order_id::UUID;
        ALTER TABLE order_items ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
        RAISE NOTICE '  - Updated order_items.order_id';
    END IF;
    
    -- Outside orders (THIS WAS FAILING)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'outside_orders' AND column_name = 'order_id') THEN
        ALTER TABLE outside_orders ALTER COLUMN order_id TYPE UUID USING order_id::UUID;
        ALTER TABLE outside_orders ADD CONSTRAINT outside_orders_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
        RAISE NOTICE '  - Updated outside_orders.order_id';
    END IF;
    
    -- Togo orders
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'togo_orders' AND column_name = 'order_id') THEN
        ALTER TABLE togo_orders ALTER COLUMN order_id TYPE UUID USING order_id::UUID;
        ALTER TABLE togo_orders ADD CONSTRAINT togo_orders_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
        RAISE NOTICE '  - Updated togo_orders.order_id';
    END IF;
    
    -- Table move requests
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'table_move_requests' AND column_name = 'order_id') THEN
        ALTER TABLE table_move_requests ALTER COLUMN order_id TYPE UUID USING order_id::UUID;
        ALTER TABLE table_move_requests ADD CONSTRAINT table_move_requests_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
        RAISE NOTICE '  - Updated table_move_requests.order_id';
    END IF;
    
    -- Order sync groups
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_sync_groups' AND column_name = 'order_id') THEN
        ALTER TABLE order_sync_groups ALTER COLUMN order_id TYPE UUID USING order_id::UUID;
        ALTER TABLE order_sync_groups ADD CONSTRAINT order_sync_groups_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
        RAISE NOTICE '  - Updated order_sync_groups.order_id';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'SUCCESS: orders.id is now UUID!';
    RAISE NOTICE '============================================';
END $;
```

---

## Step 2: Run Step 3 of Main Migration

After the above migration completes successfully, run Step 3 from [`plans/SQL-MIGRATION-SCRIPT.md`](plans/SQL-MIGRATION-SCRIPT.md:67):

```sql
-- Step 3: Create new tables (includes outside_orders)
CREATE TABLE IF NOT EXISTS outside_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    ...
);
```

---

## Verification

Run this to verify:

```sql
SELECT 
    'orders' as table_name, data_type as id_type 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'id'
UNION ALL
SELECT 
    'outside_orders' as table_name, data_type as id_type 
FROM information_schema.columns 
WHERE table_name = 'outside_orders' AND column_name = 'order_id';
```

Both should show `uuid` as the data type.
