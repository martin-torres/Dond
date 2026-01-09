// Phase 4B.1: Eligibility Watchers Initialization
// Purpose: Simple entry point to start all eligibility watchers
// Rule: BACKEND PROCESS ONLY - never from client, browser, or React
// Rule: SINGLETON - call once per process, never per user or per request

import { initializeEligibilityWatchers } from './eligibilityWatcherApi';

/**
 * Initialize Phase 4B.1 Eligibility Watchers
 *
 * IMPORTANT:
 * Must run in a single backend process only.
 * DO NOT call from browser, React, Next.js client, or per-user context.
 *
 * Starts monitoring:
 * - Payments INSERT (via Supabase Realtime)
 * - Order Items INSERT (via Supabase Realtime)
 *
 * Execution Model:
 * - Out-of-database
 * - Post-commit observer
 * - NOT a Postgres trigger
 * - NOT inside a transaction
 * - BACKEND PROCESS ONLY (never client-side)
 *
 * What this does:
 * - Subscribes to realtime changes
 * - Calls handleOrderChange on each INSERT
 * - Emits TableEligibleForClosure events (advisory only)
 *
 * What this does NOT do:
 * - Start timers
 * - Schedule delayed jobs
 * - Change table availability
 * - Close tables
 * - Mutate orders or tables
 * - Add UI hooks
 * - Enable RLS
 * - Create DB triggers
 *
 * Those belong to Phase 4B.2+ ONLY.
 *
 * CORRECT USAGE (backend only):
 * // server.ts, worker.ts, or edge function
 * import { startEligibilityWatchers } from './api/initializeEligibilityWatchers';
 * startEligibilityWatchers();
 *
 * INCORRECT USAGE (will be rejected):
 * // src/App.tsx, src/main.tsx, or any React component
 * startEligibilityWatchers(); // ❌ FORBIDDEN
 */
export function startEligibilityWatchers(): void {
  console.info('[startEligibilityWatchers] Phase 4B.1: Initializing eligibility watchers (BACKEND ONLY)');
  
  try {
    initializeEligibilityWatchers();
    console.info('[startEligibilityWatchers] Phase 4B.1 watchers started successfully');
  } catch (error) {
    console.error('[startEligibilityWatchers] Failed to initialize watchers:', error);
    // Do not crash the process - watchers are advisory
  }
}

/**
 * Manual trigger for testing eligibility watcher
 *
 * Usage:
 * import { testEligibilityWatcher } from '../api/initializeEligibilityWatchers';
 * testEligibilityWatcher(orderId);
 */
export async function testEligibilityWatcher(orderId: number): Promise<void> {
  console.info('[testEligibilityWatcher] Testing eligibility watcher for order:', orderId);
  
  const { manuallyTriggerEligibilityCheck } = await import('./eligibilityWatcherApi');
  await manuallyTriggerEligibilityCheck(orderId);
}
