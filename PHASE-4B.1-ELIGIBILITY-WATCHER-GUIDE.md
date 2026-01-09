# Phase 4B.1: Eligibility Watcher Implementation Guide

## Overview
This document describes the Phase 4B.1 implementation of the eligibility watcher for the restaurant app. Phase 4B.1 introduces post-commit observation that emits advisory events when tables become eligible for closure.

## Phase 4B.1 Goal
**Implement a post-commit observer that emits table-eligible-for-closure events when payment completeness changes.**

### Key Rules (NON-NEGOTIABLE)
1. ✅ OUT-OF-DATABASE (not Postgres triggers)
2. ✅ POST-COMMIT (after transactions complete)
3. ✅ READ-CONSISTENCY GUARD (realtime is best-effort, not guaranteed)
4. ✅ ADVISORY EVENTS ONLY (never read for truth)
5. ❌ NO TIMERS
6. ❌ NO CLOSURE LOGIC
7. ❌ NO MUTATIONS
8. ❌ NO UI HOOKS
9. ❌ NO RLS
10. ❌ NO DB TRIGGERS

---

## Execution Model (Reconfirmed, Enforced)

### Out-of-Database
- **NOT** a Postgres trigger
- **NOT** inside a transaction
- **NOT** calling service logic from SQL

### Post-Commit Observer
- Observes changes **after** they are committed to the database
- Uses Supabase Realtime (or similar mechanism)
- Fire-and-forget event handling

### Mechanism Options
- Supabase Realtime (current implementation)
- Queue consumer
- Webhook
- Background worker

### ⚠️ Realtime is Best-Effort, Not Guaranteed
- Realtime signals may arrive before commit is visible
- Read-consistency guard is **mandatory**
- If resolving `table_id` returns null, retry once after 50-200ms

---

## Read-Consistency Guard (Authoritative Fix)

### Canonical Rule
If resolving `table_id` immediately after an INSERT returns null, retry once after a short delay (50-200ms), then exit silently.

### Why This Matters
- Realtime events may fire before commit is visible to readers
- Without retry: false negatives (table exists but not found)
- With retry: prevents race-based false negatives

### Implementation
```typescript
async function getTableIdForOrderWithRetry(
  orderId: number
): Promise<string | null> {
  let tableId = await getTableIdForOrder(orderId);
  if (tableId) return tableId;

  // Read-consistency guard: retry once
  await sleep(100);

  tableId = await getTableIdForOrder(orderId);
  return tableId ?? null;
}
```

### This is NOT:
- ❌ A business retry
- ❌ Stateful
- ❌ A violation of immutability

### This IS:
- ✅ A read-consistency guard
- ✅ Prevents race-based false negatives
- ✅ Mandatory for production safety

---

## Event Emission - Canonical Clarification

### Authoritative Rule
`system_events` is:
- Append-only
- Advisory
- Never read for truth
- No uniqueness
- No constraints required
- Persistence is optional at Phase 4B.1

### If system_events Does Not Exist
Either:
1. Create a minimal append-only table, OR
2. Emit to a non-persistent sink (console / external log)

### Do NOT:
- ❌ Add constraints
- ❌ Add indexes
- ❌ Add deduplication
- ❌ Read for business logic
- ❌ Enforce uniqueness

### Safe Emission Helper
```typescript
async function emitTableEligibleForClosure(
  tableId: string,
  orderId: number
) {
  // Advisory log only. Never used for truth.
  await supabase.from('system_events').insert({
    event_type: 'TableEligibleForClosure',
    table_id: tableId,
    order_id: orderId,
    payload: null
  });
}
```

---

## Core Watcher - Final, Defensive Version

### handleOrderChange Function

```typescript
export async function handleOrderChange(orderId: number): Promise<void> {
  // IMPORTANT:
  // Phase 4B.1 ONLY.
  // This function MUST NOT:
  // - start timers
  // - schedule delayed jobs
  // - change table availability
  // - close tables
  // - mutate orders or tables
  // Those belong to Phase 4B.2+ ONLY.

  // Step 1: Resolve table_id with read-consistency guard
  const tableId = await getTableIdForOrderWithRetry(orderId);
  if (!tableId) return;

  // Step 2: Check eligibility using Phase 3B service
  const result = await canCloseTable(tableId);

  // Step 3: Emit event if eligible
  if (result.eligible === true) {
    await emitTableEligibleForClosure(tableId, orderId);
  }
}
```

### What This Function Does
1. Resolves `table_id` for the order (with read-consistency guard)
2. Calls `canCloseTable(tableId)` (Phase 3B service)
3. Emits advisory event if table is eligible

### What This Function Does NOT Do
- ❌ Start timers
- ❌ Schedule delayed jobs
- ❌ Change table availability
- ❌ Close tables
- ❌ Mutate orders or tables
- ❌ Add UI hooks
- ❌ Enable RLS
- ❌ Create DB triggers

---

## Trigger Sources (Unchanged, Safe)

### Payments INSERT
```typescript
supabase
  .channel('payments-inserts')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'payments' },
    payload => {
      handleOrderChange(payload.new.order_id).catch(console.error);
    }
  )
  .subscribe();
```

### Order Items INSERT
```typescript
supabase
  .channel('order-items-inserts')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'order_items' },
    payload => {
      handleOrderChange(payload.new.order_id).catch(console.error);
    }
  )
  .subscribe();
```

---

## Files Created

### 1. `src/api/eligibilityWatcherApi.ts`
Core watcher implementation with:
- `handleOrderChange()` - Main watcher function
- `getTableIdForOrderWithRetry()` - Read-consistency guard
- `emitTableEligibleForClosure()` - Advisory event emission
- `watchPaymentsInsert()` - Payments realtime subscription
- `watchOrderItemsInsert()` - Order items realtime subscription
- `initializeEligibilityWatchers()` - Start all watchers
- `manuallyTriggerEligibilityCheck()` - Testing helper

### 2. `src/api/initializeEligibilityWatchers.ts`
Simple initialization entry point:
- `startEligibilityWatchers()` - Call once at app startup
- `testEligibilityWatcher()` - Manual testing helper

### 3. `sql-create-system-events-table.sql` (OPTIONAL)
Minimal advisory event log table:
- No id column (no identity semantics)
- No primary key
- No constraints
- No indexes
- Append-only
- Never read for truth

---

## How to Deploy Phase 4B.1

### Step 1: Create system_events Table (Optional)
```sql
-- Execute in Supabase SQL Editor
\i sql-create-system-events-table.sql
```

**Note:** If the table doesn't exist, events will be logged to console instead. This is acceptable at Phase 4B.1.

### Step 2: Initialize Watchers (BACKEND PROCESS ONLY)
```typescript
// BACKEND BOOTSTRAP ONLY
// Example: server.ts, worker.ts, edge function init
import { startEligibilityWatchers } from '../api/initializeEligibilityWatchers';

// Call once per backend process (singleton)
startEligibilityWatchers();
```

**IMPORTANT:**
- Must run in a single backend process only
- DO NOT call from browser, React, Next.js client, or per-user context
- DO NOT call from src/App.tsx, src/main.tsx, or any React component
- Multiple watcher instances (per user / per tab) are forbidden
- Realtime subscriptions per client are forbidden
- Implicit trust of UI lifecycle is forbidden

**Correct Usage (backend only):**
```typescript
// server.ts, worker.ts, or edge function
import { startEligibilityWatchers } from './api/initializeEligibilityWatchers';
startEligibilityWatchers();
```

**Incorrect Usage (will be rejected):**
```typescript
// src/App.tsx, src/main.tsx, or any React component
startEligibilityWatchers(); // ❌ FORBIDDEN
```

### Step 3: Verify Watchers Are Running
Check browser console for:
```
[startEligibilityWatchers] Phase 4B.1: Initializing eligibility watchers
[watchPaymentsInsert] Initializing payments insert watcher
[watchOrderItemsInsert] Initializing order items insert watcher
[watchPaymentsInsert] Subscription status: SUBSCRIBED
[watchOrderItemsInsert] Subscription status: SUBSCRIBED
[startEligibilityWatchers] Phase 4B.1 watchers started successfully
```

### Step 4: Test Watcher (Optional)
```typescript
import { testEligibilityWatcher } from '../api/initializeEligibilityWatchers';

// Test with a specific order
await testEligibilityWatcher(12345);
```

### Step 5: Verify Events Are Emitted
Check browser console or system_events table:
```sql
SELECT * FROM system_events
WHERE event_type = 'TableEligibleForClosure'
ORDER BY created_at DESC
LIMIT 10;
```

---

## Success Criteria

### This phase is successful if:
- ✅ Watchers initialize without errors
- ✅ Events are emitted when payments are inserted
- ✅ Events are emitted when order items are inserted
- ✅ Events appear in console or system_events table
- ✅ No timers are started
- ✅ No tables are closed
- ✅ No mutations occur
- ✅ Read-consistency guard prevents false negatives
- ✅ Watchers survive database disconnections

---

## Testing Scenarios

### Scenario 1: Payment Completes Order
1. Create an order with items totaling $50
2. Insert a payment of $50
3. **Expected:** `TableEligibleForClosure` event emitted

### Scenario 2: Payment Does Not Complete Order
1. Create an order with items totaling $50
2. Insert a payment of $30
3. **Expected:** No event emitted

### Scenario 3: Multiple Payments Complete Order
1. Create an order with items totaling $50
2. Insert a payment of $30
3. Insert a payment of $20
4. **Expected:** `TableEligibleForClosure` event emitted after second payment

### Scenario 4: Order Item Added
1. Create an order with no items
2. Add an order item for $50
3. **Expected:** No event emitted (order not paid)

### Scenario 5: Read-Consistency Guard
1. Insert a payment (realtime fires immediately)
2. **Expected:** Watcher retries if `table_id` not found on first attempt

---

## Troubleshooting

### Watchers Not Initializing
**Check:**
1. Supabase client is properly configured
2. Realtime is enabled in Supabase dashboard
3. Network connection is stable
4. No errors in browser console

### Events Not Emitting
**Check:**
1. Orders have `table_id` set
2. `canCloseTable()` returns `eligible: true`
3. `system_events` table exists (or check console)
4. No errors in watcher functions

### False Negatives (Table Eligible But No Event)
**Check:**
1. Read-consistency guard is working
2. Retry delay is sufficient (100ms)
3. `getTableIdForOrder()` is not failing
4. `canCloseTable()` is not throwing errors

### Performance Issues
**Check:**
1. Watchers are not making excessive queries
2. `canCloseTable()` uses `order_payment_status` view efficiently
3. No unnecessary realtime subscriptions
4. Events are fire-and-forget (not awaited)

---

## What NOT to Implement Yet

**DO NOT implement:**
- ❌ Auto-close timers (Phase 4B.2)
- ❌ Background jobs (Phase 4B.2)
- ❌ Table closure logic (Phase 4B.2)
- ❌ Availability updates (Phase 4B.2)
- ❌ UI indicators (Phase 4B.3)
- ❌ Staff notifications (Phase 4B.3)
- ❌ Deduplication (Phase 4B.2)
- ❌ RLS policies
- ❌ DB triggers

Those belong to later phases.

---

## Mental Model (IMPORTANT)

**Watchers are observers, not actors**
- They watch, they don't act
- They emit events, they don't mutate state
- They are advisory, not authoritative

**Events are signals, not commands**
- Events signal that something interesting happened
- Events do not trigger immediate action
- Events are logged, not processed

**Phase 4B.1 is preparation, not execution**
- We're building the sensing mechanism
- We're not building the acting mechanism
- Phase 4B.2 will consume these events

---

## Next Steps After Phase 4B.1

Once Phase 4B.1 is verified:

### Phase 4B.2: Event Consumers
- Consume `TableEligibleForClosure` events
- Start auto-close timers
- Actually close tables when eligible
- Update table availability

### Phase 4B.3: UI Integration
- Show payment status in staff dashboard
- Display close eligibility
- Add staff override buttons
- Notify staff of eligible tables

But NOT yet! Phase 4B.1 is about observation only.

---

**Phase 4B.1 Status:** Ready for implementation  
**Last Updated:** 2026-01-06
