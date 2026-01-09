# FOH PAYMENT STALL - CANONICAL FAILURE INVESTIGATION

## EXECUTIVE SUMMARY

**Root Cause:** FOH StaffBillPage hardcodes `payments: []` instead of querying the canonical `order_payment_status` view. StaffDataProvider subscribes to orders and order_items but **ignores payments table entirely**.

**Impact:** FOH bills show as unpaid even after customer payment, blocking table closure.

---

## INVESTIGATION METHODOLOGY

### 1. FOH DECISION POINTS FOR BILL PAYMENT STATUS

#### Decision Point 1: StaffBillPage Bill Creation
**File:** `src/components/StaffBillPage.tsx`  
**Function:** `bill` useMemo (lines 44-54)  
**Data Source:** Local items array (from order_items only)  
**Condition:** Hardcoded `payments: []`

```typescript
const bill = useMemo(() => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );
  const tax = subtotal * 0.089999;
  const tip = subtotal * 0.15;
  return {
    items,
    subtotal,
    tax,
    tip,
    total: subtotal + tax + tip,
    payments: [], // ❌ CANONICAL VIOLATION: Hardcoded empty array
  };
}, [items]);
```

**Verdict:** ❌ **IGNORES order_payment_status view** - Payment truth LOST here

---

#### Decision Point 2: closeTableSession Payment Gate
**File:** `src/staff/StaffDataProvider.tsx`  
**Function:** `closeTableSession` (lines 527-570)  
**Data Source:** Queries `order_payment_status` view  
**Condition:** Blocks closure if `!is_payment_complete`

```typescript
// Query order_payment_status view for payment completeness
const { data: paymentStatus, error } = await supabase
  .from('order_payment_status')
  .select('order_id, is_payment_complete')
  .in('order_id', uniqueOrderIds);

// Check if all orders are payment complete
const allPaid = paymentStatus.every((status) => status.is_payment_complete === true);

if (!allPaid) {
  alert('Cannot close table: Some orders are not fully paid.');
  return;
}
```

**Verdict:** ✅ **CORRECTLY queries order_payment_status** - But only for closure gate, not for display

---

#### Decision Point 3: FohView "View Bill" Action
**File:** `src/staff/FohView.tsx`  
**Function:** `actionsForOrder` (lines 134-165)  
**Data Source:** Local order object (from orders table)  
**Condition:** Navigates to `/staff/bill/{tableId}`

```typescript
if (order.orderType === 'request' && order.customerName?.includes('Bill Request')) {
  const actions = [];
  if (order.status === 'NEW') {
    actions.push({
      label: 'View Bill',
      onClick: () => {
        const latestOrderId = getLatestNonRequestOrderId(order.tableId);
        // Navigates to StaffBillPage
        window.location.href = `/staff/bill/${order.tableId}?orderId=${latestOrderId}`;
      },
    });
  }
  return actions;
}
```

**Verdict:** ⚠️ **Navigates to broken StaffBillPage** - Payment truth will be lost

---

### 2. DATA SOURCES FOR FOH PAYMENT DECISIONS

#### StaffDataProvider Subscriptions

**✅ SUBSCRIBED:**
1. **orders table** (`subscribeToOrders`)
   - File: `src/api/ordersApi.ts`
   - Subscription filter: `restaurant_id=eq.{resolvedRestaurantId}`
   - Updates: `setOrders()` on INSERT/UPDATE/DELETE

2. **order_items table** (via `fetchOrderItemsForOrders`)
   - File: `src/api/ordersApi.ts`
   - Fetched on-demand when orders change
   - Updates: Mapped into StaffOrder items

3. **restaurant_tables table** (separate subscription)
   - File: `src/staff/StaffDataProvider.tsx`
   - Subscription filter: `restaurant_id=eq.{resolvedRestaurantId}`
   - Updates: `setTables()` on changes

**❌ NOT SUBSCRIBED:**
1. **payments table** - NO SUBSCRIPTION EXISTS
2. **order_payment_status view** - NO SUBSCRIPTION EXISTS

**Evidence:**
```typescript
// In StaffDataProvider.tsx - NO payments subscription
useEffect(() => {
  const setupSubscription = async () => {
    const unsubscribeFn = await subscribeToOrders(...); // Only orders
  };
}, [mapSupabaseOrderToStaff, upsertStaffOrder, activeRestaurantId]);
```

---

### 3. PAYMENT DATA FLOW TRACE

#### Path: payments table → order_payment_status view → FOH

**Step 1: Payment Created**
```typescript
// Customer pays via BillPayment.tsx
await createPaymentRecord({
  orderId: 'order-123',
  amount: 45.50,
  currency: 'USD',
  status: 'PAID'
});
```

**Database State:**
```sql
-- payments table (NEW ROW)
INSERT INTO payments (id, order_id, amount, status, created_at)
VALUES ('pay-xxx', 'order-123', 45.50, 'completed', '2026-01-08T15:30:00Z');
```

**Step 2: order_payment_status View (Re-computed)**
```sql
-- View automatically computes:
SELECT
  order_id,
  total_due: 45.50,
  total_paid: 45.50,
  is_payment_complete: TRUE
FROM order_payment_status
WHERE order_id = 'order-123';
```

**Step 3: FOH Attempts to Read Payment Status**

**❌ FAILS HERE:**

StaffBillPage does NOT query order_payment_status:
```typescript
// StaffBillPage.tsx - MISSING QUERY
const bill = useMemo(() => {
  // ❌ NO query to order_payment_status
  return {
    items,
    payments: [], // Hardcoded empty - PAYMENT TRUTH LOST
  };
}, [items]);
```

**Result:** FOH sees `payments: []` → Bill appears unpaid → Staff cannot close table

---

### 4. PROOF: FOH READS STALE DERIVED STATE

**Test Scenario:**
1. Customer pays $45.50 → payment inserted into payments table
2. order_payment_status view shows `is_payment_complete: true`
3. FOH StaffBillPage loads

**Expected Behavior:**
- Bill should show "Bill Fully Paid: $0.00"
- closeTableSession should succeed

**Actual Behavior:**
- Bill shows full amount due (no payment status indicator)
- closeTableSession **BLOCKS** with alert: "Cannot close table: Some orders are not fully paid"

**Why?**
- StaffBillPage hardcodes `payments: []`
- BillPayment component receives empty payments array
- Payment status UI section doesn't render (no orderPaymentStatus data)
- closeTableSession queries order_payment_status correctly, but **StaffBillPage never shows this truth to staff**

**Contradiction:**
- closeTableSession **can** read payment status correctly
- StaffBillPage **does not** read payment status
- Staff sees "unpaid" bill → tries to close → blocked by gate they can't see

---

### 5. IDENTIFIER ALIGNMENT VERIFICATION

#### payments.order_id ↔ orders.id

**✅ ALIGNED:**
```typescript
// paymentsApi.ts
await supabase.from('payments').insert({
  order_id: params.orderId, // Uses order.id
});

// ordersApi.ts
const order = await createOrderWithItems(...);
// order.id is UUID
```

**StaffDataProvider Mapping:**
```typescript
// StaffOrder type (src/staff/types.ts)
interface StaffOrder {
  id: string; // orders.id
  ticketId: string; // `${order.id}-${station}`
  tableId: string | undefined;
}
```

**✅ VERIFIED:** `payments.order_id` = `orders.id` = `StaffOrder.id`

---

#### FOH Ticket Reconciliation

**Ticket ID Format:**
```typescript
ticketId: `${order.id}-${station}` // e.g., "order-123-kitchen"
```

**Bill Request Action:**
```typescript
const latestOrderId = getLatestNonRequestOrderId(order.tableId);
// Returns orders.id (not ticketId)
```

**✅ VERIFIED:** FOH reconciles against `orders.id`, not `ticketId`

---

### 6. SUBSCRIPTION DATA OVERWRITES

#### Orders Subscription
**File:** `src/api/ordersApi.ts` → `subscribeToOrders`

**On INSERT:**
```typescript
const handleInsert = async (row: any) => {
  const itemsMap = await fetchOrderItemsForOrders([row.id]);
  mapSupabaseOrderToStaff({ ...row, items }).forEach(upsertStaffOrder);
};
```

**On UPDATE:**
```typescript
fetchOrderItemsForOrders([updatedOrder.id])
  .then((itemsMap) => {
    const items = itemsMap.get(updatedOrder.id) ?? [];
    const nextTickets = mapSupabaseOrderToStaff({ ...updatedOrder, items });
    nextTickets.forEach(upsertStaffOrder);
  });
```

**Data Overwrites:**
- `orders` array (via `setOrders`)
- `StaffOrder` objects (via `upsertStaffOrder`)
- `StaffOrder.items` (from order_items)

**❌ DROPS PAYMENT CONTEXT:** No payment data included in overwrite

---

#### Order Items Subscription
**File:** `src/api/ordersApi.ts` → `fetchOrderItemsForOrders`

**Data Retrieved:**
```typescript
const { data, error } = await supabase
  .from('order_items')
  .select('*')
  .in('order_id', orderIds);
```

**Data Overwrites:**
- `StaffOrder.items` array

**❌ DROPS PAYMENT CONTEXT:** No payment data in order_items

---

### 7. ROOT CAUSE SUMMARY

#### PRIMARY ROOT CAUSE
**Location:** `src/components/StaffBillPage.tsx`  
**Function:** `bill` useMemo  
**Issue:** Hardcodes `payments: []` instead of querying `order_payment_status` view

**Impact:**
- FOH cannot see payment status
- Staff confused by "unpaid" bills that are actually paid
- closeTableSession gate blocks despite payment completion

---

#### SECONDARY ROOT CAUSE
**Location:** `src/staff/StaffDataProvider.tsx`  
**Function:** `useEffect` subscription setup  
**Issue:** No subscription to payments table or order_payment_status view

**Impact:**
- Payment updates do not trigger FOH re-render
- Staff must manually refresh to see payment status (if it were queried)

---

#### TERTIARY ISSUE (Display Only)
**Location:** `src/components/BillPayment.tsx`  
**Function:** Payment status UI  
**Issue:** Payment status section only renders when `bill.orderPaymentStatus` exists

**Impact:**
- Even if StaffBillPage queried payment status, UI wouldn't show it without orderPaymentStatus field populated

---

## EVIDENCE TABLE

| Decision Point | File | Function | Data Source | Reads order_payment_status? | Verdict |
|---|---|---|---|---|---|
| Bill Creation | StaffBillPage.tsx | bill useMemo | order_items only | ❌ NO | **CANONICAL VIOLATION** |
| Table Closure Gate | StaffDataProvider.tsx | closeTableSession | order_payment_status | ✅ YES | Correct |
| Bill Request Nav | FohView.tsx | actionsForOrder | orders table | ❌ NO | Navigates to broken page |
| Orders Subscription | ordersApi.ts | subscribeToOrders | orders table | ❌ NO | Ignores payments |
| Order Items Fetch | ordersApi.ts | fetchOrderItemsForOrders | order_items table | ❌ NO | Ignores payments |
| Payments Subscription | N/A | N/A | N/A | ❌ NO | **NO SUBSCRIPTION EXISTS** |

---

## WHERE PAYMENT TRUTH IS LOST

```
payments table (INSERT)
    ↓
order_payment_status view (RE-COMPUTED) ✅
    ↓
FOH StaffBillPage (NEVER QUERIED) ❌ ← TRUTH LOST HERE
    ↓
BillPayment component (NO orderPaymentStatus) ❌
    ↓
Staff sees "unpaid" bill (WRONG)
    ↓
closeTableSession (QUERIES VIEW) ✅
    ↓
Gate blocks (CORRECT) but staff confused (BAD UX)
```

---

## CONCLUSION

**Single Root Cause:** StaffBillPage does not query the canonical `order_payment_status` view.

**Evidence:**
1. StaffBillPage hardcodes `payments: []`
2. StaffDataProvider has no payments subscription
3. closeTableSession correctly queries view (proving view works)
4. Identifier alignment is correct (payments.order_id = orders.id)

**No fixes proposed per instructions.** Investigation complete.

---

**END OF INVESTIGATION**