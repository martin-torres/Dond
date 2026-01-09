# Phase 4C — Availability Read Model (DESIGN ONLY)

## Purpose
Define how table availability is derived on demand for consumers (services/UI), without storing state or mutating data.

## Non-Goals (Explicit)
This phase does **NOT**:
- Store availability or table state
- Mutate tables or orders
- Close tables
- Decide truth
- Introduce RLS
- Change UI

---

## 1. Position in the Canonical Flow

### Enforcement Order (unchanged)
1. Phase 4A — Hard DB enforcement
2. Phase 4F — Observation / logging
3. Phase 4B.1 — Eligibility watcher
4. Phase 4B.2 — Auto-close timers
5. **Phase 4C — Availability read model (this phase)**
6. Phase 4D — UI visibility
7. Phase 4E — RLS

### Dependency
Availability is derived only from existing truth (orders + derived payment completeness). No new truth sources are introduced.

---

## 2. Core Law (NON-NEGOTIABLE)

**Availability is a read-time projection, never stored.**

There is no:
- `available` column
- `table_status`
- cached availability
- background job that "sets" availability

---

## 3. Definitions (Precise)

### 3.1 "Active Order"
An order is active if:
- It exists for a table, **AND**
- Its status is **not** in (`CANCELLED`, `REFUNDED`)

(Same filter already used by `order_payment_status`.)

### 3.2 "Payment Complete"
Defined only by:
- `order_payment_status.is_payment_complete = true`

No other computation is allowed.

### 3.3 "Table Availability"
A table is available **iff**:
- There are zero active orders for the table
- **OR**
- All active orders for the table are payment-complete

This is a pure boolean derivation at read time.

---

## 4. Authoritative Derivation (Read-Only)

### 4.1 Canonical Inputs
- `orders`
- `order_payment_status` (Phase 3A)

### 4.2 Canonical Service (Read-Only)

**Service:** `getTableAvailability(tableId)`

**Contract:**
```typescript
getTableAvailability(tableId): {
  table_id: string
  available: boolean
  active_order_count: number
  unpaid_order_count: number
}
```

**Rules:**
- Reads only
- No mutations
- No caching
- No timers
- No events required
- Deterministic

---

## 5. Derivation Logic (Mechanical)

For a given `tableId`:

1. **Fetch all active orders** for the table
2. **Join with `order_payment_status`**
3. **Compute:**
   - `active_order_count`
   - `unpaid_order_count` = count where `is_payment_complete = false`
4. **Derive:**
   - `available = (active_order_count === 0) || (unpaid_order_count === 0)`

No shortcuts. No flags. No persistence.

---

## 6. Relationship to Previous Phases

- **Phase 4B.1** emits eligibility signals → **ignored here**
- **Phase 4B.2** timers expire → **ignored here**
- Availability does **not** "wait" for timers
- Availability is **always current** based on truth
- Timers and events are **orthogonal** to availability

---

## 7. What Availability Is NOT

Availability is **NOT**:
- "Table is closed"
- "Timer expired"
- "Staff approved"
- "UI toggled"
- "Event received"

Availability is **only** a function of:
- existence of active orders
- payment completeness of those orders

---

## 8. Failure & Consistency Model

- If reads fail → throw error
- If partial data → throw error
- Availability is undefined on failure
- No retries beyond normal read retries
- No state drift possible (nothing stored)

---

## 9. Consumers (Future Phases)

- **Phase 4D (UI):** reads availability
- **Staff views:** read availability
- **Automation:** may read availability
- **Nothing writes availability**

---

## 10. Explicitly Forbidden

- ❌ Availability columns
- ❌ Materialized views
- ❌ Background recomputation
- ❌ Triggers
- ❌ Timers
- ❌ Events as inputs
- ❌ UI authority

---

## 11. Verification Checklist (Design-Level)

Before any implementation:

- [ ] Availability is derived at read time
- [ ] No new schema
- [ ] No stored flags
- [ ] Uses `order_payment_status` exclusively
- [ ] Ignores timers/events
- [ ] Deterministic for same inputs

---

## 12. Implementation Notes (For Future Phase)

### Service Signature
```typescript
export async function getTableAvailability(tableId: string): Promise<{
  table_id: string
  available: boolean
  active_order_count: number
  unpaid_order_count: number
}>
```

### Derivation Logic
```typescript
// Pseudocode
async function getTableAvailability(tableId) {
  // 1. Fetch active orders
  const activeOrders = await getActiveOrders(tableId);
  
  // 2. Join with payment status
  const ordersWithPayment = await joinPaymentStatus(activeOrders);
  
  // 3. Compute counts
  const activeOrderCount = ordersWithPayment.length;
  const unpaidOrderCount = ordersWithPayment.filter(
    order => !order.is_payment_complete
  ).length;
  
  // 4. Derive availability
  const available = (activeOrderCount === 0) || (unpaidOrderCount === 0);
  
  return {
    table_id: tableId,
    available,
    active_order_count: activeOrderCount,
    unpaid_order_count: unpaidOrderCount
  };
}
```

### Error Handling
- If `getActiveOrders` fails → throw error
- If `joinPaymentStatus` fails → throw error
- If partial data → throw error
- No fallback to "not available"

---

## 13. Testing Strategy (Design-Level)

### Test Scenarios

1. **Empty Table**
   - No active orders
   - **Expected:** `available: true`, `active_order_count: 0`

2. **Active Orders, All Paid**
   - 2 active orders, both `is_payment_complete: true`
   - **Expected:** `available: true`, `unpaid_order_count: 0`

3. **Active Orders, Some Unpaid**
   - 3 active orders, 1 unpaid
   - **Expected:** `available: false`, `unpaid_order_count: 1`

4. **Active Orders, All Unpaid**
   - 2 active orders, both unpaid
   - **Expected:** `available: false`, `unpaid_order_count: 2`

5. **Cancelled Orders**
   - 2 cancelled orders (not active)
   - **Expected:** `available: true`, `active_order_count: 0`

6. **Mixed Orders**
   - 1 active paid, 1 active unpaid, 1 cancelled
   - **Expected:** `available: false`, `active_order_count: 2`, `unpaid_order_count: 1`

---

## 14. Performance Considerations

### Read-Only Design
- No write overhead
- No cache invalidation
- No background jobs
- No trigger overhead

### Query Optimization
- Use indexes on `orders.table_id`
- Use indexes on `order_payment_status.order_id`
- Join is efficient (already optimized in Phase 3A)

### Scalability
- Read-time derivation scales with read volume
- No shared state
- No coordination overhead
- Deterministic by design. Any caching considerations are deferred to a future phase.

---

## 15. Mental Model (IMPORTANT)

**Availability is a question, not a statement**
- You ask "Is this table available?"
- You don't declare "This table is available"
- The answer is always current
- The answer is never stored

**Availability is derived, not stored**
- Like asking "What's 2+2?"
- The answer (4) is not stored
- It's computed when asked
- It's always correct for the current state

**Availability ignores timers and events**
- Timers are about observation
- Events are about signaling
- Availability is about truth
- They are orthogonal concerns

---

## 16. Open Questions (To Resolve Before Implementation)

1. **Batch reads:**
   - Should `getTableAvailability` support batch queries?
   - e.g., `getTableAvailability([tableId1, tableId2, ...])`

2. **Caching (external):**
   - Is external caching allowed?
   - If yes, what's the TTL?
   - How is cache invalidation handled?

3. **Error semantics:**
   - Should partial failures return partial results?
   - Or fail fast?

4. **Consistency:**
   - Read consistency level?
   - Stale reads acceptable?

---

## 17. Approval Checklist

- [ ] Design respects all canonical rules
- [ ] Availability is read-time only
- [ ] No storage of availability
- [ ] No mutations
- [ ] Uses `order_payment_status` exclusively
- [ ] Ignores timers and events
- [ ] Deterministic
- [ ] No new schema
- [ ] No UI changes
- [ ] No RLS changes

---

**Status:** DESIGN COMPLETE — AWAITING APPROVAL

**Next Step:** Review and approve design before implementation