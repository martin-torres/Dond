// Phase 4B.2: Timer Service Initialization
// Purpose: Initialize auto-close timers (service layer only)
// Rule: BACKEND PROCESS ONLY - never from client, browser, or React
// Rule: SINGLETON - call once per process, never per user or per request
// Rule: Timers are started by service invocation, not by event consumption
// Rule: Event listeners are optional observability adapters only

import { initializeOptionalEventAdapter } from './optionalEventAdapterApi';

// ========================================
// TIMER SERVICE INITIALIZATION
// ========================================

/**
 * Initialize Phase 4B.2 Timer Service
 *
 * IMPORTANT:
 * Must run in a single backend process only.
 * DO NOT call from browser, React, Next.js client, or per-user context.
 *
 * What this does:
 * - Initializes optional event adapter (for observability)
 * - Enables timer scheduling when tables become eligible
 * - Timers function even if event adapter fails
 *
 * What this does NOT do:
 * - Close tables
 * - Update availability
 * - Store timer state
 * - Mutate orders or tables
 * - Require system_events table
 * - Require event adapter to work
 *
 * PRIMARY PATH (always works):
 * Eligibility Watcher → onTableEligibleForClosure(tableId) → Timer Service
 *
 * SECONDARY PATH (optional):
 * Eligibility Watcher → system_events → Optional Event Adapter → Timer Service
 *
 * CORRECT USAGE (backend only):
 * // server.ts, worker.ts, or edge function
 * import { initializeTimerService } from './api/initializeTimerService';
 * initializeTimerService();
 *
 * INCORRECT USAGE (will be rejected):
 * // src/App.tsx, src/main.tsx, or any React component
 * initializeTimerService(); // ❌ FORBIDDEN
 */
export function initializeTimerService(): void {
  console.info('[initializeTimerService] Phase 4B.2: Initializing timer service (BACKEND ONLY)');
  
  try {
    // Initialize optional event adapter (may fail, timers still work)
    // This is for observability only, NOT a control plane
    initializeOptionalEventAdapter();
    
    console.info('[initializeTimerService] Phase 4B.2 timer service started successfully');
    console.info('[initializeTimerService] Timers function even if event adapter fails');
  } catch (error) {
    console.error('[initializeTimerService] Failed to initialize optional event adapter:', error);
    console.info('[initializeTimerService] Timers still function (event adapter is optional)');
    // Do not crash the process - timers are advisory
  }
}

// ========================================
// MANUAL TRIGGER (TESTING ONLY)
// ========================================

/**
 * Manual trigger for testing
 *
 * TESTING ONLY.
 * MUST NOT be called from production flows.
 * MUST NOT be used as business logic.
 * Exists only to validate Phase 4B.2 timer service behavior.
 *
 * Usage (testing only):
 * import { testTimerService } from '../api/initializeTimerService';
 * testTimerService(tableId);
 */
export async function testTimerService(tableId: string): Promise<void> {
  console.warn('[testTimerService] TESTING ONLY - Manual trigger for table:', tableId);
  
  const { onTableEligibleForClosure } = await import('./tableTimerApi');
  await onTableEligibleForClosure(tableId);
}