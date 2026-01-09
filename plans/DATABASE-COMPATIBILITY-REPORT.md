# QR Restaurant App - Database Compatibility Report

**Generated**: 2026-01-09  
**Status**: Analysis Complete  
**Purpose**: Map existing Supabase schema to new app requirements

---

## 📋 Executive Summary

The existing Supabase database has a well-structured schema that covers most core functionality. However, several **new tables and columns** are needed to support the advanced features described (location tracking, multi-device table sharing, to-go orders with QR confirmation, staff roles, manager analytics, and operator platform).

### Key Findings:
- **Existing Tables**: 15 core tables already implemented
- **Compatible Features**: Menu, orders, payments, promos, events, floor plans
- **Missing Tables**: 8 new tables required for complete functionality
- **Missing Columns**: 12 new columns across existing tables
- **Language Support**: Already supports en, es, fr, de, ja, ar, zh (7 languages)

---

## ✅ Existing Database Schema (Verified)

### Core Tables

| Table | File | Purpose | Status |
|-------|------|---------|--------|
| [`restaurants`](sql/canonical/tables/sql-create-restaurants-table.sql) | Basic restaurant info | ✅ Active |
| [`orders`](sql/canonical/tables/sql-create-seats-and-payments-tables.sql) | Order headers | ✅ Active |
| [`order_items`](sql/canonical/tables/sql-create-seats-and-payments-tables.sql) | Order line items | ✅ Active |
| [`payments`](sql/canonical/tables/sql-create-seats-and-payments-tables.sql) | Payment records | ✅ Active |
| [`seats`](sql/canonical/tables/sql-create-seats-and-payments-tables.sql) | Seat attribution | ✅ Active |
| [`restaurant_tables`](sql/canonical/tables/sql-create-tables-fixed.sql) | Table definitions | ✅ Active |
| [`restaurant_menu_items`](sql/canonical/tables/sql-create-menu-items-final.sql) | Menu items | ✅ Active |
| [`promos`](sql/canonical/tables/sql-create-promos-events.sql) | Promotional offers | ✅ Active |
| [`events`](sql/canonical/tables/sql-create-promos-events.sql) | Special events | ✅ Active |
| [`app_fees`](sql/canonical/tables/sql-create-app-fees.sql) | Platform fee structure | ✅ Active |
| [`restaurant_fees`](sql/canonical/tables/sql-create-restaurant-fees.sql) | Per-restaurant fees | ✅ Active |
| [`restaurant_analytics`](sql/canonical/tables/sql-create-restaurant-analytics.sql) | Timestamped events | ✅ Active |
| [`admin_communications`](sql/canonical/tables/sql-create-admin-communications.sql) | Messages to restaurants | ✅ Active |
| [`data_imports`](sql/canonical/tables/sql-create-data-imports.sql) | Import tracking | ✅ Active |
| [`system_events`](sql/canonical/tables/sql-create-system-events-table.sql) | Advisory event log | ⚠️ Conditional |

### Existing Views

| View | File | Purpose |
|------|------|---------|
| [`order_payment_status`](sql/canonical/views/sql-create-order-payment-status-view.sql) | Derives payment completeness |

---

## 🔤 Naming Conventions (MUST MATCH)

### Database (snake_case)
```sql
-- Table names
restaurants, orders, order_items, payments, seats
restaurant_tables, restaurant_menu_items, promos, events
app_fees, restaurant_fees, restaurant_analytics

-- Column names
restaurant_id, table_id, order_id, customer_id
kitchen_status, bar_status, foh_request_status
kitchen_picked_up_at, kitchen_delivered_at
created_at, updated_at, wait_time, sort_order
```

### TypeScript/JavaScript (camelCase)
```typescript
// Type definitions (src/types/index.ts)
interface Restaurant {
  id: string;
  slug?: string;
  name: string;
  address: string;
  hours: { open: string; close: string };
  waitTime: number;  // wait_time in DB
  distance: number;
}

interface Table {
  id: string;
  number: number;
  label?: string;
  seats: number;
  location: 'patio' | 'window' | 'balcony' | 'middle' | 'secondFloor';
  x: number;
  y: number;
}

interface MenuItem {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  price: number;
  category: string;
  image: string;
}

type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ar' | 'zh';
```

---

## 📊 Existing API Endpoints (MUST USE)

### Restaurant APIs (`src/api/restaurantsApi.ts`)
```typescript
getRestaurantBySlug(slug: string): Promise<Restaurant | null>
getRestaurantById(id: string): Promise<Restaurant | null>
getAllRestaurants(): Promise<Restaurant[]>
getRestaurantTables(restaurantId: string): Promise<Table[]>
getRestaurantMenu(restaurantId: string): Promise<{ food: MenuItem[]; drinks: MenuItem[] }>
getCompleteRestaurant(identifier: string): Promise<Restaurant | null>
```

### Order APIs (`src/api/ordersApi.ts`)
```typescript
fetchOpenOrders(): Promise<OrderRow[]>
fetchOrderItemsForOrders(orderIds: string[]): Promise<Map<string, OrderItemRow[]>>
fetchOpenOrdersWithItems(): Promise<OrderWithItems[]>
subscribeToOrders(onChange: (payload) => void, restaurantId?: string): Unsubscribe
createOrderWithItems(input: NewOrderInput): Promise<OrderRow>
updateOrderStatus(orderId: string, status: OrderStatus): void
updateOrderStationStatus(orderId: string, station: StationKey, status: ProductionStatus): void
markStationPickedUp(orderId: string, station: Exclude<StationKey, 'server'>): void
markStationDelivered(orderId: string, station: StationKey): void
```

### Payment APIs (`src/api/paymentsApi.ts`)
```typescript
createPaymentRecord(params): Promise<PaymentRecord>
updatePaymentStatus(paymentId: string, status: PaymentStatus): void
getPaymentRecord(paymentId: string): Promise<PaymentRecord | null>
listPaymentsForOrder(orderId: string): Promise<PaymentRecord[]>
```

### Menu APIs (`src/api/restaurantMenuApi.ts`)
```typescript
fetchRestaurantMenuItems(restaurantId: string): Promise<RestaurantMenuItemRow[]>
upsertRestaurantMenuItems(rows: RestaurantMenuItemRow[]): void
```

### Floor Plan APIs (`src/api/restaurantFloorPlanApi.ts`)
```typescript
fetchRestaurantFloorPlan(restaurantId: string): Promise<RestaurantFloorPlanRow | null>
upsertRestaurantFloorPlan(row: RestaurantFloorPlanRow): void
```

### Promos & Events APIs (`src/api/promosEventsApi.ts`)
```typescript
fetchRestaurantPromos(restaurantId: string): Promise<PromoRow[]>
fetchRestaurantEvents(restaurantId: string): Promise<EventRow[]>
upsertRestaurantPromos(promos: PromoRow[]): void
upsertRestaurantEvents(events: EventRow[]): void
deletePromo(promoId: string): void
deleteEvent(eventId: string): void
```

---

## 🔒 Existing RLS Policies

### Policy Rules (MUST PRESERVE)
```sql
-- Public read access (no authentication required)
restaurants: SELECT USING (true)
restaurant_menu_items: SELECT USING (is_active = true)
restaurant_tables: SELECT USING (true)
promos: SELECT USING (is_active = true)
events: SELECT USING (is_active = true)

-- Authenticated users (restaurant owners/staff)
All tables: ALL USING (auth.role() = 'authenticated')

-- Service role (full access)
All tables: ALL USING (auth.role() = 'service_role')
```

---

## ❌ MISSING: New Tables Required

### 1. `customer_profiles` - Customer account management
```sql
CREATE TABLE customer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  email TEXT,
  preferred_language Language DEFAULT 'en',
  device_token TEXT, -- For push notifications
  default_payment_method TEXT, -- 'card', 'digital', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. `customer_location_history` - Location tracking
```sql
CREATE TABLE customer_location_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2), -- in meters
  distance_to_restaurant DECIMAL(10, 2), -- calculated distance
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  event_type TEXT DEFAULT 'background_update' CHECK (event_type IN ('background_update', 'order_placed', 'order_charged', 'geofence_exit'))
);
```

### 3. `outside_orders` - Tracking orders placed outside restaurant
```sql
CREATE TABLE outside_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
  distance_at_order DECIMAL(10, 2), -- meters from restaurant
  distance_threshold_meters DECIMAL(10, 2) DEFAULT 100, -- when to auto-charge
  auto_charge_enabled BOOLEAN DEFAULT true,
  charged_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'charging', 'charged', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. `table_shares` - Multi-device table sharing
```sql
CREATE TABLE table_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES restaurant_tables(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  seat_id UUID REFERENCES seats(id) ON DELETE SET NULL,
  device_id TEXT NOT NULL, -- Unique device identifier
  is_primary_device BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'removed'))
);
```

### 5. `togo_orders` - To-go order tracking
```sql
CREATE TABLE togo_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
  customer_name TEXT, -- For guests without account
  pickup_confirmed BOOLEAN DEFAULT false,
  pickup_confirmed_at TIMESTAMPTZ,
  qr_code_data TEXT UNIQUE, -- Unique QR code for pickup confirmation
  estimated_pickup_time TIMESTAMPTZ,
  actual_pickup_time TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'picked_up', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. `staff_roles` - Staff authentication and roles
```sql
CREATE TABLE staff_roles (
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
```

### 7. `table_move_requests` - Table transfer requests
```sql
CREATE TABLE table_move_requests (
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
```

### 8. `order_sync_groups` - Coordinating multi-device orders
```sql
CREATE TABLE order_sync_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES restaurant_tables(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sync_token TEXT UNIQUE, -- Token for group coordination
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'submitting', 'submitted', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ
);

CREATE TABLE order_sync_participants (
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

## ❌ MISSING: New Columns in Existing Tables

### `restaurants` table additions
```sql
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Monterrey';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'MXN';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5, 2) DEFAULT 16.00;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS service_fee_percent DECIMAL(5, 2) DEFAULT 0.00;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS auto_close_minutes INTEGER DEFAULT 3; -- Post-payment latency
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11, 8);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS geofence_radius_meters DECIMAL(10, 2) DEFAULT 100;
```

### `orders` table additions
```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customer_profiles(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_outside_order BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_togo_order BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_ready_time TIMESTAMPTZ;
```

### `seats` table additions
```sql
ALTER TABLE seats ADD COLUMN IF NOT EXISTS seat_position INTEGER; -- Position at table (1, 2, 3...)
ALTER TABLE seats ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customer_profiles(id);
ALTER TABLE seats ADD COLUMN IF NOT EXISTS is_primary_seat BOOLEAN DEFAULT false;
```

### `payments` table additions
```sql
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'digital', 'auto_charge', 'external_terminal'));
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS tip_amount DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS tip_allocation JSONB DEFAULT '{}'; -- {service: 50, kitchen: 50}
```

---

## 🗣️ Language Support (Already Implemented)

### Supported Languages (7 total)
```typescript
type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ar' | 'zh';
```

### JSONB Localization Pattern (ALREADY IN USE)
```sql
-- Database storage
name JSONB DEFAULT '{"en": "", "es": "", "fr": "", "de": "", "ja": "", "ar": "", "zh": ""}'::jsonb

-- TypeScript usage
interface MenuItem {
  name: Record<Language, string>;
  description: Record<Language, string>;
}
```

### Translation Files
- [`src/utils/translations.ts`](src/utils/translations.ts) - Complete translations for all 7 languages
- Customer-facing: All 7 languages
- Staff-facing: **Spanish only** (es)

---

## 🔄 Workflow Mapping

### Customer Workflow → Database Tables

| Step | Screen/Action | Tables Used |
|------|---------------|-------------|
| 1. App Launch | Welcome, name entry | `customer_profiles` (temp) |
| 2. QR Scan | Restaurant detection | `restaurants` |
| 3. Restaurant View | Info, promos, events | `restaurants`, `promos`, `events` |
| 4. Table Selection | Floor plan, seat selection | `restaurant_tables`, `seats`, `table_shares` |
| 5. Menu Browse | View menu items | `restaurant_menu_items` |
| 6. Order Drinks | Outside order (optional) | `orders`, `order_items`, `outside_orders` |
| 7. Table Ready | Notification | Real-time via Supabase |
| 8. Order Food | Add to order | `orders`, `order_items`, `seats` |
| 9. Multi-device | Sync group | `order_sync_groups`, `order_sync_participants` |
| 10. Payment | Split bill, pay | `payments`, `seats` |
| 11. Close | Auto-clean timer | `restaurant_analytics` |

### Staff Workflow → Database Tables

| Role | View | Tables Used |
|------|------|-------------|
| Kitchen | Rail view | `orders`, `order_items`, `restaurant_menu_items` |
| Bar | Rail view | `orders`, `order_items`, `restaurant_menu_items` |
| FOH | Floor plan | `restaurant_tables`, `orders`, `table_move_requests` |
| Manager | Analytics, editing | All tables, `restaurant_analytics` |
| Operator | Platform overview | `app_fees`, `restaurant_fees`, aggregated analytics |

---

## ⚠️ Migration Checklist

### Before New App Deployment

1. **Run pending migrations**
   ```bash
   sql-remove-available-column.sql
   ```

2. **Create new tables**
   - `customer_profiles`
   - `customer_location_history`
   - `outside_orders`
   - `table_shares`
   - `togo_orders`
   - `staff_roles`
   - `table_move_requests`
   - `order_sync_groups`
   - `order_sync_participants`

3. **Add new columns**
   - All columns listed in "MISSING: New Columns in Existing Tables"

4. **Update RLS policies**
   - Add policies for new tables
   - Ensure `customer_profiles` allows owner access only

5. **Enable Realtime**
   - Subscribe to `orders`, `order_items`, `payments` changes
   - Subscribe to `customer_location_history` for geofencing

---

## 📱 Feature-to-Table Matrix

| Feature | Primary Tables | Secondary Tables |
|---------|---------------|------------------|
| Multi-language UI | `restaurant_menu_items`, `promos`, `events` | - |
| Location tracking | `customer_location_history` | `restaurants` |
| Outside orders | `orders`, `outside_orders` | `customer_location_history` |
| Multi-device table | `table_shares`, `seats`, `order_sync_groups` | `orders`, `restaurant_tables` |
| To-go orders | `togo_orders` | `orders`, `order_items` |
| Bill splitting | `seats`, `payments` | `order_items` |
| Staff roles | `staff_roles` | `auth.users` |
| Table transfer | `table_move_requests` | `orders`, `restaurant_tables` |
| Manager analytics | `restaurant_analytics` | All order/payment tables |
| Operator platform | `app_fees`, `restaurant_fees` | All aggregated data |

---

## 🔑 Critical Integration Points

### Supabase Realtime Subscriptions (MUST USE)
```typescript
// Subscribe to order changes
subscribeToOrders(onChange, restaurantId);

// Subscribe to payment changes (for bill updates)
// Subscribe to location updates (for geofencing)
```

### Stripe Integration
```typescript
// Payment methods supported
type PaymentMethod = 'card' | 'digital' | 'cash' | 'external_terminal';

// Digital payments use Stripe
createPaymentRecord({ orderId, amount, currency: 'MXN', metadata: { method: 'card' } });
```

### Push Notifications
```typescript
// Device token stored in customer_profiles.device_token
// Send via Supabase or external service (FCM/APNs)
```

---

## ✅ Compatibility Confirmation

The existing Supabase schema is **compatible** with the new app requirements with the addition of:
- **8 new tables**
- **12 new columns**
- **Updated RLS policies**

All existing tables and columns should be preserved. The new app can be built on top of the existing foundation without breaking current functionality.
