# Phase 4D — UI Visibility Model (DESIGN ONLY)

## Purpose
Define how availability and payment-related derived truth are surfaced to UIs (staff and customer) without granting UI authority, mutations, or decision power.

## Non-Goals (Explicit)
This phase does **NOT**:
- Mutate tables, orders, or payments
- Decide closure
- Change availability
- Store UI state as truth
- Introduce RLS
- Introduce timers or automation
- Add schema

---

## 1. Position in the Canonical Flow

### Enforcement Order (unchanged)
1. Phase 4A — Hard DB enforcement
2. Phase 4F — Observation / logging
3. Phase 4B.1 — Eligibility watcher
4. Phase 4B.2 — Auto-close timers
5. Phase 4C — Availability read model
6. **Phase 4D — UI visibility (this phase)**
7. Phase 4E — RLS

### Dependency
UI visibility reads only from canonical, derived services/views. UI never decides or mutates truth.

---

## 2. Core Law (NON-NEGOTIABLE)

**UI renders derived truth; UI never decides truth.**

UI is a projection layer only.

---

## 3. Canonical Inputs (Read-Only)

UI may read **only** the following:
- `getTableAvailability(tableId)` (Phase 4C)
- `getTablePaymentSummary(tableId)` (Phase 3B)
- `order_payment_status` (indirectly via services)
- Existing orders / order_items (read-only)

UI must **not**:
- Query raw payments directly
- Recompute payment math
- Infer availability from events/timers
- Cache truth beyond request/session scope

---

## 4. Staff UI Visibility (Read-Only)

### 4.1 Staff Table List / Floor View

**Allowed indicators (examples):**
- Availability badge: Available / Occupied
- Active order count
- Remaining balance (aggregated)
- Payment completeness (derived)

**Derived source mapping:**
- Available / Occupied → `getTableAvailability`
- Counts / balances → `getTablePaymentSummary`

**Explicitly forbidden in staff UI:**
- "Close table" actions that mutate state
- Manual availability toggles
- "Mark paid" buttons
- UI-side payment math

---

## 5. Customer UI Visibility (Read-Only)

### 5.1 Customer Table / Session View

**Allowed indicators (examples):**
- Remaining balance
- Payment completeness status
- Order list (read-only)
- Payment history (completed only, read-only)

**Rules:**
- Customer UI never sees availability for other tables
- Customer UI never controls closure
- Customer UI never infers truth from timers or events

---

## 6. Visibility ≠ Action

### 6.1 UI Buttons & Actions (Visibility Only)

Buttons may exist **only if** they:
- Trigger existing allowed flows (e.g., add payment)
- Do not mutate tables or orders directly
- Do not set flags
- Do not "confirm" closure

**Example (allowed):**
- "Pay remaining balance" → inserts payment event

**Example (forbidden):**
- "Close table"
- "Set available"
- "Confirm eligibility"

---

## 7. Real-Time Updates (Optional, Read-Only)

UI may subscribe to read-only updates **if and only if**:
- Updates reflect re-reads of derived services
- UI does not store state as truth
- UI treats updates as advisory refresh triggers

**Forbidden:**
- UI reacting to events as truth
- UI assuming timers imply closure
- UI inferring availability from event streams

---

## 8. Error & Consistency Model

- If availability read fails → show error state
- UI must **not** assume "not available" on error
- UI must **not** degrade errors into decisions
- Retry behavior is a UI concern, not a truth concern

---

## 9. Role Separation (Strict)

| Layer | Responsibility |
|-------|---------------|
| Database | Enforce mechanics only |
| Services | Derive truth |
| Automation | Observe only |
| UI | Render truth only |

No layer crosses boundaries.

---

## 10. Explicitly Forbidden in UI

- ❌ Storing availability state
- ❌ Computing payment totals
- ❌ Deciding eligibility
- ❌ Acting on timers
- ❌ Using events as inputs
- ❌ Writing to orders/tables
- ❌ Bypassing services

---

## 11. Verification Checklist (Design-Level)

Before any implementation:

- [ ] UI reads availability via Phase 4C only
- [ ] UI reads payment math via Phase 3B only
- [ ] No UI-side truth computation
- [ ] No UI-side mutations
- [ ] Errors are surfaced, not coerced
- [ ] No reliance on timers/events

---

## 12. What This Phase Does NOT Do

- ❌ Implement UI
- ❌ Define UX copy
- ❌ Add buttons/actions
- ❌ Enable RLS
- ❌ Close tables
- ❌ Update availability

Those belong to later phases or product decisions.

---

## 13. Implementation Notes (For Future Phase)

### Staff UI Example (Conceptual)

```typescript
// Staff table list component
function StaffTableList() {
  const { data: tables, error } = useTables();
  
  if (error) {
    return <ErrorState message="Failed to load table status" />;
  }
  
  return (
    <div>
      {tables.map(table => (
        <TableCard
          key={table.id}
          tableId={table.id}
          // Availability from Phase 4C
          availability={getTableAvailability(table.id)}
          // Payment summary from Phase 3B
          paymentSummary={getTablePaymentSummary(table.id)}
          // No close button
          // No manual toggle
        />
      ))}
    </div>
  );
}
```

### Customer UI Example (Conceptual)

```typescript
// Customer session view
function CustomerSessionView({ tableId }) {
  const { data: paymentSummary, error } = usePaymentSummary(tableId);
  
  if (error) {
    return <ErrorState message="Failed to load payment status" />;
  }
  
  return (
    <div>
      <RemainingBalance amount={paymentSummary.remaining_balance} />
      <PaymentCompleteness status={paymentSummary.completeness} />
      <OrderList orders={paymentSummary.orders} />
      <PaymentHistory payments={paymentSummary.completed_payments} />
      {/* No availability for other tables */}
      {/* No closure controls */}
    </div>
  );
}
```

---

## 14. Testing Strategy (Design-Level)

### Test Scenarios

1. **Staff UI Renders Availability**
   - Read `getTableAvailability`
   - Display Available/Occupied badge
   - **Forbidden:** Close table button

2. **Staff UI Renders Payment Summary**
   - Read `getTablePaymentSummary`
   - Display counts and balances
   - **Forbidden:** Manual "Mark paid" button

3. **Customer UI Renders Own Data**
   - Read payment summary for own table
   - Display remaining balance
   - **Forbidden:** Availability for other tables

4. **Error Handling**
   - Availability read fails
   - **Expected:** Show error state
   - **Forbidden:** Assume "not available"

5. **Real-Time Updates (Optional)**
   - Subscribe to updates
   - Refresh on change
   - **Forbidden:** Store state as truth

---

## 15. Mental Model (IMPORTANT)

**UI is a mirror, not a source**
- UI reflects what services say
- UI does not decide what's true
- UI does not influence truth

**UI is a reader, not a writer**
- UI reads from services
- UI does not write to database
- UI does not bypass services

**UI is a display, not a computer**
- UI displays computed values
- UI does not compute values
- UI does not re-derive truth

**UI is a consumer, not a producer**
- UI consumes derived truth
- UI does not produce truth
- UI does not cache truth

---

## 16. Open Questions (To Resolve Before Implementation)

1. **Real-time subscription:**
   - Which update mechanism? (WebSocket, polling, SSE)
   - How often to refresh?
   - How to handle stale data?

2. **Error display:**
   - Retry button UI?
   - Auto-retry with backoff?
   - Degraded state indicators?

3. **Access control:**
   - Which roles see which data?
   - Customer vs staff visibility boundaries?
   - (Note: RLS is Phase 4E)

4. **UI state management:**
   - Client-side caching strategy?
   - Optimistic updates allowed?
   - (Must not store as truth)

---

## 17. Approval Checklist

- [ ] Design respects all canonical rules
- [ ] UI renders derived truth only
- [ ] UI never decides truth
- [ ] UI reads from canonical services only
- [ ] No UI-side truth computation
- [ ] No UI-side mutations
- [ ] Errors are surfaced, not coerced
- [ ] No reliance on timers/events
- [ ] No new schema
- [ ] No RLS changes
- [ ] No automation changes

---

**Status:** DESIGN COMPLETE — AWAITING APPROVAL

**Next Step:** Review and approve design before implementation