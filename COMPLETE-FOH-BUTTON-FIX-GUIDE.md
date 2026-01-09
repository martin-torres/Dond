# Complete FOH/Kitchen/Bar Button Fix Guide

**Date**: 2026-01-08  
**Status**: ✅ READY FOR DEPLOYMENT  
**Priority**: 🔴 CRITICAL

---

## 🔍 Problem Summary

**User Report**: "Buttons are still not active in the orders that are still in the system. I cannot move them along the correct flow. All orders are stuck in NEW status in bar and FOH. No kitchen orders visible."

**Root Causes Identified**:
1. ❌ Missing RLS policies for `orders` table (blocks all status updates)
2. ❌ Existing orders have `station: undefined` (old broken logic)
3. ❌ Status determination falls back to wrong values
4. ❌ No error logging when API calls fail

---

## 📋 Complete Fix Checklist

### Phase 1: Database Schema (REQUIRED - Run in Supabase)

#### 1.1 Create RLS Policies for Orders Table
**File**: `sql/canonical/policies/sql-create-orders-rls-policies.sql`

**Action**: Run this SQL in your Supabase dashboard:
```sql
-- Copy the entire content from sql/canonical/policies/sql-create-orders-rls-policies.sql
-- and execute it in Supabase SQL Editor
```

**Why**: Without RLS policies, all status updates are silently blocked. This is the #1 reason buttons don't work.

#### 1.2 Backfill Station Assignments for Existing Orders
**File**: `sql/migrations/sql-backfill-station-assignments.sql`

**Action**: Run this SQL in your Supabase dashboard:
```sql
-- Copy the entire content from sql/migrations/sql-backfill-station-assignments.sql
-- and execute it in Supabase SQL Editor
```

**Why**: Existing orders were created with the old broken `deriveStation()` logic. This fixes their station assignments.

**What it does**:
- Sets `kitchen_status = 'NEW'` for orders with food items
- Sets `bar_status = 'NEW'` for orders with drink items
- Sets `foh_request_status = 'NEW'` for request orders
- Handles mixed food+drink orders correctly

### Phase 2: Code Changes (ALREADY DONE)

#### 2.1 Enhanced Error Logging
**File**: `src/api/ordersApi.ts`

**Status**: ✅ Already updated

**Changes**:
- Added detailed error logging with context (order ID, station, status, column)
- Added success logging to confirm updates work
- Added `.select()` to API calls for better feedback

#### 2.2 Fixed Station Assignment Logic
**File**: `src/staff/StaffDataProvider.tsx`

**Status**: ✅ Already fixed (in previous session)

**Change**: Modified `deriveStation()` to use `.some()` instead of `.every()`:
```typescript
// BEFORE (buggy):
const hasFoodOnly = items.every((item) => item.kind === 'food');  // ALL must be food
const hasDrinksOnly = items.every((item) => item.kind === 'drink'); // ALL must be drinks

// AFTER (fixed):
const hasFood = items.some((item) => item.kind === 'food');  // ANY food
const hasDrinks = items.some((item) => item.kind === 'drink'); // ANY drinks
if (hasFood && hasDrinks) return 'kitchen'; // Mixed → kitchen ✅
```

### Phase 3: Verification (DO THIS AFTER RUNNING SQL)

#### 3.1 Check Browser Console
Open browser DevTools (F12) → Console tab, then click a button.

**Expected**: You should see logs like:
```
Station status updated successfully: {orderId: "...", station: "kitchen", status: "IN_PROGRESS"}
```

**If you see errors**: Check the Network tab for failed requests. The enhanced logging will show exactly what failed.

#### 3.2 Verify Database State
Run this query in Supabase to verify the backfill worked:

```sql
SELECT 
  COUNT(*) as total_orders,
  COUNT(*) FILTER (WHERE kitchen_status IS NOT NULL) as has_kitchen_status,
  COUNT(*) FILTER (WHERE bar_status IS NOT NULL) as has_bar_status,
  COUNT(*) FILTER (WHERE foh_request_status IS NOT NULL) as has_foh_status,
  COUNT(*) FILTER (WHERE kitchen_status IS NULL AND bar_status IS NULL AND foh_request_status IS NULL) as missing_all_status
FROM orders
WHERE status IN ('NEW', 'IN_PROGRESS', 'READY', 'PICKING_UP');
```

**Expected**: `missing_all_status` should be 0.

#### 3.3 Test the Flow
1. **Create a new order** with food items
2. **Go to FOH view** → Select the table
3. **Enable 1-op mode** (top right button "1-op: OFF" → click to turn ON)
4. **Click "Start" button** on the kitchen order
5. **Verify**: Button should change to "Ready"

**If it works**: ✅ Fix is complete!
**If it doesn't**: Check browser console for specific errors.

---

## 🎯 Why This Fix Works

### Before the Fix:
```
User clicks "Start"
  → updateStationStatus(orderId, 'kitchen', 'IN_PROGRESS')
  → Supabase API call
  → ❌ BLOCKED by missing RLS policies
  → Optimistic UI update happens
  → Page reload → changes lost (never persisted)
```

### After the Fix:
```
User clicks "Start"
  → updateStationStatus(orderId, 'kitchen', 'IN_PROGRESS')
  → Supabase API call
  → ✅ ALLOWED by RLS policies
  → Database updated
  → Success logged in console
  → Changes persist across reloads
```

---

## 📊 What Each Fix Addresses

| Fix | Addresses | Impact |
|-----|-----------|--------|
| RLS Policies | Status updates blocked | 🔴 CRITICAL - Enables all updates |
| Station Backfill | Existing orders broken | 🔴 CRITICAL - Fixes current orders |
| Error Logging | Silent failures | 🟡 IMPORTANT - Makes issues visible |
| deriveStation() Fix | New orders broken | ✅ Already fixed |

---

## 🚨 Common Issues and Solutions

### Issue: "Still no buttons after running SQL"
**Solution**:
1. Check if RLS policies were created:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'orders';
   ```
2. Verify station columns exist:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'orders' 
   AND column_name IN ('kitchen_status', 'bar_status', 'foh_request_status');
   ```

### Issue: "Buttons show but clicking does nothing"
**Solution**:
1. Open browser console (F12)
2. Check for JavaScript errors
3. Check Network tab for failed API calls
4. The enhanced logging should show exactly what's failing

### Issue: "Kitchen orders not visible"
**Solution**:
1. Verify the order has food items:
   ```sql
   SELECT * FROM order_items WHERE order_id = 'YOUR_ORDER_ID';
   ```
2. Verify `kitchen_status` is set:
   ```sql
   SELECT kitchen_status FROM orders WHERE id = 'YOUR_ORDER_ID';
   ```
3. If NULL, run the backfill migration again

---

## 📝 Deployment Instructions

### For Production:
1. **Backup your database** (always!)
2. Run `sql-create-orders-rls-policies.sql` in Supabase
3. Run `sql-backfill-station-assignments.sql` in Supabase
4. Deploy the updated code (already done)
5. Test with a new order
6. Verify existing orders work

### For Development:
1. Run the SQL migrations in your dev database
2. Restart your dev server
3. Test the complete flow
4. Check browser console for any issues

---

## ✅ Success Criteria

After applying all fixes, you should be able to:

- [ ] Create a new order with food items
- [ ] See the order appear in FOH view
- [ ] Click "Start" button (in 1-op mode)
- [ ] See status change to "IN_PROGRESS"
- [ ] Click "Ready" button
- [ ] See status change to "READY"
- [ ] Click "Pick Up" button
- [ ] See status change to "PICKING_UP"
- [ ] Click "Delivered" button
- [ ] See status change to "DELIVERED"
- [ ] Refresh page and changes persist

---

## 📞 Support

If you encounter any issues:
1. Check browser console for error messages
2. Verify SQL migrations ran successfully
3. Check database state with verification queries
4. Review the enhanced logging output

**The fixes are complete and ready. Run the SQL migrations to enable button functionality.**