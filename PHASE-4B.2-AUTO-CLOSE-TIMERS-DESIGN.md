# Phase 4B.2 — Auto-Close Timers (DESIGN ONLY)

## Purpose
Introduce time-based observation after eligibility is achieved, without storing state or deciding outcomes.

## Non-Goal (Explicit)
This phase does **NOT**:
- Close tables
- Update availability
- Store timer state

---

## 1. Position in the Canonical Flow

### Enforcement Order (unchanged)
1. Phase 4A — Hard DB enforcement ✅
2. Phase 4F — Observation / logging (declared)
3. Phase 4B.1 — Eligibility watcher ✅
4. **Phase 4B.2 — Auto-close timers (this phase)**
5. Phase 4C — Availability reads
6. Phase 4D — UI visibility
7. Phase 4E — RLS

### Dependency
Phase 4B.2 consumes **derived eligibility only** (via `canCloseTable(tableId)`), never events as truth.

---

## 2. Core Principle (NON-NEGOTIABLE)

**Timers observe eligibility; they never decide closure.**

### Timers:
- ✅ Start only after eligibility is observed as true
- ✅ Expire → re-check eligibility
- ✅ Emit logs/events only
- ❌ Never mutate tables or orders
- ❌ Never flip flags or store state

---

## 3. Inputs (Strict)

Phase 4B.2 may be invoked by an advisory signal **OR** directly by the eligibility watcher.

**Source may be:**
- Logs/events from Phase 4B.1 (optional)
- Direct invocation from the watcher

**Important:**
- Signals are **optional and never authoritative**
- Signals are **not truth**
- Eligibility **must be re-derived** at timer start and timer expiry

---

## 4. Timer Start Rules

A timer may be scheduled **if and only if**:
1. A signal indicates the table may be eligible, **AND**
2. A fresh call to `canCloseTable(tableId)` returns:
   ```typescript
   { eligible: true }
   ```

**If eligibility is false at scheduling time:**
- → Do nothing (silent exit)

---

## 5. Timer Duration (Configuration)

- Duration is **restaurant-configurable** (e.g., 3–10 minutes)
- Loaded at scheduling time
- **No persistence** of duration or start time in DB

---

## 6. Timer Expiry Behavior (CRITICAL)

### On timer expiry:
1. **Re-call** `canCloseTable(tableId)` (fresh derived read)
2. **If `eligible === true`:**
   - Emit `AutoCloseTimerExpired` (advisory log/event)
3. **If `eligible === false`:**
   - Emit `AutoCloseTimerExpiredNotEligible` (optional advisory)
   - Stop

### Explicitly Forbidden on Expiry:
- ❌ Closing tables
- ❌ Updating availability
- ❌ Mutating orders/tables
- ❌ Assuming eligibility persisted
- ❌ Using events as inputs

---

## 7. State & Deduplication (FORBIDDEN)

### ❌ No timer state stored:
- ❌ No "timer running" flags
- ❌ No dedupe tables
- ❌ No guarantees of "one timer per table"

### Acceptable Reality:
- ✅ Multiple timers may exist concurrently
- ✅ Multiple expiries may emit logs
- ✅ Derived truth remains authoritative

---

## 8. Failure & Retry Semantics

### Timer scheduling failures:
- Safe to ignore
- Eligibility will be re-observed later

### Timer execution failures:
- Safe to retry
- Must be idempotent

### System restarts:
- Timers may be lost
- This is acceptable (no state loss)

---

## 9. Database & Service Boundaries

### Database:
- ❌ No triggers
- ❌ No scheduling
- ❌ No state
- ❌ No decisions

### Services:
- ✅ Schedule timers (in-memory / queue / platform timers)
- ✅ Read views
- ✅ Re-derive eligibility
- ✅ Emit advisory events

---

## 10. Events (Advisory Only)

### Possible advisory emissions (names illustrative):
- `AutoCloseTimerStarted`
- `AutoCloseTimerExpired`
- `AutoCloseTimerExpiredNotEligible`

### Rules:
- Append-only
- Optional persistence
- Never read for truth
- Never used to decide availability or closure

---

## 11. What This Phase Does NOT Do (Reiterated)

- ❌ Close tables
- ❌ Update availability
- ❌ Mark anything paid/closed
- ❌ Touch UI
- ❌ Enforce RLS
- ❌ Store timer state
- ❌ Add DB schema

Those belong to later phases.

---

## 12. Verification Checklist (Design-Level)

Before implementation, all must be true:

- [ ] Timers start only after eligibility is re-derived as true
- [ ] Timer expiry always re-checks eligibility
- [ ] No mutation occurs on start or expiry
- [ ] Losing a timer causes no inconsistency
- [ ] Events/logs are advisory only

---

## 13. Implementation Notes (For Future Phase)

### Timer Storage Options:
1. **In-memory only** (lost on restart)
2. **Queue-based** (e.g., Redis, Bull, Celery)
3. **Platform timers** (e.g., Supabase Edge Functions, Cloudflare Workers)

### Recommended Approach:
- Use platform-native timer mechanism
- No database storage
- Idempotent expiry handlers

### Explicitly Forbidden Timer Mechanisms:
❌ Database cron / pg_cron
❌ Scheduled SQL jobs
❌ Triggers with pg_sleep
❌ Storing timers in tables

All timers must live entirely in the service layer.

### Example (illustrative only):
```typescript
// NOT implementation, just conceptual
async function onTableEligibleForClosure(tableId: string) {
  // Re-derive eligibility
  const result = await canCloseTable(tableId);
  if (!result.eligible) return; // Silent exit

  // Schedule timer (platform-specific)
  scheduleTimer(tableId, duration, async () => {
    // On expiry: re-check eligibility
    const result = await canCloseTable(tableId);
    if (result.eligible) {
      emitAutoCloseTimerExpired(tableId);
    } else {
      emitAutoCloseTimerExpiredNotEligible(tableId);
    }
  });
}
```

---

## 14. Dependencies

### Required:
- ✅ Phase 4B.1 (Eligibility Watcher)
- ✅ Phase 3B (`canCloseTable` service)
- ✅ Phase 3A (`order_payment_status` view)

### Not Required:
- ❌ Phase 4C+ (Availability, UI, RLS)

---

## 15. Testing Strategy (Design-Level)

### Test Scenarios:
1. **Timer starts when eligible**
   - Signal received → eligibility true → timer starts
2. **Timer does not start when not eligible**
   - Signal received → eligibility false → silent exit
3. **Timer expiry re-checks eligibility**
   - Timer expires → re-check → emit event if still eligible
4. **Timer expiry handles lost eligibility**
   - Timer expires → re-check → emit not eligible event
5. **Multiple timers allowed**
   - Multiple signals → multiple timers → all expire independently
6. **Timer loss is acceptable**
   - System restart → timers lost → no inconsistency

---

## 16. Risks & Mitigations

### Risk: Timer drift
- **Mitigation:** Re-derive eligibility on expiry

### Risk: Multiple timers
- **Mitigation:** Acceptable by design, no harm

### Risk: Timer loss
- **Mitigation:** Acceptable by design, eligibility re-observed later

### Risk: Eligibility changes during timer
- **Mitigation:** Re-check on expiry, handle both cases

---

## 17. Open Questions (To Resolve Before Implementation)

1. **Timer duration configuration:**
   - Where is restaurant config stored?
   - Default duration if not configured?

2. **Timer mechanism:**
   - In-memory (Node.js)?
   - Queue-based (Redis/Bull)?
   - Platform-native (Supabase Edge Functions)?

3. **Event persistence:**
   - Continue using `system_events` table?
   - Console logs only?
   - External logging service?

4. **Timer cancellation:**
   ❌ Not supported in Phase 4.
   Timers are fire-and-forget.
   Eligibility changes are handled only by re-derivation on expiry.

---

## 18. Approval Checklist

- [ ] Design respects all canonical rules
- [ ] No state storage
- [ ] No mutations
- [ ] Re-derives eligibility on start and expiry
- [ ] Events are advisory only
- [ ] Timer loss is acceptable
- [ ] Multiple timers are acceptable
- [ ] No database changes
- [ ] No UI changes
- [ ] No enforcement changes

---

**Status:** DESIGN COMPLETE — AWAITING APPROVAL

**Next Step:** Review and approve design before implementation