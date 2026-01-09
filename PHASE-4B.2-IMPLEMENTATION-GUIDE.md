# Phase 4B.2 — Auto-Close Timers Implementation Guide

## Overview
This document describes the Phase 4B.2 implementation of auto-close timers for the restaurant app. Phase 4B.2 introduces time-based observation after eligibility is achieved, without storing state or deciding outcomes.

## Phase 4B.2 Goal
**Implement service-layer timers that observe eligibility and emit advisory events when timers expire.**

### Key Rules (NON-NEGOTIABLE)
1. ✅ Timers observe eligibility; they never decide closure
2. ✅ Re-derive eligibility at timer start and expiry
3. ✅ No state storage (in-memory only, lost on restart)
4. ✅ No mutations (advisory events only)
5. ✅ Events are optional and never authoritative
6. ❌ No table closure
7. ❌ No availability updates
8. ❌ No timer cancellation
9. ❌ No DB/cron timers
10. ❌ No UI changes

---

## Execution Model (Reconfirmed, Enforced)

### Service-Layer Timers
- **NOT** database cron / pg_cron
- **NOT** scheduled SQL jobs
- **NOT** triggers with pg_sleep
- **NOT** stored in tables
- **ONLY** in-memory, queue-based, or platform-native timers

### Timer Lifecycle
1. **Signal received** (optional, from Phase 4B.1)
2. **Re-derive eligibility** (fresh call to `canCloseTable`)
3. **If eligible**: Schedule timer
4. **If not eligible**: Silent exit
5. **Timer expires**: Re-derive eligibility again
6. **Emit advisory event** (no mutations)

### Timer Loss is Acceptable
- System restarts lose timers
- No state loss
- Eligibility will be re-observed later

---

## Files Created

### 1. `src/api/tableTimerApi.ts`
Core timer implementation with:
- `scheduleAutoCloseTimer(tableId)` - Schedule timer after re-deriving eligibility
- `onAutoCloseTimerExpiry(tableId)` - Handle timer expiry, re-check eligibility
- `onTableEligibleForClosure(tableId)` - Consume eligibility signal
- `manuallyTriggerTimer(tableId)` - Testing helper
- `getActiveTimerCount()` - Monitoring utility
- `clearAllTimers()` - Testing utility

### 2. `src/api/timerEventConsumerApi.ts`
Event consumer that bridges Phase 4B.1 and 4B.2:
- `initializeTimerEventConsumer()` - Start event consumer
- `watchTableEligibleForClosureEvents()` - Subscribe to system_events
- `consumeEligibilitySignal(tableId)` - Direct invocation from watcher
- `manuallyTriggerEventConsumer(tableId)` - Testing helper

### 3. `src/api/initializeTimerService.ts`
Initialization entry point:
- `initializeTimerService()` - Start timer service (backend only)
- `testTimerService(tableId)` - Testing helper

---

## How to Deploy Phase 4B.2

### Prerequisites
- ✅ Phase 4B.1 deployed and running
- ✅ `system_events` table created (optional)
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

**Correct Usage (backend only):**
```typescript
// server.ts, worker.ts, or edge function
import { initializeTimerService } from './api/initializeTimerService';
initializeTimerService();
```

**Incorrect Usage (will be rejected):**
```typescript
// src/App.tsx, src/main.tsx, or any React component
initializeTimerService(); // ❌ FORBIDDEN
```

### Step 2: Verify Timer Service Is Running
Check browser console for:
```
[initializeTimerService] Phase 4B.2: Initializing timer service (BACKEND ONLY)
[initializeTimerEventConsumer] Phase 4B.2: Starting timer event consumer
[watchTableEligibleForClosureEvents] Initializing system_events watcher
[watchTableEligibleForClosureEvents] Subscription status: SUBSCRIBED
[initializeTimerEventConsumer] Timer event consumer initialized
[initializeTimerService] Phase 4B.2 timer service started successfully
```

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

## Success Criteria

### This phase is successful if:
- ✅ Timer service initializes without errors
- ✅ Timers are scheduled when tables become eligible
- ✅ Timers are NOT scheduled when tables are not eligible
- ✅ Timer expiry re-checks eligibility
- ✅ Advisory events are emitted on timer start
- ✅ Advisory events are emitted on timer expiry
- ✅ No table mutations occur
- ✅ No availability updates occur
- ✅ Timer loss on restart is acceptable
- ✅ Multiple timers can exist concurrently

---

## Testing Scenarios

### Scenario 1: Timer Starts When Eligible
1. Ensure table has paid orders (eligible)
2. Trigger `onTableEligibleForClosure(tableId)`
3. **Expected:**
   - `AutoCloseTimerStarted` event emitted
   - Timer scheduled (5 minutes default)
   - `getActiveTimerCount()` returns 1

### Scenario 2: Timer Does Not Start When Not Eligible
1. Ensure table has unpaid orders (not eligible)
2. Trigger `onTableEligibleForClosure(tableId)`
3. **Expected:**
   - No timer scheduled
   - Silent exit
   - `getActiveTimerCount()` returns 0

### Scenario 3: Timer Expiry (Still Eligible)
1. Schedule timer for eligible table
2. Wait 5 minutes (or manually trigger expiry)
3. **Expected:**
   - `AutoCloseTimerExpired` event emitted
   - Timer removed from active timers
   - `getActiveTimerCount()` returns 0

### Scenario 4: Timer Expiry (No Longer Eligible)
1. Schedule timer for eligible table
2. Add unpaid order (table becomes ineligible)
3. Wait for timer expiry
4. **Expected:**
   - `AutoCloseTimerExpiredNotEligible` event emitted
   - Timer removed from active timers
   - `getActiveTimerCount()` returns 0

### Scenario 5: Multiple Timers Allowed
1. Trigger timers for multiple eligible tables
2. **Expected:**
   - Multiple timers scheduled concurrently
   - `getActiveTimerCount()` returns N
   - Each timer expires independently

### Scenario 6: Timer Loss on Restart
1. Schedule timers
2. Restart backend process
3. **Expected:**
   - All timers lost (acceptable)
   - No state loss
   - Eligibility re-observed when new signals arrive

---

## Troubleshooting

### Timer Service Not Initializing
**Check:**
1. Supabase client is properly configured
2. Realtime is enabled in Supabase dashboard
3. Backend process is running (not client/browser)
4. No errors in console

### Timers Not Scheduling
**Check:**
1. Table is eligible (`canCloseTable` returns `eligible: true`)
2. Timer duration is configured (default 5 minutes)
3. No errors in `scheduleAutoCloseTimer`
4. `getActiveTimerCount()` is increasing

### Timer Expiry Not Working
**Check:**
1. Timer is actually scheduled (check `getActiveTimerCount()`)
2. Timer duration has elapsed
3. No errors in `onAutoCloseTimerExpiry`
4. Eligibility is re-checked on expiry

### Events Not Emitting
**Check:**
1. `system_events` table exists (or check console)
2. No errors in `emitTimerEvent`
3. Event types are correct:
   - `AutoCloseTimerStarted`
   - `AutoCloseTimerExpired`
   - `AutoCloseTimerExpiredNotEligible`

---

## What NOT to Implement Yet

**DO NOT implement:**
- ❌ Table closure logic (Phase 4B.3+)
- ❌ Availability updates (Phase 4C)
- ❌ UI indicators (Phase 4D)
- ❌ Staff notifications (Phase 4D)
- ❌ Timer cancellation (not supported in Phase 4)
- ❌ Timer persistence (timer loss is acceptable)
- ❌ DB/cron timers (service layer only)

Those belong to later phases.

---

## Integration with Phase 4B.1

### Option 1: Event-Based (Recommended)
Phase 4B.1 emits `TableEligibleForClosure` events to `system_events` table.
Phase 4B.2 subscribes to these events and schedules timers.

**Pros:**
- Loose coupling
- Events are advisory
- Works across process boundaries

**Cons:**
- Requires `system_events` table
- Slight delay (realtime subscription)

### Option 2: Direct Invocation
Phase 4B.1 watcher directly calls `onTableEligibleForClosure(tableId)`.

**Pros:**
- No delay
- No `system_events` table required
- Simpler for single-process deployments

**Cons:**
- Tighter coupling
- Requires both services in same process

**Recommendation:**
Use Option 1 (event-based) for production. Option 2 is acceptable for testing.

---

## Performance Considerations

### Timer Storage
- In-memory timers are lightweight
- Each timer is a `setTimeout` (native)
- No database queries for timer management

### Event Emission
- Events are fire-and-forget
- No await on event emission
- Errors are logged but don't block flow

### Eligibility Re-derivation
- `canCloseTable` uses `order_payment_status` view
- View is optimized (indexed)
- Re-derivation is acceptable (2-3 queries per timer)

### Scalability
- Timers are per-table, not per-order
- Typical restaurant: 10-50 tables
- Even 100 concurrent timers is negligible

---

## Monitoring

### Console Logs
All timer operations are logged:
- Timer scheduling
- Timer expiry
- Eligibility checks
- Event emission

### Active Timer Count
```typescript
import { getActiveTimerCount } from '../api/tableTimerApi';
const count = getActiveTimerCount();
console.log('Active timers:', count);
```

### system_events Table
Query for timer events:
```sql
SELECT event_type, table_id, created_at, payload
FROM system_events
WHERE event_type LIKE 'AutoCloseTimer%'
ORDER BY created_at DESC
LIMIT 100;
```

---

## Rollback Plan

If Phase 4B.2 needs to be disabled:

1. **Stop calling `initializeTimerService()`**
2. **Keep `system_events` table** (append-only, no harm)
3. **Remove timer service imports**
4. **No database mutations to revert**

Timers are in-memory only, so stopping the service immediately stops all timers.

---

## Next Steps After Phase 4B.2

Once Phase 4B.2 is verified:

### Phase 4B.3: Table Closure Logic
- Consume `AutoCloseTimerExpired` events
- Actually close tables when eligible
- Update table availability

### Phase 4C: Availability Reads
- Expose table availability to UI
- Staff can see which tables are ready

### Phase 4D: UI Integration
- Show timer status in staff dashboard
- Display payment completeness
- Add staff override buttons

But NOT yet! Phase 4B.2 is about observation only.

---

**Phase 4B.2 Status:** Ready for implementation  
**Last Updated:** 2026-01-07