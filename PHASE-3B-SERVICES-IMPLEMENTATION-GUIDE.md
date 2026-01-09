# Phase 3B: Services Layer Implementation Guide

## Overview
This document describes the Phase 3B implementation of table services for the restaurant app. Phase 3B introduces behavior based on derived truth (from SQL views), without changing UI or write paths.

## Phase 3B Goal
**Implement table-close eligibility logic based on derived payment completeness, not stored state.**

### Key Rules (NON-NEGOTIABLE)
1. ✅ READ ONLY (except when explicitly inserting comp payments)
2. ✅ MUST use `order_payment_status` view, not reimplement math
3. ✅ DO NOT modify existing order creation logic
4. ✅ DO NOT modify existing payment processing logic
5. ✅ DO NOT update or delete rows in orders, order_items, or tables
6. ✅ DO NOT add new database columns
7. ✅ DO NOT enable RLS
8. ✅ DO NOT touch UI components
9. ✅ DO NOT store "paid", "closed", or "complete" flags anywhere

## Prerequisites

### Phase 3A: Create order_payment_status View
Before using Phase 3B services, you MUST create the SQL view:

```sql
-- Execute in Supabase SQL Editor
\i sql-create-order-payment-status-view.sql
```

This view calculates:
- `total_due`: SUM(order_items.price * quantity)
- `total_paid`: SUM(payments.amount WHERE status = 'completed')
- `is_payment_complete`: total_paid >= total_due

**CRITICAL FIXES APPLIED:**
1. ✅ **LEFT JOIN for order_items** - Ensures orders with zero items are included
2. ✅ **COALESCE on SUM** - Handles NULL from LEFT JOIN, treats empty orders as $0 due
3. ✅ **Removed order_type filter** - Keeps view universal, business logic in services
4. ✅ **No premature filtering** - View is mechanical and reusable

**Why These Matter:**
- Without LEFT JOIN, orders with zero items disappear → incorrect eligibility
- Without COALESCE, NULL math breaks payment completeness
- With order_type filter, view becomes business-specific → not reusable

## Services API

### 1️⃣ canCloseTable(tableId)

**Purpose:** Determine whether a table is eligible to close

**Signature:**
```typescript
async function canCloseTable(tableId: string): Promise<TableCloseEligibility>
```

**Returns:**
```typescript
{
  eligible: boolean;
  reason?: string;
  incomplete_orders?: string[];
  remaining_balance?: number;
}
```

**Behavior:**
- Read all non-cancelled orders at the table from `order_payment_status`
- For each order: check `is_payment_complete`
- If ANY order is not payment-complete → return `{ eligible: false }`
- If no active orders exist → return `{ eligible: true }`
- Otherwise → return `{ eligible: true }`

**Constraints:**
- READ ONLY
- No writes
- No side effects

**Example:**
```typescript
import { canCloseTable } from '../api/tableServicesApi';

const eligibility = await canCloseTable('table-uuid-123');

if (eligibility.eligible) {
  console.log('Table can be closed:', eligibility.reason);
} else {
  console.log('Table cannot be closed:', eligibility.reason);
  console.log('Remaining balance:', eligibility.remaining_balance);
  console.log('Incomplete orders:', eligibility.incomplete_orders);
}
```

---

### 2️⃣ getTablePaymentSummary(tableId)

**Purpose:** Provide a derived financial summary for staff logic and automation

**Signature:**
```typescript
async function getTablePaymentSummary(tableId: string): Promise<TablePaymentSummary | null>
```

**Returns:**
```typescript
{
  table_id: string;
  number_of_orders: number;
  total_due: number;
  total_paid: number;
  remaining_balance: number;
  table_payment_complete: boolean;
}
```

**Source:** Uses `order_payment_status`, groups by table_id

**Constraints:**
- READ ONLY
- No state mutation

**Example:**
```typescript
import { getTablePaymentSummary } from '../api/tableServicesApi';

const summary = await getTablePaymentSummary('table-uuid-123');

if (summary) {
  console.log('Table Summary:');
  console.log('- Orders:', summary.number_of_orders);
  console.log('- Total Due:', summary.total_due);
  console.log('- Total Paid:', summary.total_paid);
  console.log('- Remaining:', summary.remaining_balance);
  console.log('- Payment Complete:', summary.table_payment_complete);
}
```

---

### 3️⃣ closeTableIfEligible(tableId)

**Purpose:** Coordinate table closure logic without forcing it

**Signature:**
```typescript
async function closeTableIfEligible(tableId: string): Promise<{
  closed: boolean;
  reason?: string;
  emitted_event?: boolean;
}>
```

**Behavior:**
1. Call `canCloseTable(tableId)`
2. If false → do nothing, return `{ closed: false }`
3. If true:
   - Emit a table-close event (log for now, could be analytics/hook later)
   - DO NOT mutate tables
   - DO NOT update availability
   - DO NOT change UI
   - Return `{ closed: true, emitted_event: true }`

**This function prepares the system for:**
- Auto-close timers
- Staff-triggered closure
- Analytics

**Example:**
```typescript
import { closeTableIfEligible } from '../api/tableServicesApi';

const result = await closeTableIfEligible('table-uuid-123');

if (result.closed) {
  console.log('Table close event emitted:', result.reason);
  // Now you can trigger actual table closure (auto-close timer, staff action, etc.)
} else {
  console.log('Table not eligible to close:', result.reason);
}
```

---

## Staff Override: compRemainingBalance

**Purpose:** Handle staff overrides via payment events, never edits

**Rule:** If staff wants to close a table with unpaid items:
- Insert a payment event:
  - `method = 'comp'`
  - `status = 'completed'`
  - `amount = remaining_balance`
  - `metadata.reason = 'manager_override'`

This automatically satisfies payment completeness.

**Signature:**
```typescript
async function compRemainingBalance(params: {
  orderId: string;
  remainingBalance: number;
  reason?: string;
  staffMemberId?: string;
}): Promise<{ success: boolean; payment?: any; error?: string }>
```

**Example:**
```typescript
import { compRemainingBalance, canCloseTable } from '../api/tableServicesApi';

// Check if table has unpaid items
const eligibility = await canCloseTable('table-uuid-123');

if (!eligibility.eligible && eligibility.incomplete_orders) {
  // Comp the remaining balance for each incomplete order
  for (const orderId of eligibility.incomplete_orders) {
    const result = await compRemainingBalance({
      orderId,
      remainingBalance: 25.50, // Get this from getTablePaymentSummary
      reason: 'Customer complaint - comped by manager',
      staffMemberId: 'manager-uuid-456'
    });
    
    if (result.success) {
      console.log('Order comped:', result.payment.id);
    }
  }
  
  // Now check again - table should be eligible to close
  const newEligibility = await canCloseTable('table-uuid-123');
  console.log('Now eligible?', newEligibility.eligible);
}
```

**Double-Comp Prevention:**
- Soft guard: Function checks `order_payment_status.is_payment_complete` before inserting
- If already complete → returns error "Order is already payment-complete, comp not needed"
- Phase 4 will enforce hard prevention with UI guards
- Caller must still ensure comp is applied only once

---

## Batch Operations

### getTablePaymentSummaries(tableIds)

**Purpose:** Staff dashboard showing all tables at once

**Example:**
```typescript
import { getTablePaymentSummaries } from '../api/tableServicesApi';

const summaries = await getTablePaymentSummaries([
  'table-uuid-1',
  'table-uuid-2',
  'table-uuid-3'
]);

for (const [tableId, summary] of Object.entries(summaries)) {
  if (summary) {
    console.log(`${tableId}: ${summary.table_payment_complete ? '✅' : '❌'} $${summary.remaining_balance} remaining`);
  }
}
```

### checkTableCloseEligibility(tableIds)

**Purpose:** Staff dashboard showing which tables can be closed

**Example:**
```typescript
import { checkTableCloseEligibility } from '../api/tableServicesApi';

const eligibility = await checkTableCloseEligibility([
  'table-uuid-1',
  'table-uuid-2',
  'table-uuid-3'
]);

for (const [tableId, status] of Object.entries(eligibility)) {
  console.log(`${tableId}: ${status.eligible ? '✅ Can close' : '❌ Cannot close'} - ${status.reason}`);
}
```

---

## Usage Patterns

### Pattern 1: Staff Dashboard
```typescript
import { getTablePaymentSummaries, checkTableCloseEligibility } from '../api/tableServicesApi';

// Get all table IDs (from your existing table management)
const tableIds = ['table-1', 'table-2', 'table-3'];

// Fetch summaries and eligibility in parallel
const [summaries, eligibility] = await Promise.all([
  getTablePaymentSummaries(tableIds),
  checkTableCloseEligibility(tableIds)
]);

// Display in UI (read-only!)
for (const tableId of tableIds) {
  const summary = summaries[tableId];
  const status = eligibility[tableId];
  
  if (summary && status) {
    console.log(`
      Table: ${tableId}
      Orders: ${summary.number_of_orders}
      Total Due: $${summary.total_due}
      Total Paid: $${summary.total_paid}
      Remaining: $${summary.remaining_balance}
      Status: ${status.eligible ? '✅ Ready to close' : '❌ Not ready'}
      Reason: ${status.reason}
    `);
  }
}
```

### Pattern 2: Auto-Close Timer
```typescript
import { closeTableIfEligible } from '../api/tableServicesApi';

// Run every 5 minutes for all active tables
setInterval(async () => {
  const activeTableIds = await getActiveTableIds(); // Your existing function
  
  for (const tableId of activeTableIds) {
    const result = await closeTableIfEligible(tableId);
    
    if (result.closed) {
      // Trigger actual table closure (but not in Phase 3B!)
      // This will be implemented in a later phase
      console.log(`Auto-close triggered for table ${tableId}`);
    }
  }
}, 5 * 60 * 1000);
```

### Pattern 3: Staff Override Flow
```typescript
import { 
  getTablePaymentSummary, 
  compRemainingBalance, 
  canCloseTable 
} from '../api/tableServicesApi';

async function handleStaffOverride(tableId: string, staffMemberId: string) {
  // Step 1: Get current status
  const summary = await getTablePaymentSummary(tableId);
  const eligibility = await canCloseTable(tableId);
  
  if (!summary || eligibility.eligible) {
    return { success: false, error: 'Table already eligible or no orders' };
  }
  
  // Step 2: Staff confirms override
  const confirmed = await showOverrideConfirmation({
    remainingBalance: summary.remaining_balance,
    reason: eligibility.reason
  });
  
  if (!confirmed) {
    return { success: false, error: 'Override cancelled' };
  }
  
  // Step 3: Comp remaining balance
  // Note: This is a simplified example - you'd need to handle multiple orders
  const result = await compRemainingBalance({
    orderId: eligibility.incomplete_orders![0], // First incomplete order
    remainingBalance: summary.remaining_balance,
    reason: 'Staff override - customer issue',
    staffMemberId
  });
  
  if (result.success) {
    // Step 4: Verify table is now eligible
    const newEligibility = await canCloseTable(tableId);
    return { 
      success: true, 
      payment: result.payment, 
      now_eligible: newEligibility.eligible 
    };
  }
  
  return { success: false, error: result.error };
}
```

---

## Success Criteria

### This phase is successful if:
- ✅ No UI behavior changes
- ✅ No DB rows mutated (except payment inserts when explicitly called)
- ✅ Tables become eligible to close based purely on math
- ✅ The system can explain why a table can or cannot close
- ✅ Staff overrides work via payment events, not edits
- ✅ All decisions are derived, not stored

---

## What NOT to Implement Yet

**DO NOT implement:**
- ❌ Auto-close timers
- ❌ Background jobs
- ❌ UI indicators
- ❌ Staff buttons
- ❌ Distance logic
- ❌ Table status updates
- ❌ Availability changes

Those belong to later phases.

---

## Mental Model (IMPORTANT)

**Payments are facts**  
- Immutable events
- Never edited or deleted
- Source of truth for "who paid what"

**Tables are derived states**  
- No "closed" flag stored
- Eligibility calculated on-demand
- Based on payment completeness

**Closure is a consequence, not an action**  
- Happens when payments are complete
- Not triggered by a button click
- Automatic based on math

---

## Troubleshooting

### Services returning incorrect results
**Check:**
1. `order_payment_status` view exists and is up-to-date
2. Payments table has correct data
3. Order items have correct prices and quantities
4. No cancelled orders are included

### Staff override not working
**Check:**
1. Comp payment was inserted successfully
2. Payment has `method = 'comp'` and `status = 'completed'`
3. Amount matches remaining balance
4. Re-query `canCloseTable` after override

### Performance issues
**Check:**
1. Indexes exist on `order_payment_status` view columns
2. Batch operations are used for multiple tables
3. No unnecessary queries in loops

---

## Next Steps After Phase 3B

Once Phase 3B is verified:

1. **Phase 4A: Auto-Close Timers**
   - Implement background jobs
   - Trigger `closeTableIfEligible` periodically
   - Actually close tables when eligible

2. **Phase 4B: UI Indicators**
   - Show payment status in staff dashboard
   - Display close eligibility
   - Add staff override buttons

3. **Phase 4C: Table Management**
   - Update table availability
   - Mark tables as "closing" or "closed"
   - Coordinate with floor plan

But NOT yet! Phase 3B is about services only.

---

**Phase 3B Status:** Ready for implementation  
**Last Updated:** 2026-01-06
