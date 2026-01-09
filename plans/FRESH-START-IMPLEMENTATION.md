# Fresh Start: QR Restaurant App Implementation Plan

## Overview

Create a completely new, clean React restaurant app with Supabase backend. No legacy code, no migration issues, just fresh implementation.

---

## 1. New Project Setup

### 1.1 Create New Project Directory

```bash
# Create new project folder (outside the old one)
mkdir -p ~/Projects/restaurant-qr-app
cd ~/Projects/restaurant-qr-app
```

### 1.2 Initialize React + Vite + TypeScript

```bash
# Create Vite React TypeScript app
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install
npm install @supabase/supabase-js react-router-dom lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 1.3 Folder Structure

```
restaurant-qr-app/
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # Base UI components
│   │   ├── customer/    # Customer-facing screens
│   │   └── staff/       # Staff-facing screens
│   ├── lib/             # Utilities & configs
│   │   ├── supabase.ts  # Supabase client
│   │   └── constants.ts # App constants
│   ├── types/           # TypeScript types
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── services/        # API services
│   └── App.tsx          # Root component
├── sql/                  # Database scripts
│   └── schema.sql       # Canonical schema
├── .env                  # Environment variables
├── package.json
└── README.md
```

---

## 2. Database Schema (sql/schema.sql)

```sql
-- Clean canonical schema with UUID primary keys

-- Restaurants
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    address TEXT,
    phone TEXT,
    hours TEXT,
    timezone TEXT DEFAULT 'America/Monterrey',
    currency TEXT DEFAULT 'MXN',
    tax_rate DECIMAL(5,2) DEFAULT 16.00,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tables
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number INTEGER NOT NULL,
    display_name TEXT,
    seats INTEGER DEFAULT 4,
    location TEXT DEFAULT 'main',
    x DECIMAL(10,2) DEFAULT 0,
    y DECIMAL(10,2) DEFAULT 0,
    qr_code TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(restaurant_id, table_number)
);

-- Menu Items
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('food', 'drink')),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUBMITTED', 'PREPARING', 'READY', 'DELIVERED', 'COMPLETED', 'CANCELLED')),
    total_amount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    item_name TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PREPARING', 'READY', 'DELIVERED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('cash', 'card', 'digital')),
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
```

---

## 3. Implementation Phases

### Phase 1: Project Foundation
- [ ] Create new React + Vite project
- [ ] Setup Tailwind CSS
- [ ] Configure Supabase client
- [ ] Create basic routing

### Phase 2: Database Integration
- [ ] Run schema.sql in Supabase
- [ ] Create seed data (2 restaurants, tables, menu items)
- [ ] Create API service functions
- [ ] Test CRUD operations

### Phase 3: Customer App
- [ ] QR Scanner / URL parser
- [ ] Restaurant info screen
- [ ] Menu display (categorized)
- [ ] Cart / order creation
- [ ] Order status screen

### Phase 4: Payment Flow
- [ ] Cart total calculation
- [ ] Payment UI
- [ ] Payment processing
- [ ] Order completion

### Phase 5: Staff Features (Optional)
- [ ] Order management dashboard
- [ ] Kitchen display
- [ ] Table management

---

## 4. Key Files to Create

### 4.1 Supabase Client (src/lib/supabase.ts)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### 4.2 Database Service (src/services/db.ts)

```typescript
import { supabase } from '../lib/supabase'

// Get restaurant by slug
export async function getRestaurantBySlug(slug: string) {
  return supabase
    .from('restaurants')
    .select('*, tables(*, menu_items:menu_items(*)')
    .eq('slug', slug)
    .single()
}

// Create order
export async function createOrder(orderData: any) {
  return supabase.from('orders').insert(orderData).select().single()
}

// Get order by ID
export async function getOrderById(orderId: string) {
  return supabase
    .from('orders')
    .select('*, items:order_items(*), table:tables(*)')
    .eq('id', orderId)
    .single()
}
```

---

## 5. Quick Start Commands

```bash
# 1. Create new project
cd ~/Projects
npm create vite@latest restaurant-qr-app -- --template react-ts
cd restaurant-qr-app

# 2. Install dependencies
npm install @supabase/supabase-js react-router-dom lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3. Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Run database setup
# Copy sql/schema.sql content to Supabase SQL Editor

# 5. Start development
npm run dev
```

---

## 6. Testing Checklist

- [ ] QR code scans correctly and loads restaurant
- [ ] Menu items display properly
- [ ] Can add items to cart
- [ ] Can place order
- [ ] Order appears in system
- [ ] Payment flow works
- [ ] Order completes successfully

---

## 7. Supabase Setup Steps

1. Create new Supabase project at supabase.com
2. Go to SQL Editor
3. Copy content from `sql/schema.sql`
4. Run the script
5. Copy project URL and anon key to `.env`

---

**Status:** Ready to implement  
**Next:** Start Phase 1 - Create new project
