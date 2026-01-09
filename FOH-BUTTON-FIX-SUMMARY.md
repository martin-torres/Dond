# FOH/Kitchen/Bar Button Fix - Complete ✅

**Date**: 2026-01-08  
**Status**: ✅ FIXED  
**Root Cause**: Station assignment logic for mixed food/drink orders

---

## 🔍 Problem Summary

**Issue**: Buttons were not clickable in FOH view (1-op mode), Kitchen view, and Bar view for certain orders.

**Affected**: All station views (FOH, Kitchen, Bar)

**Symptom**: Orders with mixed food and drink items showed no buttons, making them unactionable.

---

## 🎯 Root Cause Identified

### The Bug: `deriveStation()` Function

**Location**: `src/staff/StaffDataProvider.tsx` (line ~180)

**Original Logic**:
```typescript
const deriveStation = (items: StaffOrderItem[], orderType: OrderType): Station | undefined => {
  if (orderType === 'request') return 'server';
  const hasFoodOnly = items.length > 0 && items.every((item) => item.kind === 'food');
  const hasDrinksOnly = items.length > 0 && items.every((item) => item.kind === 'drink');
  if (hasFoodOnly) return 'kitchen';
  if (hasDrinksOnly) return 'bar';
  return undefined; // ← BUG: Mixed orders returned undefined!
};
```

**Problem**: 
- Used `.every()` to check if ALL items were food or ALL items were drinks
- Mixed food+drink orders returned `undefined` station
- All station views filter by `order.station === 'station_name'`
- Orders with `station: undefined` didn't appear in any view
- FOH 1-op mode returned empty actions array when station was undefined

---

## ✅ Solution Implemented

### Fixed Logic:
```typescript
const deriveStation = (items: StaffOrderItem[], orderType: OrderType): Station | undefined => {
  if (orderType === 'request') return 'server';
  
  const hasFood = items.some((item) => item.kind === 'food');
  const hasDrinks = items.some((item) => item.kind === 'drink');
  
  if (hasFood && !hasDrinks) return 'kitchen';
  if (hasDrinks && !hasFood) return 'bar';
  if (hasFood && hasDrinks) return 'kitchen'; // Mixed orders → kitchen (primary station)
  
  return undefined;
};
```

**Key Changes**:
1. Changed `.every()` to `.some()` - checks if ANY items match
2. Added explicit handling for mixed orders
3. Mixed orders now get `station: 'kitchen'` (primary station)
4. Pure food/drink orders still work correctly

---

## 📊 Impact Analysis

### Before Fix:
- ❌ Mixed food+drink orders: `station: undefined`
- ❌ KitchenView: Didn't show mixed orders (filtered out)
- ❌ BarView: Didn't show mixed orders (filtered out)
- ❌ FohView 1-op: No buttons (empty actions array)

### After Fix:
- ✅ Mixed food+drink orders: `station: 'kitchen'`
- ✅ KitchenView: Shows mixed orders with buttons
- ✅ BarView: Pure drink orders still work correctly
- ✅ FohView 1-op: Shows buttons for all orders

---

## 🧪 Testing Verification

### Test Cases:
1. **Pure Food Order** → `station: 'kitchen'` ✅
2. **Pure Drink Order** → `station: 'bar'` ✅
3. **Mixed Food+Drink Order** → `station: 'kitchen'` ✅ (FIXED!)
4. **Request Order** → `station: 'server'` ✅

### Expected Behavior:
- Mixed orders appear in Kitchen view with "Start" → "Ready" buttons
- Pure drink orders appear in Bar view with "Start" → "Ready" buttons
- FOH 1-op mode shows buttons for all order types
- FOH normal mode shows "Pick up" → "Delivered" for READY orders

---

## 🎓 Canonical Compliance

**✅ Fully Canonical**:
- No database writes (station derived at read-time)
- No UI state storage (station is part of StaffOrder type)
- Truth remains in database (orders table)
- Derived state computed at read-time
- No changes to database schema
- No changes to RLS policies

**File Modified**: `src/staff/StaffDataProvider.tsx` (6 lines changed)

---

## 📝 Related Code

### Station Filtering in Views:

**KitchenView.tsx** (line 18):
```typescript
order.station === 'kitchen' &&  // Now matches mixed orders!
```

**BarView.tsx** (line 18):
```typescript
order.station === 'bar' &&      // Pure drink orders only
```

**FohView.tsx** (1-op mode):
```typescript
// Now has station defined, so buttons show!
```

---

## 🚀 Deployment Notes

**No Migration Required**: This is a client-side logic fix only.

**Restart Required**: Reload the application to pick up the new logic.

**Backward Compatible**: Existing orders will work correctly with the new logic.

---

## 📞 Support

**Questions?** See:
- `src/staff/StaffDataProvider.tsx` - Station assignment logic
- `src/staff/FohView.tsx` - FOH button rendering
- `src/staff/KitchenView.tsx` - Kitchen button rendering
- `src/staff/BarView.tsx` - Bar button rendering

**Issues?** Check browser console for warnings about undefined stations.

---

**Fix Version**: 1.0.0  
**Implemented By**: Cline  
**Date**: 2026-01-08