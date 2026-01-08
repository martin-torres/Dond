# Test Plan: Item-Level Status System

## 🧪 **Testing the Item-Level Status System**

Now that the migration is complete, let's verify that everything is working correctly.

### **Test 1: Verify Database Structure**

Run this query in your Supabase SQL Editor to verify all components were added:

```sql
-- Check all columns in order_items
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'order_items' 
AND column_name IN ('status', 'assigned_station', 'status_updated_at')
ORDER BY column_name;

-- Check constraints
SELECT constraint_name, check_clause
FROM information_schema.check_constraints 
WHERE table_name = 'order_items'
AND constraint_name IN ('order_items_status_check', 'order_items_station_check');

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'order_items'
AND indexname LIKE '%order_items%';

-- Check functions
SELECT proname, prosrc
FROM pg_proc 
WHERE proname IN ('update_order_item_status_timestamp', 'assign_item_station');

-- Check triggers
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'order_items'
AND trigger_name IN ('order_item_status_updated', 'order_item_assign_station');
```

### **Test 2: Verify Staff Views Load Correctly**

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the staff views:**
   - Go to your staff dashboard
   - Test each view: Kitchen, Bar, FOH
   - Verify no errors in console

### **Test 3: Test Independent Status Tracking**

#### **Scenario: Customer orders 3 Tacos + 3 Beers**

1. **Create a test order** through your customer interface
2. **Go to Kitchen View:**
   - Should show only food items (tacos)
   - Should have "Start" and "Ready" buttons per item
   - Status should be independent of drinks

3. **Go to Bar View:**
   - Should show only drink items (beers)
   - Should have "Start" and "Ready" buttons per item
   - Status should be independent of food

4. **Test Independence:**
   - Mark drinks as "Ready" in Bar View
   - Verify food items in Kitchen View remain unchanged
   - Mark food as "Ready" in Kitchen View
   - Verify drinks remain "Ready"

### **Test 4: Test FOH Pickup Workflow**

1. **Go to FOH View:**
   - Should show items ready for pickup (status = 'READY')
   - Should have rose-colored "🔴 Pickup" buttons
   - Items should be grouped by table

2. **Test Pickup Process:**
   - Click "🔴 Pickup" button for drinks
   - Button should change to green "Delivered"
   - Item status should update to 'PICKING_UP' then 'DELIVERED'

3. **Test Food Pickup:**
   - After food is ready, should see new rose button
   - Click to pickup food
   - Verify both food and drinks show as delivered

### **Test 5: Test Contact Collection Modal**

1. **Test Contact Modal:**
   - Navigate to where contact collection is used
   - Verify beautiful iPhone-level design
   - Test form validation
   - Verify success state

### **Test 6: Test Real-Time Updates**

1. **Open multiple browser tabs:**
   - Tab 1: Kitchen View
   - Tab 2: Bar View  
   - Tab 3: FOH View

2. **Test real-time updates:**
   - Update status in Kitchen View
   - Verify changes appear instantly in other tabs
   - Update status in Bar View
   - Verify FOH View shows pickup notifications

### **Test 7: Test Edge Cases**

1. **Mixed Orders:**
   - Create order with food + drinks + requests
   - Verify each station sees only their items
   - Verify FOH sees all items grouped by table

2. **Multiple Tables:**
   - Create orders for multiple tables
   - Verify items are grouped correctly by table
   - Verify FOH can see all tables with ready items

### **Expected Results:**

✅ **Database Structure:**
- All columns added: `assigned_station`, `status_updated_at`
- All constraints added: status and station check constraints
- All indexes created for performance
- Functions and triggers created

✅ **Staff Views:**
- Kitchen View shows only food items
- Bar View shows only drink items
- FOH View shows pickup notifications with rose buttons
- No console errors

✅ **Independent Tracking:**
- Kitchen and bar work independently
- Status changes in one station don't affect the other
- FOH sees items as they become ready

✅ **Real-Time Updates:**
- Changes appear instantly across all views
- No page refresh needed
- Smooth user experience

✅ **iPhone-Level Design:**
- Beautiful gradients and modern buttons
- Smooth transitions and hover effects
- Professional color schemes

### **Troubleshooting:**

If you encounter issues:

1. **Check console for errors** - Look for JavaScript errors
2. **Verify database structure** - Run the verification queries above
3. **Check Supabase connection** - Ensure your Supabase client is working
4. **Test with simple orders** - Start with basic food/drink orders

### **Success Criteria:**

- [ ] Database structure verified
- [ ] Staff views load without errors
- [ ] Independent status tracking works
- [ ] FOH pickup workflow functions
- [ ] Real-time updates work
- [ ] Contact modal displays correctly
- [ ] iPhone-level design is present

Once all tests pass, your item-level status system is fully operational! 🎉
