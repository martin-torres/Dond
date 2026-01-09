# Phase 2 Implementation Guide - Mirror Writes

## Overview
This document describes the Phase 2 implementation of mirror writes for the restaurant app canonical spec. Phase 2 populates new authoritative structures (seats, payments) in parallel with existing behavior without changing reads, UI, or enforcement.

## Phase 2 Goal
**Start populating new authoritative structures (seats, payments) in parallel with existing behavior.**

### Key Rules (NON-NEGOTIABLE)
1. ✅ Old logic stays active
2. ✅ New logic only mirrors
3. ✅ No UI changes
4. ✅ No deletions
5. ✅ No enforcement
6. ✅ If mirror writes fail, existing behavior must still succeed
7. ✅ No reads from seats or payments yet
8. ✅ No constraints that could block writes

## Database Schema Changes

### 1. Create New Tables
Run the SQL migration script to create the new tables:

```sql
-- Execute this in your Supabase SQL Editor
\i sql-create-seats-and-payments-tables.sql
```

This creates:
- `seats` table: Ephemeral seat attribution for order items
- `payments` table: Immutable payment events as facts
- `order_items.seat_id` column: Links order items to seats

### 2. Tables Structure

#### seats table
```sql
CREATE TABLE seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  seat_name TEXT NOT NULL,
  -- NOTE: seat_number and customer_id are RESERVED for future use
  -- DO NOT write to them in Phase 2. DO NOT use them in logic.
  seat_number INTEGER,
  customer_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- NOTE: No updated_at - seats are not mutated after creation in Phase 2-3
);
```

**IMPORTANT RULES FOR SEATS:**
- ❌ **DO NOT write to `seat_number`** - It's reserved for future use
- ❌ **DO NOT write to `customer_id`** - Seats are NOT customers
- ❌ **DO NOT mutate seats after creation** - No updates in Phase 2-3
- ❌ **DO NOT use seats in logic** - They are ephemeral labels only
- ✅ **DO write only** `order_id` and `seat_name`
- ✅ **DO treat seats as presentation-only** - No semantic meaning yet
#### payments table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payer_customer_id UUID, -- Optional: who paid
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  method VARCHAR(50) NOT NULL CHECK (method IN ('cash', 'card', 'digital', 'auto_charge')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('initiated', 'completed', 'failed')),
  metadata JSONB DEFAULT '{}', -- Store tendered_amount, change_confirmed, processor, transaction_id, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
#### payments table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payer_customer_id UUID, -- Optional: who paid (not required in Phase 2)
  amount DECIMAL(10, 2) NOT NULL,
  -- NOTE: Currency is derived from restaurant.currency at write time.
  -- Do NOT allow per-payment currency divergence unless multi-currency is a real goal.
  method VARCHAR(50) NOT NULL CHECK (method IN ('cash', 'card', 'digital', 'auto_charge')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('initiated', 'completed', 'failed')),
  metadata JSONB DEFAULT '{}', -- Store tendered_amount, change_confirmed, processor, transaction_id, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- NOTE: No updated_at - payments are immutable events
);
```

**IMPORTANT RULES FOR PAYMENTS:**
- ❌ **DO NOT add `currency` column** - Derive from restaurant.currency at write time
- ❌ **DO NOT add `updated_at`** - Payments are immutable events
- ❌ **DO NOT mutate payments** - They are facts, not decisions
- ✅ **DO write only** `order_id`, `amount`, `method`, `status`, `metadata`
- ✅ **DO treat payer_customer_id as optional** - Not required in Phase 2
### 1. Create New Tables
Run the SQL migration script to create the new tables:

```sql
-- Execute this in your Supabase SQL Editor
\i sql-create-seats-and-payments-tables.sql
```

This creates:
- `seats` table: Ephemeral seat attribution for order items
- `payments` table: Immutable payment events as facts
- `order_items.seat_id` column: Links order items to seats
### 1. Create New Tables
Run the SQL migration script to create the new tables:

```sql
-- Execute this in your Supabase SQL Editor
\i sql-create-seats-and-payments-tables.sql
```

This creates:
- `seats` table: Ephemeral seat attribution for order items
- `payments` table: Immutable payment events as facts
- `order_items.seat_id` column: Links order items to seats

**CRITICAL PHASE 2 CONSTRAINTS:**
- 🚫 **RLS is DISABLED** on seats and payments to avoid blocking mirror writes
- 🚫 **seats.customer_id is RESERVED** - do NOT write to it
- 🚫 **seats.seat_number is RESERVED** - do NOT write to it
- 🚫 **payments.currency is OMITTED** - derive from restaurant.currency
- 🚫 **No updated_at columns** - seats and payments are not mutated
## Error Handling

All mirror write functions are **non-blocking**. They follow this pattern:

```typescript
const result = await mirrorSeatCreation(orderId, customerName);

if (!result.success) {
  // Log the error but don't block the user
  console.warn('Mirror write failed (non-blocking):', result.error);
  // Existing behavior continues normally
}

// Existing code continues regardless of mirror success/failure
return order;
```
## Error Handling

All mirror write functions are **non-blocking**. They follow this pattern:

```typescript
const result = await mirrorSeatCreation(orderId, customerName);

if (!result.success) {
  // Log the error but don't block the user
  console.warn('Mirror write failed (non-blocking):', result.error);
  // Existing behavior continues normally
}

// Existing code continues regardless of mirror success/failure
return order;
```

## Critical Phase 2 Constraints

### Database Schema Constraints

#### RLS is DISABLED (Intentionally)
**Why:** Mirror writes might occur from service roles, background jobs, or edge functions.  
**Rule:** RLS will be enabled in Phase 3 when reads become authoritative.  
**Impact:** No access control enforcement during Phase 2.

#### Seats Table Constraints
- ❌ **DO NOT write to `seats.customer_id`** - Reserved for future use
- ❌ **DO NOT write to `seats.seat_number`** - Reserved for future use
- ❌ **DO NOT mutate seats after creation** - No UPDATE statements
- ✅ **DO write only** `order_id` and `seat_name`
- ✅ **DO treat seats as ephemeral labels** - No semantic meaning yet

**Reasoning:** Seats are NOT customers. Seat ↔ customer linking should live in projections, not schema.

#### Payments Table Constraints
- ❌ **DO NOT add `currency` column** - Derive from restaurant.currency at write time
- ❌ **DO NOT add `updated_at`** - Payments are immutable events
- ❌ **DO NOT mutate payments** - They are facts, not decisions
- ✅ **DO write only** `order_id`, `amount`, `method`, `status`, `metadata`
- ✅ **DO treat payer_customer_id as optional** - Not required in Phase 2

**Reasoning:** Currency duplication creates mismatch risk. Payments inherit restaurant currency.
### ❌ DO NOT:
- Read from `payments` table
- Read from `seats` table
- Enforce seat selection in UI
- Remove any legacy fields (e.g., `orders.cash_tendered_amount`)
- Change totals logic
- Change UI based on new tables
- Add constraints that could block writes
- Delete or deprecate existing functionality
### ❌ DO NOT:
- Read from `payments` table
- Read from `seats` table
- Enforce seat selection in UI
- Remove any legacy fields (e.g., `orders.cash_tendered_amount`)
- Change totals logic
- Change UI based on new tables
- Add constraints that could block writes
- Delete or deprecate existing functionality
- **Write to `seats.customer_id`** - It's reserved and unused
- **Write to `seats.seat_number`** - It's reserved and unused
- **Add `payments.currency`** - Derive from restaurant instead
- **Enable RLS on seats/payments** - Wait until Phase 3
- **Mutate seats after creation** - No updates in Phase 2-3
- **Mutate payments** - They are immutable events
### Troubleshooting

#### Mirror writes are failing
Check:
1. Database tables exist (`seats`, `payments`)
2. `order_items.seat_id` column exists
3. RLS policies allow authenticated users to write
4. Network connection to Supabase is working
5. Logs show specific error messages
### Troubleshooting

#### Mirror writes are failing
Check:
1. Database tables exist (`seats`, `payments`)
2. `order_items.seat_id` column exists
3. **RLS is DISABLED** (not enabled) - Phase 2 requirement
4. Network connection to Supabase is working
5. Logs show specific error messages
6. **Not writing to reserved fields** (seats.customer_id, seats.seat_number)
7. **Not adding payments.currency** - derive from restaurant instead

#### RLS blocking writes
**Symptom:** Mirror writes succeed in development but fail in production  
**Cause:** RLS policies are too restrictive for service roles  
**Fix:** Keep RLS disabled on seats and payments until Phase 3

#### Data inconsistency
**Symptom:** Seats or payments have unexpected values  
**Cause:** Writing to reserved fields or adding unnecessary columns  
**Fix:** Only write to documented fields, omit reserved fields

#### payments table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payer_customer_id UUID, -- Optional: who paid
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  method VARCHAR(50) NOT NULL CHECK (method IN ('cash', 'card', 'digital', 'auto_charge')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('initiated', 'completed', 'failed')),
  metadata JSONB DEFAULT '{}', -- Store tendered_amount, change_confirmed, processor, transaction_id, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Functions

### Mirror Writes API (`src/api/mirrorWritesApi.ts`)

#### 2.1 Mirror Seat Creation
```typescript
import { mirrorSeatCreation } from '../api/mirrorWritesApi';

// Creates seats only if none exist yet for this order
const result = await mirrorSeatCreation(orderId, customerName);
// Returns: { success: boolean; seat?: SeatRow; error?: string }
```

#### 2.2 Mirror Seat Assignment
```typescript
import { mirrorSeatAssignment } from '../api/mirrorWritesApi';

// Assigns order_items.seat_id to default seat
const result = await mirrorSeatAssignment(orderId, orderItemIds);
// Returns: { success: boolean; assigned: number; errors: string[] }
```

#### 2.3 Mirror Cash Payments
```typescript
import { mirrorCashPayment } from '../api/mirrorWritesApi';

// Mirrors cash payments to payments table
const result = await mirrorCashPayment({
  orderId: '...',
  amount: 50.00,
  tenderedAmount: 60.00,
  changeConfirmed: true,
  payerCustomerId: '...'
});
// Returns: { success: boolean; payment?: PaymentRow; error?: string }
```

#### 2.4 Mirror Card/Digital Payments
```typescript
import { mirrorCardDigitalPayment } from '../api/mirrorWritesApi';

// Mirrors card or digital payments
const result = await mirrorCardDigitalPayment({
  orderId: '...',
  amount: 50.00,
  method: 'card', // or 'digital'
  status: 'completed', // or 'failed'
  payerCustomerId: '...',
  processor: 'stripe',
  transactionId: 'txn_123'
});
// Returns: { success: boolean; payment?: PaymentRow; error?: string }
```

#### 2.5 Mirror Auto-Charge Payments
```typescript
import { mirrorAutoChargePayment } from '../api/mirrorWritesApi';

// Mirrors distance-based auto charges
const result = await mirrorAutoChargePayment({
  orderId: '...',
  amount: 50.00,
  status: 'completed', // or 'failed'
  payerCustomerId: '...',
  distanceTriggeredAt: new Date().toISOString(),
  boundaryId: 'restaurant_boundary_25m'
});
// Returns: { success: boolean; payment?: PaymentRow; error?: string }
```

## Integration Instructions

### Option 1: Use Wrapper API (Recommended for Phase 2)
Replace imports of `ordersApi` with `ordersApiWithMirror`:

```typescript
// BEFORE (in your component):
import { createOrderWithItems } from '../api/ordersApi';

// AFTER (in your component):
import { createOrderWithItems } from '../api/ordersApiWithMirror';
```

The wrapper automatically:
1. Calls the original `createOrderWithItems` function
2. Mirrors seat creation (Phase 2.1)
3. Mirrors seat assignment (Phase 2.2)
4. Returns the original order (existing behavior unchanged)

### Option 2: Manual Integration
If you need more control, call mirror functions manually:

```typescript
import { createOrderWithItems } from '../api/ordersApi';
import { mirrorSeatCreation, mirrorSeatAssignment } from '../api/mirrorWritesApi';

// Create order (existing behavior)
const order = await createOrderWithItems(input);

// Mirror seat creation (non-blocking)
try {
  await mirrorSeatCreation(order.id, input.customerName);
} catch (error) {
  console.warn('Seat mirroring failed (non-blocking):', error);
}

// Mirror seat assignment (non-blocking)
try {
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('id')
    .eq('order_id', order.id);
  
  if (orderItems) {
    await mirrorSeatAssignment(order.id, orderItems.map(item => item.id));
  }
} catch (error) {
  console.warn('Seat assignment mirroring failed (non-blocking):', error);
}
```

## Payment Mirroring Integration

### Cash Payments
Find where `orders.cash_tendered_amount` or `orders.change_received_confirmed` are set, and add:

```typescript
import { mirrorCashPayment } from '../api/mirrorWritesApi';

// After successful cash payment
await mirrorCashPayment({
  orderId: order.id,
  amount: cashAmountAppliedToItems,
  tenderedAmount: cashTendered,
  changeConfirmed: changeReceived,
  payerCustomerId: customerId
});
```

### Card/Digital Payments
Find where card or digital payments are processed, and add:

```typescript
import { mirrorCardDigitalPayment } from '../api/mirrorWritesApi';

// After successful payment
await mirrorCardDigitalPayment({
  orderId: order.id,
  amount: paymentAmount,
  method: 'card', // or 'digital'
  status: 'completed',
  payerCustomerId: customerId,
  processor: 'stripe',
  transactionId: paymentIntentId
});

// On payment failure
await mirrorCardDigitalPayment({
  orderId: order.id,
  amount: paymentAmount,
  method: 'card',
  status: 'failed',
  payerCustomerId: customerId,
  processor: 'stripe',
  failureReason: error.message
});
```

### Auto-Charge (Distance-Based)
Find where distance-based auto-charge is triggered, and add:

```typescript
import { mirrorAutoChargePayment } from '../api/mirrorWritesApi';

// When distance boundary triggers charge
await mirrorAutoChargePayment({
  orderId: order.id,
  amount: chargeAmount,
  status: 'completed', // or 'failed'
  payerCustomerId: customerId,
  distanceTriggeredAt: new Date().toISOString(),
  boundaryId: 'restaurant_boundary_25m'
});
```

## Error Handling

All mirror write functions are **non-blocking**. They follow this pattern:

```typescript
const result = await mirrorSeatCreation(orderId, customerName);

if (!result.success) {
  // Log the error but don't block the user
  console.warn('Mirror write failed (non-blocking):', result.error);
  // Existing behavior continues normally
}

// Existing code continues regardless of mirror success/failure
return order;
```

## Phase 2 Exit Criteria (VERY IMPORTANT)

You are done with Phase 2 when **ALL** of the following are true:

### Database
- [ ] `seats` table exists and has proper schema
- [ ] `payments` table exists and has proper schema
- [ ] `order_items.seat_id` column exists
- [ ] All indexes are created

### Code Integration
- [ ] Every new `order_item` has `seat_id` assigned
- [ ] Every payment event creates a row in `payments` table
- [ ] Mirror writes are non-blocking (failures don't affect users)
- [ ] Existing flows behave exactly the same

### Testing
- [ ] Create an order → Seat is created automatically
- [ ] Add items to order → Items get `seat_id` assigned
- [ ] Process cash payment → Row appears in `payments` table
- [ ] Process card payment → Row appears in `payments` table
- [ ] Trigger auto-charge → Row appears in `payments` table
- [ ] Existing UI shows no changes
- [ ] No screens read from `seats` or `payments` tables yet

### Production Readiness
- [ ] Can run in production without users noticing
- [ ] Mirror write failures don't block ordering
- [ ] No performance degradation
- [ ] Logs show mirror write attempts and results

## What You DO NOT Do in Phase 2

### ❌ DO NOT:
- Read from `payments` table
- Read from `seats` table
- Enforce seat selection in UI
- Remove any legacy fields (e.g., `orders.cash_tendered_amount`)
- Change totals logic
- Change UI based on new tables
- Add constraints that could block writes
- Delete or deprecate existing functionality

### ✅ DO:
- Write to `seats` table when orders are created
- Write to `order_items.seat_id` when items are added
- Write to `payments` table when payments occur
- Log mirror write failures
- Keep existing behavior intact
- Test that failures don't affect users

## Troubleshooting

### Mirror writes are failing
Check:
1. Database tables exist (`seats`, `payments`)
2. `order_items.seat_id` column exists
3. RLS policies allow authenticated users to write
4. Network connection to Supabase is working
5. Logs show specific error messages

### Existing behavior is broken
STOP immediately! Phase 2 should not affect existing behavior. Revert changes and investigate.

### Performance issues
Check:
1. Indexes are created on `order_id` columns
2. Mirror writes are async (not blocking)
3. No unnecessary reads from new tables

## Next Steps After Phase 2

Once Phase 2 exit criteria are met, you can proceed to Phase 3:

1. **Start reading from new tables** for projections
2. **Derive states** from events (not stored redundantly)
3. **Build authoritative joined projections** per screen
4. **Replace UI-side calculations** with server-side projections
5. **Deprecate redundant fields** gradually

But that's for Phase 3. For now, focus on Phase 2: Mirror writes only.

## Support

If you encounter issues:
1. Check the logs for mirror write errors
2. Verify database schema matches this guide
3. Ensure all imports use the correct API files
4. Test that existing behavior still works
5. Review the canonical spec for clarification

---

**Phase 2 Status:** Ready for implementation
**Last Updated:** 2026-01-06
