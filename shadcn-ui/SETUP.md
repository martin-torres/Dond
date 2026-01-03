# Restaurant QR Code App - Setup Guide

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env` file in the root directory with your Supabase credentials:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**How to get Supabase credentials:**
1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to Project Settings > API
4. Copy the "Project URL" as `VITE_SUPABASE_URL`
5. Copy the "anon public" key as `VITE_SUPABASE_ANON_KEY`

### 2. Database Schema Setup

Run the following SQL in your Supabase SQL Editor to create all required tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name JSONB NOT NULL,
  address JSONB NOT NULL,
  hours JSONB NOT NULL DEFAULT '{"open": "9:00 AM", "close": "10:00 PM"}'::jsonb,
  wait_time INTEGER DEFAULT 30,
  distance NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurant tables
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  seats INTEGER NOT NULL,
  location TEXT DEFAULT 'middle',
  available BOOLEAN DEFAULT true,
  visible_to_customers BOOLEAN DEFAULT true,
  x NUMERIC DEFAULT 0,
  y NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items
CREATE TABLE IF NOT EXISTS restaurant_menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name JSONB NOT NULL,
  description JSONB,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('food', 'drink')),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  table_number INTEGER,
  customer_name TEXT,
  note TEXT,
  order_type TEXT DEFAULT 'dine-in',
  status TEXT DEFAULT 'pending',
  language TEXT DEFAULT 'es',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES restaurant_menu_items(id) ON DELETE CASCADE,
  table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promotions
CREATE TABLE IF NOT EXISTS restaurant_promos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  title JSONB NOT NULL,
  description JSONB,
  discount_percent NUMERIC DEFAULT 0,
  image_url TEXT,
  menu_item_id UUID REFERENCES restaurant_menu_items(id) ON DELETE SET NULL,
  menu_category TEXT,
  is_active BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events
CREATE TABLE IF NOT EXISTS restaurant_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  title JSONB NOT NULL,
  description JSONB,
  image_url TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'PENDING',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_restaurant_id ON restaurant_tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON restaurant_menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_table_id ON order_items(table_id);
CREATE INDEX IF NOT EXISTS idx_promos_restaurant_id ON restaurant_promos(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_events_restaurant_id ON restaurant_events(restaurant_id);
```

### 3. Seed Sample Data (Optional)

Insert sample restaurant data:

```sql
-- Insert sample restaurant
INSERT INTO restaurants (slug, name, address, hours, wait_time, distance)
VALUES (
  'rupestre',
  '{"en": "Rupestre", "es": "Rupestre"}'::jsonb,
  '{"en": "Barrio Antiguo, Monterrey", "es": "Barrio Antiguo, Monterrey"}'::jsonb,
  '{"open": "12:00 PM", "close": "11:00 PM"}'::jsonb,
  30,
  0
);

-- Get the restaurant ID (replace with actual ID after insert)
-- Then insert tables, menu items, etc.
```

### 4. Install Dependencies & Run

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev
```

## 📱 Features Implemented

### Customer App
- ✅ QR code scanning
- ✅ Restaurant information display
- ✅ Table selection
- ✅ Menu browsing (Food & Drinks)
- ✅ Order placement
- ✅ Bill payment with multiple options:
  - Pay full amount
  - Split evenly
  - Split by items
  - **Cash payment option**
  - **Card payment option**
- ✅ Tip allocation (Service vs Kitchen)
- ✅ Service request system (Bell icon)
- ✅ Multi-language support (EN, ES, FR, DE, JA, AR, ZH)
- ✅ **Mobile-optimized for 50-70 age group**:
  - Larger fonts (16px+ base)
  - Better spacing
  - Larger touch targets (48px minimum)
  - High contrast mode support

### Staff Dashboard
- ✅ Kitchen View - Order management for chefs
- ✅ Bar View - Drink order management
- ✅ FOH View - Front of house operations
- ✅ Manager Console - Full restaurant management
- ✅ Owner Dashboard - Multi-restaurant analytics
- ✅ Real-time order updates via Supabase subscriptions

### Backend Integration
- ✅ **All mock data removed**
- ✅ **Real Supabase database integration**
- ✅ Real-time subscriptions for:
  - Order status updates
  - Table availability
  - Delivered items tracking
- ✅ API layer for all CRUD operations

## 🎨 Mobile Responsiveness

The app is optimized for older users (50-70 age group):

- **Typography**: Minimum 16px font size on mobile
- **Touch Targets**: Minimum 48px height for all interactive elements
- **Spacing**: Increased padding and margins for better readability
- **Contrast**: High contrast mode support
- **Motion**: Respects prefers-reduced-motion
- **Line Height**: 1.6 for better readability

## 🔐 Security Notes

- Never commit `.env` file to version control
- Use environment variables for all sensitive data
- Supabase Row Level Security (RLS) should be configured for production
- The `anon` key is safe for client-side use

## 📚 Documentation

- Supabase Docs: https://supabase.com/docs
- React Docs: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- shadcn/ui: https://ui.shadcn.com

## 🚀 Deployment

### Deploy to Vercel/Netlify

1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Add environment variables in deployment settings
4. Deploy!

### Environment Variables for Production

```bash
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

## 🐛 Troubleshooting

### "Supabase URL or anon key is missing"
- Check that `.env` file exists in root directory
- Verify environment variable names match exactly
- Restart dev server after creating `.env`

### Database connection errors
- Verify Supabase project is active
- Check API keys are correct
- Ensure database tables are created

### Build errors
- Run `pnpm install` to ensure all dependencies are installed
- Clear node_modules and reinstall if needed
- Check for TypeScript errors with `pnpm run lint`

## 📞 Support

For issues or questions, check:
- Supabase Dashboard for database errors
- Browser console for client-side errors
- Network tab for API request failures