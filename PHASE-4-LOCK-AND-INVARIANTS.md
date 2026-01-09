# 🔒 Phase 4 — Lock & Invariants Document

## System Truth, Derivation, and Access Are Now Frozen

---

## 0. Status Declaration (Non-Negotiable)

**Phase 4 is COMPLETE and LOCKED.**

From this point forward:
- Phase 4 components must not be modified
- Any change that affects Phase 4 invariants is a breaking change
- New behavior must be layered above Phase 4, never inside it
- If a change feels "small" or "harmless," it is almost certainly wrong

---

## 1. System Laws (Global, Eternal)

These laws apply to all future phases.

### 1.1 Truth Is Derived, Never Stored

There are **no truth flags** anywhere in the system.

**Forbidden forever:**
- `is_paid`
- `is_closed`
- `table_status`
- `available`
- `eligible`
- Any cached or materialized truth

**Truth is always computed from canonical inputs.**

### 1.2 Single Sources of Truth

| Concept | Authoritative Source |
|---------|---------------------|
| Payment completeness | `order_payment_status` (Phase 3A) |
| Eligibility | `canCloseTable(tableId)` |
| Availability | `getTableAvailability(tableId)` |
| UI state | Derived reads only |

**No other computation is valid.**

### 1.3 Observation ≠ Authority

Events, logs, timers, and signals are **never truth**.

They **may**:
- Observe
- Signal
- Log
- Notify humans

They **may never**:
- Decide
- Mutate
- Persist truth
- Influence derivation

---

## 2. Phase 4 Architecture (Frozen)

### 2.1 Phase Ordering (Locked)

1. Phase 4A — Hard DB Enforcement
2. Phase 4F — Observation / Logging
3. Phase 4B.1 — Eligibility Watcher
4. Phase 4B.2 — Auto-Close Timers
5. Phase 4C — Availability Read Model
6. Phase 4D — UI Visibility
7. Phase 4E — Row Level Security (LAST)

**Reordering is forbidden.**

---

## 3. Phase-by-Phase Invariants

### 🔐 Phase 4A — Hard Enforcement

- Database enforces mechanical integrity only
- No business meaning encoded
- No state transitions stored
- Payments are append-only

**Invariant:**
The database prevents invalid writes but never decides meaning.

### 👁 Phase 4F — Observation / Logging

- Observation exists
- Observation is optional
- Observation is ignorable
- Observation is failure-safe

**Invariant:**
The system must remain correct if all logging disappears.

### 👀 Phase 4B.1 — Eligibility Watcher

- Runs outside database transactions
- Post-commit only
- Re-derives eligibility
- Emits advisory signals only

**Forbidden:**
- DB triggers
- Stored eligibility
- Deduplication
- Closure logic

**Invariant:**
Watchers may observe eligibility but never act on it.

### ⏱ Phase 4B.2 — Auto-Close Timers

- Timers start only after eligibility is re-derived
- Timers re-check eligibility on expiry
- Timers never close tables
- Timers never mutate state
- Timers are disposable and lossy

**Invariant:**
Timers observe time, not truth.

### 📖 Phase 4C — Availability Read Model

- Availability is derived at read time only

**Definition:**
```
available =
  (active_order_count === 0)
  OR
  (unpaid_order_count === 0)
```

**Forbidden:**
- Availability columns
- Background recomputation
- Triggers
- Materialized views
- Event-based availability

**Invariant:**
Availability is a question, not a state.

### 🖥 Phase 4D — UI Visibility

- UI renders derived truth only
- UI never decides
- UI never mutates
- UI never computes truth
- UI never infers from events or timers

**Invariant:**
UI is a mirror, not a source.

### 🔐 Phase 4E — Row Level Security (RLS)

- RLS limits access only
- RLS never filters truth
- `service_role` must see all derivation data
- Views inherit underlying table policies
- No RLS on derived views

**Failure mode:**
RLS misconfiguration must fail hard, never silently filter.

**Invariant:**
RLS is a gatekeeper, not a truth-teller.

---

## 4. Forbidden Actions (Global)

These actions are **never allowed** anywhere in Phase 4 or beyond:

- Updating orders to "fix" state
- Deleting historical data
- Backfilling truth flags
- Encoding business logic in RLS
- Using events as inputs
- Letting UI decide closure or availability
- Caching derived truth internally

**If a proposal includes any of the above, it is invalid by definition.**

---

## 5. Allowed Writes (Hard Whitelist)

Only these writes are permitted:

| Table | Operation |
|-------|-----------|
| `payments` | INSERT ONLY |
| `seats` | INSERT ONLY |
| `system_events` | INSERT ONLY (optional) |

**Everything else is read-only in Phase 4.**

---

## 6. Failure Philosophy

This system prefers **honest failure** over silent corruption.

**Correct behaviors:**
- RLS error → hard failure
- Missing observation → ignored
- Timer loss → acceptable
- Partial reads → error, not guess

**Invariant:**
Incorrect truth is worse than no answer.

---

## 7. Change Management Rule

If someone proposes:
- "Just add a flag…"
- "We can cache this…"
- "Let the UI decide…"
- "RLS can simplify this…"

**The correct response is:**
❌ **Rejected — violates Phase 4 invariants.**

---

## 8. How to Build After Phase 4

All future work **must**:
- Read from Phase 4
- Never modify Phase 4
- Never bypass Phase 4 services
- Treat Phase 4 as immutable infrastructure

**Phase 4 is the bedrock.**

---

## 9. Final Lock Statement

**Phase 4 is now sealed.**

- Truth is correct
- Derivation is deterministic
- Observation is safe
- UI is subordinate
- Access is controlled without distortion

**Any deviation from this document is a system regression.**

---

**Status:** PHASE 4 COMPLETE AND LOCKED

**Date:** 2026-01-07

**Next Phase:** All future work builds upon Phase 4, never within it.