# Phase 4B.1 Verification Checklist

## Purpose
This document verifies that Phase 4B.1 meets all canonical requirements before approval.

---

## ✅ 1. Watcher Startup Location (BACKEND ONLY)

### Verification Items

#### ✅ Code Comments
- [x] `src/api/initializeEligibilityWatchers.ts` has explicit "BACKEND PROCESS ONLY" warning
- [x] Comments state: "DO NOT call from browser, React, Next.js client, or per-user context"
- [x] Comments state: "SINGLETON - call once per process, never per user or per request"

#### ✅ Correct Usage Examples
- [x] Documentation shows `server.ts`, `worker.ts`, or edge function as correct locations
- [x] Examples explicitly show backend-only usage

#### ✅ Incorrect Usage Warnings
- [x] Documentation explicitly forbids `src/App.tsx`, `src/main.tsx`
- [x] Documentation explicitly forbids React components
- [x] Documentation states "Multiple watcher instances (per user / per tab) are forbidden"
- [x] Documentation states "Realtime subscriptions per client are forbidden"

#### ✅ Function Signature
- [x] `startEligibilityWatchers()` has no client-specific dependencies
- [x] Function can be called from Node.js/backend environment
- [x] No browser-specific APIs used (localStorage, window, etc.)

---

## ✅ 2. Manual Trigger Guard (TESTING ONLY)

### Verification Items

#### ✅ Function Comments
- [x] `manuallyTriggerEligibilityCheck()` has explicit "TESTING ONLY" warning
- [x] Comments state: "MUST NOT be called from production flows"
- [x] Comments state: "MUST NOT be used as business logic"
- [x] Comments state: "Exists only to validate Phase 4B.1 watcher behavior"

#### ✅ Console Warnings
- [x] Function logs with `console.warn` (not `console.info`)
- [x] Warning message includes "TESTING ONLY" prefix

#### ✅ No Production Integration
- [x] Function is not called from any production flow
- [x] Function is only exposed for manual testing
- [x] No automatic triggers or scheduled calls

---

## ✅ 3. Phase 4B.1 Invariants

### Execution Model
- [x] OUT-OF-DATABASE (not Postgres triggers)
- [x] POST-COMMIT (after transactions complete)
- [x] NOT inside a transaction
- [x] NOT calling service logic from SQL

### Read-Consistency Guard
- [x] Retry logic implemented in `getTableIdForOrderWithRetry()`
- [x] Retry delay is 100ms (within 50-200ms range)
- [x] Retry happens only once
- [x] Silent exit if `table_id` still not found after retry
- [x] Retry is for visibility only, not for eligibility logic

### Advisory Events Only
- [x] Events logged to console if `system_events` insert fails
- [x] Events never read for business logic
- [x] `system_events` table has no id column (no identity semantics)
- [x] `system_events` table has no primary key
- [x] `system_events` table has no constraints
- [x] `system_events` table has no indexes
- [x] Events are append-only

### No Timers
- [x] No `setTimeout` calls
- [x] No `setInterval` calls
- [x] No delayed job scheduling
- [x] No timer storage

### No Closure Logic
- [x] No table closure functions
- [x] No availability updates
- [x] No state mutations
- [x] No "close table" logic

### No Mutations
- [x] No UPDATE statements
- [x] No DELETE statements
- [x] No state changes
- [x] Only INSERT into `system_events` (advisory)

### No UI Hooks
- [x] No React component changes
- [x] No state updates
- [x] No UI notifications
- [x] No client-side execution

### No RLS
- [x] No RLS policies added
- [x] No permission checks
- [x] No access control

### No DB Triggers
- [x] No Postgres triggers
- [x] No SQL-based event handlers
- [x] No in-database logic

---

## ✅ 4. Documentation Accuracy

### Implementation Guide (PHASE-4B.1-ELIGIBILITY-WATCHER-GUIDE.md)
- [x] Step 2 shows "BACKEND PROCESS ONLY" warning
- [x] Correct usage examples (server.ts, worker.ts)
- [x] Incorrect usage examples (src/App.tsx, src/main.tsx) marked as forbidden
- [x] No references to client-side initialization
- [x] All code examples are backend-only

### Completion Summary (PHASE-4B.1-COMPLETION-SUMMARY.md)
- [x] Step 2 shows "BACKEND PROCESS ONLY" warning
- [x] Correct usage examples (server.ts, worker.ts)
- [x] Incorrect usage examples marked as forbidden
- [x] No references to client-side initialization

### Code Comments
- [x] All files have consistent warnings
- [x] No contradictory instructions
- [x] Clear separation of backend vs frontend

---

## ✅ 5. File Integrity

### Core Files
- [x] `src/api/eligibilityWatcherApi.ts` - All functions present
- [x] `src/api/initializeEligibilityWatchers.ts` - Backend-only warnings
- [x] `sql-create-system-events-table.sql` - No constraints

### Documentation Files
- [x] `PHASE-4B.1-ELIGIBILITY-WATCHER-GUIDE.md` - Updated with backend-only
- [x] `PHASE-4B.1-COMPLETION-SUMMARY.md` - Updated with backend-only
- [x] `PHASE-4B.1-VERIFICATION-CHECKLIST.md` - This file

---

## ✅ 6. Canonical Compliance

### Truth Model
- [x] No stored flags (`is_paid`, `is_closed`, `table_status`, etc.)
- [x] Truth derived from `order_payment_status` view
- [x] Eligibility derived from `canCloseTable(tableId)`
- [x] No new columns added

### Phase Boundaries
- [x] Phases 0-3 frozen (not modified)
- [x] Phase 4B.1 only (no 4B.2+ features)
- [x] No enforcement logic
- [x] No UI changes

### Database vs Service Responsibility
- [x] Database enforces mechanics only (no business logic)
- [x] Services derive truth only (no state storage)
- [x] No DB triggers that call logic
- [x] No services that store state

### Post-Commit Reality
- [x] INSERT notification ≠ read consistency
- [x] Retry only for data visibility
- [x] Never retry eligibility logic
- [x] Realtime is best-effort

### Events Are Not State
- [x] Events append-only
- [x] Events optional persistence
- [x] Events never queried for truth
- [x] Events never used as inputs

### Automation Is Blind
- [x] Automation observes eligibility
- [x] Automation never decides closure
- [x] No "on timer expiry, close table" logic

### Allowed Writes
- [x] Only INSERT into `payments` (not in this phase)
- [x] Only INSERT into `seats` (not in this phase)
- [x] Only INSERT into `system_events` (advisory only)
- [x] No UPDATE, DELETE, or backfills

---

## ✅ 7. Testing Readiness

### Manual Testing
- [x] `manuallyTriggerEligibilityCheck()` available
- [x] `testEligibilityWatcher()` available
- [x] Both marked as TESTING ONLY
- [x] Console warnings present

### Automated Testing
- [x] Watcher initialization can be tested
- [x] Event emission can be verified
- [x] Read-consistency guard can be tested
- [x] No side effects to worry about

---

## ✅ 8. Deployment Readiness

### SQL Migration
- [x] `sql-create-system-events-table.sql` ready
- [x] Table creation is optional
- [x] No destructive operations

### Backend Integration
- [x] `startEligibilityWatchers()` ready to call
- [x] Function can be imported
- [x] No client dependencies
- [x] Singleton pattern enforced

### Monitoring
- [x] Console logs for initialization
- [x] Console logs for event emission
- [x] Error handling in place
- [x] No crashes on failure

---

## Final Verification

### All Critical Issues Resolved
- [x] **BLOCKING ISSUE RESOLVED**: Watcher startup location is backend-only
- [x] **REQUIRED GUARD ADDED**: Manual trigger has explicit TESTING-ONLY prohibition
- [x] **DOCUMENTATION UPDATED**: All references to client-side initialization removed
- [x] **CODE COMMENTS UPDATED**: All files have consistent warnings

### Phase 4B.1 Ready for Approval
- [x] One watcher instance only (backend singleton)
- [x] Events emitted correctly (advisory only)
- [x] No mutations (read-only except advisory events)
- [x] No timers (observation only)
- [x] No closure (preparation only)
- [x] No client-side execution (backend only)

---

## Conclusion

**Phase 4B.1 is COMPLETE and CANONICAL.**

All critical issues have been resolved:
1. ✅ Watcher startup location is backend-only
2. ✅ Manual trigger has TESTING-ONLY guard
3. ✅ All documentation is accurate
4. ✅ All invariants are maintained

**Status: READY FOR APPROVAL**

---

**Verification Date:** 2026-01-07  
**Verified By:** Phase 4B.1 Implementation  
**Next Step:** Deploy and test Phase 4B.1