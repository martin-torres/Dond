# Database Setup Instructions for QR Restaurant App

## Quick Setup for QR Scanner

This guide will get your QR scanner (`http://localhost:3000/`) working with real data from Supabase.

### Step 1: Run the Migration Script

Execute this single migration script in your Supabase SQL Editor:

**`sql-migrate-to-uuid.sql`**
- Migrates your existing TEXT-based IDs to UUIDs
- Converts restaurant_menu_items from TEXT to UUID primary keys
- Converts restaurant_tables from TEXT to UUID primary keys
- Creates proper UUID foreign key relationships
- Maintains all existing data while upgrading the architecture

**Important:** This script assumes you have existing data in TEXT format. If your tables are already empty or you want to start fresh, you can skip this migration and use the hybrid scripts instead.

### Step 2: Insert Sample Data (Optional)

If you want to add sample menu items and tables after migration:

**For Menu Items:**
```sql
INSERT INTO restaurant_menu_items (
  id, restaurant_id, kind, category, station, name, description, price, sort_order
) VALUES
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE slug = 'rest-one-maui'),
  'drink', 'Signature Slush', 'bar'::station_type,
  '{"en": "Nalu Wailele", "es": "Nalu Wailele"}',
  '{"en": "Sprite Zero slush with coconut foam", "es": "Granizado de Sprite Zero con espuma de coco"}',
  80.00, 1
);
```

**For Tables:**
```sql
INSERT INTO restaurant_tables (
  id, restaurant_id, display_name, table_number, seats, location, available, x, y
) VALUES
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE slug = 'rest-one-maui'),
  'Table 21', 21, 2, 'patio', true, 8, 8
);
```

### Step 2: Test the QR Scanner

1. Start your app: `npm run dev`
2. Navigate to: `http://localhost:3000/`
3. Click the "Maui" button
4. You should see:
   - Restaurant information screen
   - Table selection with available tables
   - Menu with items from database

### Step 3: Add Your Own Restaurant Data

**To add your restaurant:**

```sql
INSERT INTO restaurants (id, name, address, hours, wait_time, distance) VALUES
(
  'your-restaurant-id',
  '{"en": "Your Restaurant Name", "es": "Nombre de tu Restaurante"}',
  'Your Full Address',
  '{"open": "5:00 PM", "close": "10:00 PM"}',
  15, -- wait time in minutes
  50  -- distance in meters
);
```

**To add your menu items:**

```sql
INSERT INTO restaurant_menu_items (
  restaurant_id, kind, category, station, name, description, price, image_url, sort_order
) VALUES
(
  'your-restaurant-id',
  'drink', -- or 'food'
  'Your Category',
  'bar', -- or 'kitchen', 'foh'
  '{"en": "Item Name", "es": "Nombre del Artículo"}',
  '{"en": "Item Description", "es": "Descripción del Artículo"}',
  99.99,
  'https://your-image-url.jpg',
  1
);
```

**To add your tables:**

```sql
INSERT INTO restaurant_tables (
  restaurant_id, display_name, table_number, seats, location, available, x, y
) VALUES
(
  'your-restaurant-id',
  'Table 1',
  1,
  4,
  'patio', -- or 'window', 'middle', 'balcony', 'secondFloor'
  true,
  10, -- x position for floor plan
  10  -- y position for floor plan
);
```

### Step 4: Update QR Scanner to Use Your Restaurant

Edit `src/components/QRScanner.tsx` line 9:
```typescript
const mauiId = 'your-restaurant-id'; // Change this to your ID
```

Or modify the mock data in `src/data/mockRestaurants.ts` to match your restaurant.

## What These Tables Support

### restaurants
- Basic restaurant information
- Multilingual names
- Operating hours
- Wait time and distance

### restaurant_menu_items  
- Full menu with categories
- Multilingual names and descriptions
- Pricing and images
- Station assignment (kitchen/bar/foh)
- Active/inactive status

### restaurant_tables
- Table layouts for floor plans
- Seating capacity
- Location categories
- Visual positioning (x, y coordinates)
- Availability status

## Next Steps

Once your QR scanner is working with real data, we can implement:

1. **Comprehensive Admin Dashboard** with VSCode-style interface
2. **Data Import System** for Excel/CSV uploads
3. **Fee Management** for restaurant billing
4. **Analytics & Timestamp Tracking** for user behavior
5. **Communication Hub** for restaurant messaging
6. **Enhanced Manager Console** with Supabase integration

## Troubleshooting

If QR scanner doesn't show your data:

1. Check Supabase connection in `.env` file
2. Verify table names match exactly
3. Ensure RLS policies allow public access
4. Check browser console for errors
5. Verify restaurant_id matches in both QRScanner and database

## Security Notes

- All tables have Row Level Security (RLS) enabled
- Public can read active data
- Authenticated users can manage data
- Adjust policies as needed for your security requirements
