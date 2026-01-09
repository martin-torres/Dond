# Phase 5 — UI Feature Layer (Built On Top of Phase 4)

## Status: ALLOWED

**Scope:** UI + UX only  
**Authority:** ZERO  
**Truth Source:** Phase 4 services only

---

## 0. Ground Rules (Re-asserted)

Before anything UI-related is written, these are **non-negotiable**:

**UI never:**
- Decides truth
- Mutates tables or orders
- Computes payment math
- Infers from events or timers
- Stores availability, eligibility, or payment state

**UI may only:**
- Read
- Render
- Trigger existing allowed write flows (e.g., payment INSERT)

---

## 1. UI Architecture (Clean Separation)

### 1.1 UI → Service → DB Flow

```
UI Component
   ↓ (read-only request)
Service Layer (service_role)
   ↓
Phase 4 Derived Truth
```

**UI roles never query DB directly for truth.**

---

## 2. Canonical UI Read APIs (Do Not Invent New Ones)

UI may call **only** these:

### 2.1 Table Availability (Phase 4C)

```
GET /tables/{tableId}/availability
→ getTableAvailability(tableId)
```

**Returns:**
```json
{
  "table_id": "uuid",
  "available": boolean,
  "active_order_count": number,
  "unpaid_order_count": number
}
```

### 2.2 Payment Summary (Phase 3B)

```
GET /tables/{tableId}/payment-summary
→ getTablePaymentSummary(tableId)
```

**Returns:**
- remaining balance
- completeness
- order list
- completed payments

---

## 3. Staff UI — Features You MAY Build

### 3.1 Floor / Table List View

**Allowed UI elements:**
- Availability badge (Available / Occupied)
- Active order count
- Remaining balance
- Payment completeness indicator

**Source mapping:**

| UI Element | Source |
|------------|--------|
| Availability | `getTableAvailability` |
| Balance | `getTablePaymentSummary` |
| Order count | Derived from summary |

**Explicitly forbidden:**
- Close table button
- Manual availability toggle
- Mark paid
- Override eligibility

### 3.2 Table Detail View (Staff)

**Allowed:**
- Order list (read-only)
- Payment history (completed only)
- Remaining balance
- "Add payment" flow (existing INSERT-only payment)

**Forbidden:**
- Any button that changes order/table state
- Any UI-side math
- Any "confirm closure" interaction

---

## 4. Customer UI — Features You MAY Build

### 4.1 Session View

**Allowed:**
- Remaining balance
- Payment completeness status
- Order list
- Payment history (completed only)
- Pay remaining balance

**Forbidden:**
- Availability for other tables
- Any closure-related UI
- Any inferred state from timers/events

---

## 5. Real-Time Updates (Optional, Safe Pattern)

UI may refresh by re-reading, never by trusting events.

**Allowed Pattern:**
```
Event / Poll / WebSocket
     ↓
Trigger UI refresh
     ↓
Re-call derived services
```

**Forbidden Pattern:**
```
Event → UI assumes availability/closure
```

**If the refresh fails → show error state, not guessed truth.**

---

## 6. UI Error Handling (Critical)

**Correct behavior:**
- If availability read fails → show error
- If payment summary fails → show error
- Do not assume "not available"
- Do not degrade into decisions

**Errors are honest. Silence is dangerous.**

---

## 7. Client State Rules

**Allowed:**
- Temporary component state
- Request-scoped caching
- View-model shaping

**Forbidden:**
- Persisting availability
- Persisting payment completeness
- Optimistic truth updates
- Client-side derivation

**Rule of thumb:**
If a refresh would change the value, it must not be stored.

---

## 8. UI Test Matrix (You Should Actually Run These)

### Staff UI
- [ ] Table becomes paid → UI refresh shows available
- [ ] Partial payment → UI still shows occupied
- [ ] Read fails → error state
- [ ] Events dropped → UI still correct on refresh

### Customer UI
- [ ] Payment inserted → balance updates on refresh
- [ ] Other tables invisible
- [ ] Session isolation enforced

---

## 9. What You Build NEXT (Concrete)

### Immediate Safe Wins
- Staff floor map with availability badges
- Staff table detail view (read-only + pay)
- Customer session payment view
- Error states everywhere

### What You Still Do NOT Build
- Auto-close UX
- Manual overrides
- Availability toggles
- Closure confirmations

**Those would require new phases, not UI work.**

---

## 10. Mental Model (For All UI Work)

```
UI asks questions
   ↓
Services answer
   ↓
UI displays
```

**UI never decides.**

If a UI feature requires a decision:
→ It does not belong in UI.

---

## 11. Where You Are Now

- ✅ Phase 4 fully locked
- ✅ Truth model sound
- ✅ Derivation consistent
- ✅ RLS isolated
- 🟢 Phase 5 UI is now safe to build

---

## 12. Implementation Notes (For Future Work)

### Staff Floor Map Component (Conceptual)

```typescript
function StaffFloorMap() {
  const { data: tables, error } = useTables();
  
  if (error) {
    return <ErrorState message="Failed to load tables" />;
  }
  
  return (
    <div className="floor-map">
      {tables.map(table => (
        <TableCard
          key={table.id}
          tableId={table.id}
          // Availability from Phase 4C
          availability={useTableAvailability(table.id)}
          // Payment summary from Phase 3B
          paymentSummary={usePaymentSummary(table.id)}
          // No close button
          // No manual toggle
        />
      ))}
    </div>
  );
}
```

### Customer Session View (Conceptual)

```typescript
function CustomerSessionView({ tableId }) {
  const { data: paymentSummary, error } = usePaymentSummary(tableId);
  
  if (error) {
    return <ErrorState message="Failed to load payment status" />;
  }
  
  return (
    <div className="session-view">
      <RemainingBalance amount={paymentSummary.remaining_balance} />
      <PaymentCompleteness status={paymentSummary.completeness} />
      <OrderList orders={paymentSummary.orders} />
      <PaymentHistory payments={paymentSummary.completed_payments} />
      <PayButton
        amount={paymentSummary.remaining_balance}
        // Triggers existing payment INSERT flow
        onPay={insertPayment}
      />
      {/* No availability for other tables */}
      {/* No closure controls */}
    </div>
  );
}
```

---

## 13. Open Questions (To Resolve Before Implementation)

1. **Real-time mechanism:**
   - WebSocket, polling, or SSE?
   - How often to refresh?
   - How to handle stale data?

2. **Error display:**
   - Retry button UI?
   - Auto-retry with backoff?
   - Degraded state indicators?

3. **Access control:**
   - Which roles see which data?
   - Customer vs staff visibility boundaries?
   - (Note: RLS is Phase 4E, already defined)

4. **UI state management:**
   - Client-side caching strategy?
   - Optimistic updates allowed?
   - (Must not store as truth)

---

## 14. Approval Checklist

- [ ] UI never decides truth
- [ ] UI never mutates tables or orders
- [ ] UI never computes payment math
- [ ] UI never infers from events or timers
- [ ] UI never stores availability, eligibility, or payment state
- [ ] UI reads from canonical services only
- [ ] UI roles never query DB directly
- [ ] Errors are surfaced, not coerced
- [ ] Real-time updates re-read services
- [ ] Client state is temporary only

---

**Status:** DESIGN COMPLETE — AWAITING APPROVAL

**Next Step:** Review and approve design before implementation