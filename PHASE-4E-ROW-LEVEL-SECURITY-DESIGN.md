# Phase 4E — Row Level Security (RLS) (DESIGN ONLY)

## Purpose
Introduce access control without altering truth, derivation, behavior, or enforcement semantics.

**RLS constrains who may read or write — never what is true.**

---

## 1. Position in the Canonical Flow (Final Phase)

### Enforcement Order (LOCKED)
1. Phase 4A — Hard DB enforcement
2. Phase 4F — Observation / logging
3. Phase 4B.1 — Eligibility watcher
4. Phase 4B.2 — Auto-close timers
5. Phase 4C — Availability read model
6. Phase 4D — UI visibility
7. **Phase 4E — RLS (this phase) ✅ LAST**

RLS is intentionally last because it can silently change system behavior if applied earlier.

---

## 2. Core Law (NON-NEGOTIABLE)

**RLS limits access; it must never change derived truth.**

RLS must **not**:
- Filter rows that truth derivation depends on
- Change aggregates
- Make `order_payment_status` inconsistent
- Hide data from services that derive truth

---

## 3. Absolute Rules (Hard Constraints)

### 3.1 What RLS MAY Do
- Restrict who can read data
- Restrict who can insert allowed rows
- Differentiate access by role (staff / customer / service)

### 3.2 What RLS MUST NOT Do
- ❌ Filter rows used in derived truth
- ❌ Hide partial order/payment data from derivation services
- ❌ Introduce "soft deletes" via policies
- ❌ Encode business logic
- ❌ Replace service-layer authorization
- ❌ Block system/service roles

---

## 4. Roles (Logical, Not Implemented Yet)

RLS policies reason about roles, not UI concepts.

| Role | Description |
|------|-------------|
| `service_role` | Backend services, automation, watchers |
| `staff_user` | Restaurant staff |
| `customer_user` | End customer |

Role mapping (JWT claims, auth providers) is out of scope here.

---

## 5. Table-by-Table RLS Strategy (Design)

### 5.1 orders

**service_role:**
- Full read
- Full write (existing flows)

**staff_user:**
- Read orders for their restaurant
- No updates

**customer_user:**
- Read orders scoped to their session/table only
- No updates

**❌ No updates allowed by any role (outside existing flows)**

**Critical invariant:**
All rows required by `order_payment_status` must be visible to `service_role`.

### 5.2 order_items

**Same visibility rules as orders**

**❌ No deletes**
**❌ No price mutation**

### 5.3 payments

**service_role:**
- Full read + INSERT

**staff_user:**
- Read-only (completed payments only)

**customer_user:**
- Read-only (their own completed payments only)

**❌ No updates**
**❌ No deletes**

**Critical invariant:**
`order_payment_status` must see all completed payments.

**Important clarification:**
Staff/customer payment actions occur via service endpoints, not direct INSERT permissions.

### 5.4 seats

**service_role:**
- Read + INSERT

**staff_user:**
- Read-only

**customer_user:**
- No access (unless explicitly expanded later)

Seats are labels only; hiding them must not affect payment truth.

### 5.5 order_payment_status (VIEW)

**Special rule:** Views inherit RLS behavior of underlying tables.

**Design requirement:**
- Any role allowed to read availability or payment summaries must see a consistent projection.
- Staff/customer roles may see filtered rows, but `service_role` must see all rows.
- If a role cannot safely see all rows:
  - That role must not query the view directly
  - It must go through a service endpoint

**Critical rule:**
- ❌ No explicit RLS policies may be added to `order_payment_status`
- ❌ It relies solely on underlying table visibility
- ❌ Any attempt to "fix" visibility via view-level RLS is forbidden

### 5.6 restaurants & restaurant_tables

**service_role:**
- Full read

**staff_user:**
- Read only for assigned restaurant

**customer_user:**
- Read only for the single table/session they are attached to

**❌ No writes via RLS**
**❌ No filtering that affects joins used in services**

---

## 6. Services vs Direct DB Access (Critical)

### 6.1 Canonical Rule
**Derived truth is accessed via services, not raw DB queries, for non-service roles.**

**Implication:**
- UI roles should not query `order_payment_status` directly
- UI calls services that run as `service_role`
- RLS enforces who can call what, not what truth is

---

## 7. No RLS on Derivation Logic

RLS must **never**:
- Be used to "simplify" availability
- Be used to hide unpaid orders
- Be used to imply closure

**If RLS changes a result:**
The policy is wrong by definition.

---

## 8. Failure Mode (Important)

**If RLS is misconfigured:**
- The correct behavior is **hard failure**
- Not silent filtering
- Not "best effort" truth
- Errors are preferable to corrupted truth

---

## 9. Explicitly Forbidden RLS Patterns

- ❌ `USING (is_paid = true)`
- ❌ `USING (table_available = true)`
- ❌ `USING (status != 'OPEN')`
- ❌ Filtering historical payments
- ❌ Policy logic that mirrors business rules

---

## 10. Verification Checklist (Design-Level)

Before implementation:

- [ ] `service_role` can read all rows required for derivation
- [ ] No policy filters affect `order_payment_status` math
- [ ] UI roles do not query derived views directly
- [ ] RLS encodes access only, not business meaning
- [ ] No policy hides unpaid or active rows
- [ ] No UPDATE / DELETE permissions introduced

---

## 11. What This Phase Does NOT Do

- ❌ Implement RLS
- ❌ Define JWT claims
- ❌ Bind auth provider
- ❌ Add columns
- ❌ Modify views
- ❌ Change services

This is design only.

---

## 12. Implementation Notes (For Future Phase)

### Policy Example (Conceptual)

```sql
-- orders table
-- service_role: full access
CREATE POLICY "service_role_full_access" ON orders
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- staff_user: read restaurant orders
CREATE POLICY "staff_user_read_restaurant" ON orders
  FOR SELECT TO staff_user
  USING (restaurant_id = current_setting('app.current_restaurant_id')::uuid);

-- customer_user: read own session orders
CREATE POLICY "customer_user_read_session" ON orders
  FOR SELECT TO customer_user
  USING (
    table_id IN (
      SELECT table_id FROM active_sessions
      WHERE customer_id = current_setting('app.current_customer_id')::uuid
    )
  );
```

### Critical Invariants

```sql
-- service_role must see ALL orders
-- This is non-negotiable
SELECT COUNT(*) FROM orders;
-- Must return same count for service_role regardless of RLS policies

-- order_payment_status must be consistent
SELECT order_id, is_payment_complete
FROM order_payment_status
WHERE order_id = 'some-order-id';
-- Must return same result for service_role regardless of RLS policies
```

---

## 13. Testing Strategy (Design-Level)

### Test Scenarios

1. **service_role sees all data**
   - Query `orders`, `payments`, `seats`
   - **Expected:** All rows visible
   - **Critical:** No filtering

2. **staff_user sees restaurant data**
   - Query `orders` for restaurant
   - **Expected:** Only restaurant orders
   - **Forbidden:** No access to other restaurants

3. **customer_user sees session data**
   - Query `orders` for session
   - **Expected:** Only session orders
   - **Forbidden:** No access to other sessions

4. **order_payment_status consistency**
   - Query `order_payment_status` as `service_role`
   - **Expected:** Same result as no RLS
   - **Critical:** No missing rows

5. **RLS misconfiguration fails hard**
   - Misconfigure policy
   - **Expected:** Hard failure
   - **Forbidden:** Silent filtering

---

## 14. Mental Model (IMPORTANT)

**RLS is a gatekeeper, not a truth-teller**
- RLS says "who may enter"
- RLS does not say "what is inside"
- RLS does not change what's inside

**RLS is a filter on access, not on truth**
- RLS filters who sees what
- RLS does not filter what exists
- RLS does not change what is true

**RLS is last for a reason**
- Truth is established first
- Derivation is defined first
- Access is controlled last
- This order is non-negotiable

**RLS errors are better than silent lies**
- If RLS misconfigures, fail hard
- Do not silently filter truth
- Do not "best effort" correctness
- Errors are honest

---

## 15. Open Questions (To Resolve Before Implementation)

1. **Role mapping:**
   - How are roles mapped from JWT claims?
   - How are roles mapped from auth provider?
   - How are roles validated?

2. **Session management:**
   - How are customer sessions tracked?
   - How are staff restaurant assignments tracked?
   - How are service roles authenticated?

3. **Policy testing:**
   - How to test RLS policies in isolation?
   - How to verify no truth corruption?
   - How to detect silent filtering?

4. **Performance:**
   - Do RLS policies affect query performance?
   - How to optimize without breaking invariants?
   - How to measure impact?

---

## 16. Approval Checklist

- [ ] Design respects all canonical rules
- [ ] RLS limits access only, not truth
- [ ] `service_role` sees all derivation data
- [ ] No policy filters affect `order_payment_status`
- [ ] UI roles do not query derived views directly
- [ ] RLS encodes access only, not business meaning
- [ ] No policy hides unpaid or active rows
- [ ] No UPDATE / DELETE permissions introduced
- [ ] Misconfiguration fails hard
- [ ] No business logic in policies
- [ ] No forbidden RLS patterns

---

**Status:** DESIGN COMPLETE — AWAITING APPROVAL

**Next Step:** Review and approve design before implementation