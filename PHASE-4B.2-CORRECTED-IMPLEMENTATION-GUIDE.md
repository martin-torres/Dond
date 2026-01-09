# Phase 4B.2 — Auto-Close Timers (CORRECTED IMPLEMENTATION)

## Overview
This document describes the **canonically correct** Phase 4B.2 implementation of auto-close timers for the restaurant app.

## Critical Corrections Applied

### ❌ ERROR 1 — Stored Timer State (FIXED)
**Violation:** `const activeTimers = new Map<string, NodeJS.Timeout>();`
**Status:** ✅ REMOVED

**What was wrong:**
- Stored timer state keyed by tableId
- Enabled implicit dedupe
- Enabled future cancellation
- Created identity for timers
- Violated "fire-and-forget"

**What is correct:**
```typescript
// Anonymous, stateless, disposable
setTimeout(async () => {
  await onAutoCloseTimerExpiry(tableId);
}, duration);
// No reference retained. No collections. No cleanup.
```

### ❌ ERROR 2 — Timer Cancellation (FIXED)
**Violation:** `export function cancelAutoCloseTimer(tableId: string): void`
**Status:** ✅ REMOVED

**What was wrong:**
- Cancellation implies identity
- Identity implies state
- State implies authority
- Function must not exist at all in Phase 4

**What is correct:**
- No cancellation mechanism exists
- Timers are fire-and-forget
- Eligibility changes handled by re-derivation on expiry

### ⚠️ ERROR 3 — Event Consumer as Control Plane (FIXED)
**Violation:** Event consumer treated system_events as an input plane
**Status:** ✅ REFRAMED AS OPTIONAL ADAPTER

**What was wrong:**
- Phrasing allowed assumption that events are required
- system_events treated as operational dependency
- Logic appeared to depend on persistence

**What is correct:**
- **Timers are started by service invocation, not by event consumption**
- Event listeners are optional observability adapters only
- This module MUST NOT be required for timer functionality
- Timers must function if system_events does not exist
- **Primary path:** Eligibility Watcher → Timer Service (direct call)
- **Secondary path:** Events → Optional Event Adapter → Timer Service (optional)

---

## Phase 4B.2 Goal (CORRECTED)
**Implement service-layer timers that observe eligibility and emit advisory events when timers expire.**

### Key Rules (NON-NEGOTIABLE)
1. ✅ Timers observe eligibility; they never decide closure
2. ✅ Re-derive eligibility at timer start and expiry
3. ✅ **NO state storage (timers are anonymous, stateless, disposable)**
4. ✅ No mutations (advisory events only)
5. ✅ Events are optional and never authoritative
6. ✅ **NO timer cancellation (fire-and-forget only)**
7. ❌ No table closure
8. ❌ No availability updates
9. ❌ No DB/cron timers
10. ❌ No UI changes

---

## Execution Model (Reconfirmed, Enforced)

### Service-Layer Timers (Stateless)
- **NOT** database cron / pg_cron
- **NOT** scheduled SQL jobs
- **NOT** triggers with pg_sleep
- **NOT** stored in tables
- **NOT** stored in memory maps
- **ONLY** anonymous `setTimeout` calls

### Timer Lifecycle (Stateless)
1. **Signal received** (optional, from Phase 4B.1)
2. **Re-derive eligibility** (fresh call to `canCloseTable`)
3. **If eligible**: Schedule timer (no reference retained)
4. **If not eligible**: Silent exit
5. **Timer expires**: Re-derive eligibility again
6. **Emit advisory event** (no mutations)

### Timer Loss is Acceptable (By Design)
- System restarts lose timers
- No state loss
- Eligibility will be re-observed later
- **No references retained means no cleanup needed**

---

## Files Created (CORRECTED)

### 1. `src/api/tableTimerApi.ts` (CORRECTED)
Core timer implementation with:
- `scheduleAutoCloseTimer(tableId)` - Schedule timer after re-deriving eligibility
- `onAutoCloseTimerExpiry(tableId)` - Handle timer expiry, re-check eligibility
- `onTableEligibleForClosure(tableId)` - Consume eligibility signal
- `manuallyTriggerTimer(tableId)` - Testing helper

**DELETED:**
- ❌ `activeTimers` Map
- ❌ `getActiveTimerCount()`
- ❌ `clearAllTimers()`
- ❌ `cancelAutoCloseTimer()`

### 2. `src/api/optionalEventAdapterApi.ts` (NEW, CORRECTED)
**Optional observability adapter (NOT a control plane):**
- `initializeOptionalEventAdapter()` - Start optional event adapter
- `watchSystemEvents()` - Subscribe to system_events (optional, may fail)
- `consumeEligibilitySignal(tableId)` - Direct invocation from watcher (PRIMARY PATH)
- `manuallyTriggerOptionalAdapter(tableId)` - Testing helper

**Key Rules:**
- Timers function WITHOUT this adapter
- Events are for humans and debuggers — never for logic
- PRIMARY PATH: Eligibility Watcher → Timer Service (direct call)
- SECONDARY PATH: Events → Optional Event Adapter → Timer Service (optional)

### 3. `src/api/initializeTimerService.ts` (CORRECTED)
Initialization entry point:
- `initializeTimerService()` - Start timer service (backend only)
- `testTimerService(tableId)` - Testing helper

**DELETED:**
- ❌ `timerEventConsumerApi.ts` (replaced by optionalEventAdapterApi.ts)

---

## How to Deploy Phase 4B.2 (CORRECTED)

### Prerequisites
- ✅ Phase 4B.1 deployed and running
- ✅ `system_events` table created (optional, not required)
- ✅ Backend process available (not client/browser)

### Step 1: Initialize Timer Service (BACKEND PROCESS ONLY)
```typescript
// BACKEND BOOTSTRAP ONLY
// Example: server.ts, worker.ts, edge function init
import { initializeTimerService } from '../api/initializeTimerService';

// Call once per backend process (singleton)
initializeTimerService();
```

**IMPORTANT:**
- Must run in a single backend process only
- DO NOT call from browser, React, Next.js client, or per-user context
- DO NOT call from src/App.tsx, src/main.tsx, or any React component

### Step 2: Verify Timer Service Is Running
Check browser console for initialization logs:
```
[initializeTimerService] Phase 4B.2: Initializing timer service (BACKEND ONLY)
[initializeOptionalEventAdapter] Phase 4B.2: Starting optional event adapter (NOT REQUIRED)
[watchSystemEvents] Initializing optional system_events watcher (may fail)
[watchSystemEvents] Subscription status (optional): SUBSCRIBED
[initializeOptionalEventAdapter] Optional event adapter initialized (timers work without this)
[initializeTimerService] Phase 4B.2 timer service started successfully
[initializeTimerService] Timers function even if event adapter fails
```

**Note:** If event adapter fails to subscribe, timers still function.

### Step 3: Test Timer Service (Optional)
```typescript
import { testTimerService } from '../api/initializeTimerService';

// Test with a specific table
await testTimerService('table-uuid-here');
```

### Step 4: Verify Events Are Emitted
Check browser console or system_events table:
```sql
SELECT * FROM system_events
WHERE event_type IN ('AutoCloseTimerStarted', 'AutoCloseTimerExpired', 'AutoCloseTimerExpiredNotEligible')
ORDER BY created_at DESC
LIMIT 10;
```

---

## Success Criteria (CORRECTED)

### This phase is successful if:
- ✅ Timer service initializes without errors
- ✅ Timers are scheduled when tables become eligible
- ✅ Timers are NOT scheduled when tables are not eligible
- ✅ Timer expiry re-checks eligibility
- ✅ Advisory events are emitted on timer start
- ✅ Advisory events are emitted on timer expiry
- ✅ No table mutations occur
- ✅ No availability updates occur
- ✅ **NO timer state is stored**
- ✅ **NO timer references are retained**
- ✅ **NO timer cancellation exists**
- ✅ **Timers function even if event adapter fails**
- ✅ **Event adapter is optional, not required**

---

## Testing Scenarios (CORRECTED)

### Scenario 1: Timer Starts When Eligible
1. Ensure table has paid orders (eligible)
2. Trigger `onTableEligibleForClosure(tableId)`
3. **Expected:**
   - `AutoCloseTimerStarted` event emitted
   - Timer scheduled (5 minutes default)
   - **No timer reference retained**

### Scenario 2: Timer Does Not Start When Not Eligible
1. Ensure table has unpaid orders (not eligible)
2. Trigger `onTableEligibleForClosure(tableId)`
3. **Expected:**
   - No timer scheduled
   - Silent exit

### Scenario 3: Timer Expiry (Still Eligible)
1. Schedule timer for eligible table
2. Wait 5 minutes (or manually trigger expiry)
3. **Expected:**
   - `AutoCloseTimerExpired` event emitted
   - **No cleanup needed (stateless)**

### Scenario 4: Timer Expiry (No Longer Eligible)
1. Schedule timer for eligible table
2. Add unpaid order (table becomes ineligible)
3. Wait for timer expiry
4. **Expected:**
   - `AutoCloseTimerExpiredNotEligible` event emitted
   - **No cleanup needed (stateless)**

### Scenario 5: Multiple Timers Allowed (CORRECTED)
1. Trigger timers for multiple eligible tables
2. **Expected:**
   - Multiple timers scheduled concurrently
   - **No deduplication**
   - **No tracking of active timers**
   - Each timer expires independently

### Scenario 6: Timer Loss on Restart (CORRECTED)
1. Schedule timers
2. Restart backend process
3. **Expected:**
   - All timers lost (acceptable by design)
   - No state loss
   - Eligibility re-observed when new signals arrive
   - **No cleanup needed (stateless)**

### Scenario 7: Event Adapter Failure (NEW)
1. Disable `system_events` table or realtime subscription
2. Initialize timer service
3. **Expected:**
   - Timer service initializes successfully
   - Event adapter fails gracefully
   - Timers still function via direct invocation
   - Logs indicate event adapter is optional

---

## Troubleshooting (CORRECTED)

### Timer Service Not Initializing
**Check:**
1. Supabase client is properly configured
2. Backend process is running (not client/browser)
3. No errors in console

**Note:** Event adapter failure does NOT prevent timer initialization.

### Timers Not Scheduling
**Check:**
1. Table is eligible (`canCloseTable` returns `eligible: true`)
2. Timer duration is configured (default 5 minutes)
3. No errors in `scheduleAutoCloseTimer`

**Note:** Event adapter subscription status does NOT affect timer scheduling.

### Timer Expiry Not Working
**Check:**
1. Timer is actually scheduled (check logs)
2. Timer duration has elapsed
3. No errors in `onAutoCloseTimerExpiry`

**Note:** There is no `getActiveTimerCount()` to check (stateless design).

### Events Not Emitting
**Check:**
1. `system_events` table exists (or check console)
2. No errors in `emitTimerEvent`
3. Event types are correct

**Note:** Event emission failure does NOT affect timer functionality.

---

## What NOT to Implement Yet (REITERATED)

**DO NOT implement:**
- ❌ Table closure logic (Phase 4B.3+)
- ❌ Availability updates (Phase 4C)
- ❌ UI indicators (Phase 4D)
- ❌ Staff notifications (Phase 4D)
- ❌ **Timer cancellation (not supported in Phase 4)**
- ❌ **Timer persistence (timer loss is acceptable)**
- ❌ **Timer state storage (stateless design)**
- ❌ **Timer deduplication (multiple timers allowed)**
- ❌ DB/cron timers (service layer only)

Those belong to later phases.

---

## Integration with Phase 4B.1 (CORRECTED)

### Option 1: Direct Invocation (PRIMARY PATH, RECOMMENDED)
Phase 4B.1 watcher directly calls `onTableEligibleForClosure(tableId)`.

**Pros:**
- No delay
- No `system_events` table required
- Simpler for single-process deployments
- **Always works**

**Cons:**
- Tighter coupling
- Requires both services in same process

### Option 2: Event-Based (SECONDARY PATH, OPTIONAL)
Phase 4B.1 emits `TableEligibleForClosure` events to `system_events` table.
Optional Event Adapter subscribes to these events and schedules timers.

**Pros:**
- Loose coupling
- Events are advisory
- Works across process boundaries

**Cons:**
- Requires `system_events` table
- Slight delay (realtime subscription)
- **Optional, may fail, timers still work**

**Recommendation:**
Use Option 1 (direct invocation) for production. Option 2 is acceptable for observability.

---

## Performance Considerations (CORRECTED)

### Timer Storage
- **No timer storage (stateless)**
- Each timer is a `setTimeout` (native)
- No database queries for timer management
- **No memory overhead for timer tracking**

### Event Emission
- Events are fire-and-forget
- No await on event emission
- Errors are logged but don't block flow

### Eligibility Re-derivation
- `canCloseTable` uses `order_payment_status` view
- View is optimized (indexed)
- Re-derivation is acceptable (2-3 queries per timer)

### Scalability
- **Stateless design scales infinitely**
- No shared state between timers
- No coordination overhead
- No cleanup overhead

---

## Mental Model (CORRECTED)

**Timers are observers, not actors**
- They watch eligibility, they don't decide closure
- They emit events, they don't mutate state
- They are advisory, not authoritative
- **They are anonymous, stateless, disposable**

**Events are signals, not commands**
- Events signal that something interesting happened
- Events do not trigger immediate action
- Events are logged, not processed
- **Events are optional, not required**

**Event Adapter is optional, not required**
- Timers function without event adapter
- Event adapter is for observability only
- Event adapter failure does not affect timers
- **Primary path is direct invocation**

**Phase 4B.2 is preparation, not execution**
- We're building the timing mechanism
- We're not building the acting mechanism
- Phase 4B.3 will consume these events
- **No state, no storage, no authority**

---

## Approval Checklist (CORRECTED)

- [x] Design respects all canonical rules
- [x] **NO state storage**
- [x] **NO timer references retained**
- [x] **NO timer cancellation**
- [x] **NO timer deduplication**
- [x] **Event adapter is optional**
- [x] **Timers function without event adapter**
- [x] No mutations
- [x] Re-derives eligibility on start and expiry
- [x] Events are advisory only
- [x] Timer loss is acceptable
- [x] Multiple timers are acceptable
- [x] No database changes
- [x] No UI changes
- [x] No enforcement changes

---

**Status:** CORRECTED IMPLEMENTATION COMPLETE — AWAITING APPROVAL

**Next Step:** Review and approve corrected implementation before deployment