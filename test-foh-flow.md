# Test FOH Flow

## 🧪 **Testing the Complete FOH System**

Now that all fixes are implemented, let's test the complete flow.

### **Step 1: Start Development Server**
```bash
npm run dev
```

### **Step 2: Test Basic Order Flow**

1. **Place a Test Order:**
   - Go to customer interface
   - Order 2 Tacos (food) + 2 Beers (drinks)
   - Complete the order

2. **Verify FOH View:**
   - Go to FOH view
   - Should see sidebar auto-open
   - Should see 4 items with blue "NEW" badges
   - Items should be grouped by table

3. **Test Kitchen View:**
   - Go to Kitchen view
   - Should see 2 food items with blue "NEW" badges
   - Click "Start" on tacos → status changes to "IN_PROGRESS"
   - Click "Ready" on tacos → status changes to "READY"

4. **Test Bar View:**
   - Go to Bar view
   - Should see 2 drink items with blue "NEW" badges
   - Click "Start" on beers → status changes to "IN_PROGRESS"
   - Click "Ready" on beers → status changes to "READY"

5. **Test FOH Pickup:**
   - Go back to FOH view
   - Should see all 4 items with green "READY" badges
   - Should see rose "🔴 Pickup" buttons
   - Click "🔴 Pickup" on beers → status changes to "PICKING_UP"
   - Click "🔴 Pickup" on tacos → status changes to "PICKING_UP"
   - Click "Delivered" on all items → items disappear from view

### **Step 3: Test Smart Features**

1. **Auto Sidebar Behavior:**
   - Clear all orders
   - Sidebar should auto-close
   - Place new order
   - Sidebar should auto-open

2. **Single Operator Mode:**
   - Toggle single operator mode ON
   - Place new order
   - In FOH view, click "🔴 Pickup" on items
   - Items should skip to "DELIVERED" immediately

3. **Priority Sorting:**
   - Place multiple orders
   - Verify drinks appear before food
   - Verify READY items appear before IN_PROGRESS

### **Step 4: Test Cross-Restaurant**

1. **Switch Restaurants:**
   - Test with Maui restaurant
   - Test with Los Tacos
   - Test with Las Comidas
   - Verify all work identically

### **Step 5: Test Edge Cases**

1. **Mixed Orders:**
   - Order food + drinks + requests
   - Verify each station sees only their items
   - Verify FOH sees all items

2. **Multiple Tables:**
   - Create orders for different tables
   - Verify items are grouped correctly
   - Verify sidebar shows highest priority first

### **Expected Results:**

✅ **FOH Sidebar:** Auto-opens with work, shows all items  
✅ **Status Badges:** Blue → Yellow → Green → Purple → (removed)  
✅ **Action Buttons:** Rose pickup, green delivered  
✅ **Smart Behavior:** Auto-open/close, priority sorting  
✅ **Single Operator:** Skip steps when enabled  
✅ **Real-time Updates:** Instant changes across all views  
✅ **Multi-Restaurant:** All 6 restaurants work identically  

### **If Something Doesn't Work:**

1. **Check Console:** Look for JavaScript errors
2. **Check Network:** Verify API calls are working
3. **Check Database:** Verify status updates are saved
4. **Check Real-time:** Verify Supabase subscriptions work

### **Success! 🎉**

If all tests pass, your item-level status system is complete and ready for production!

**Key Benefits Delivered:**
- Independent kitchen/bar tracking
- Clear FOH workflow with rose buttons
- Smart sidebar behavior
- Single operator mode for small restaurants
- Works across all 6 restaurants
- Real-time updates
- Beautiful, professional UI
