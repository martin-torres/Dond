// Phase 4B.2: Optional Event Adapter
// Purpose: Optional observability adapter for timer events (NOT a control plane)
// Rule: Timers are started by service invocation, not by event consumption
// Rule: Event listeners are optional observability adapters only
// Rule: This module MUST NOT be required for timer functionality
// Rule: Timers must function if system_events does not exist
// Rule: Primary path is Eligibility Watcher → Timer Service (direct call)
// Rule: Event listeners are secondary, optional, and disposable

import { onTableEligibleForClosure } from './tableTimerApi';
import { supabase } from '../lib/supabaseClient';

// ========================================
// OPTIONAL EVENT ADAPTER (NOT CONTROL PLANE)
// ========================================

/**
 * Initialize Optional Event Adapter
 *
 * IMPORTANT:
 * This is an OPTIONAL observability adapter, NOT a control plane.
 * Timers function without this adapter.
 * Events are for humans and debuggers — never for logic.
 *
 * What this does:
 * - Subscribes to system_events table (if available)
 * - Logs events for observability
 * - Triggers timer scheduling (fire-and-forget)
 *
 * What this does NOT do:
 * - NOT required for timer functionality
 * - NOT a control plane
 * - NOT authoritative
 * - NOT part of the primary path
 *
 * Primary Path (always works):
 * Eligibility Watcher → onTableEligibleForClosure(tableId) → Timer Service
 *
 * Secondary Path (optional):
 * Eligibility Watcher → system_events → Optional Event Adapter → Timer Service
 */
export function initializeOptionalEventAdapter(): void {
  console.info('[initializeOptionalEventAdapter] Phase 4B.2: Starting optional event adapter (NOT REQUIRED)');

  // Subscribe to system_events table (optional, may fail)
  watchSystemEvents();

  console.info('[initializeOptionalEventAdapter] Optional event adapter initialized (timers work without this)');
}

// ========================================
// REALTIME SUBSCRIPTION (OPTIONAL)
// ========================================

/**
 * Watch system_events for observability
 *
 * OPTIONAL: This subscription may fail or be disabled.
 * Timers continue to function without this.
 *
 * Purpose: Observability only, not control.
 */
function watchSystemEvents(): void {
  console.info('[watchSystemEvents] Initializing optional system_events watcher (may fail)');

  const channel = supabase
    .channel('system-events-optional-adapter')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'system_events'
      },
      (payload) => {
        const eventType = payload.new.event_type;
        const tableId = payload.new.table_id;

        // Filter for TableEligibleForClosure events only
        if (eventType === 'TableEligibleForClosure' && tableId) {
          console.info('[watchSystemEvents] Received TableEligibleForClosure event (optional):', tableId);
          
          // Consume event (fire-and-forget, non-blocking)
          // CRITICAL: Events are advisory, re-derive eligibility in timer layer
          onTableEligibleForClosure(tableId).catch((error) => {
            console.error('[watchSystemEvents] Error consuming event (safe to ignore):', error);
          });
        }
      }
    )
    .subscribe((status) => {
      console.info('[watchSystemEvents] Subscription status (optional):', status);
      
      if (status === 'SUBSCRIBED') {
        console.info('[watchSystemEvents] Optional event adapter subscribed (timers work without this)');
      } else {
        console.warn('[watchSystemEvents] Optional event adapter NOT subscribed (timers still work)');
      }
    });
}

// ========================================
// DIRECT INVOCATION (PRIMARY PATH)
// ========================================

/**
 * Direct invocation from Phase 4B.1 watcher (PRIMARY PATH)
 *
 * This is the PRIMARY path for timer scheduling.
 * Events are SECONDARY and OPTIONAL.
 *
 * Rule: Signals are optional and never authoritative
 */
export async function consumeEligibilitySignal(tableId: string): Promise<void> {
  console.info('[consumeEligibilitySignal] Received direct eligibility signal (PRIMARY PATH):', tableId);
  await onTableEligibleForClosure(tableId);
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
 * Exists only to validate Phase 4B.2 optional event adapter behavior.
 */
export async function manuallyTriggerOptionalAdapter(tableId: string): Promise<void> {
  console.warn('[manuallyTriggerOptionalAdapter] TESTING ONLY - Manual trigger for table:', tableId);
  await onTableEligibleForClosure(tableId);
}