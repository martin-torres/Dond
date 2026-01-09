// Phase 4B.2: Auto-Close Timers
// Purpose: Time-based observation after eligibility is achieved
// Rule: Timers observe eligibility; they never decide closure
// Rule: No state storage, no mutations, advisory events only
// Rule: Timers are anonymous, stateless, disposable (no references retained)

import { canCloseTable } from './tableServicesApi';
import { supabase } from '../lib/supabaseClient';

// ========================================
// TYPES
// ========================================

export type TimerConfig = {
  durationMinutes: number;
};

export type TimerEvent = {
  event_type: string;
  table_id: string;
  payload?: any;
};

// ========================================
// TIMER CONFIGURATION
// ========================================

/**
 * Get timer duration configuration
 * Default: 5 minutes
 * Future: Load from restaurant settings
 */
function getTimerDuration(): number {
  // Default duration: 5 minutes
  // Future: Load from restaurant settings table
  const defaultDurationMinutes = 5;
  return defaultDurationMinutes * 60 * 1000; // Convert to milliseconds
}

// ========================================
// EVENT EMISSION (ADVISORY ONLY)
// ========================================

/**
 * Emit advisory timer event
 * Rule: Events are append-only, never read for truth
 */
async function emitTimerEvent(event: TimerEvent): Promise<void> {
  try {
    // Try to insert into system_events (if table exists)
    const { error } = await supabase.from('system_events').insert({
      event_type: event.event_type,
      table_id: event.table_id,
      order_id: null,
      payload: event.payload
    });

    if (error) {
      // If table doesn't exist or insert fails, log to console
      console.info('[emitTimerEvent] Advisory event (not persisted):', event);
    } else {
      console.info('[emitTimerEvent] Event emitted:', event.event_type, event.table_id);
    }
  } catch (err) {
    // Non-persistent fallback
    console.info('[emitTimerEvent] Event logged (insert failed):', event);
  }
}

// ========================================
// TIMER SCHEDULING
// ========================================

/**
 * Schedule auto-close timer for a table
 * Rule: Timer starts only after eligibility is re-derived as true
 * Rule: If not eligible, silent exit (no timer)
 * Rule: Timers are anonymous, stateless, disposable (no references retained)
 */
export async function scheduleAutoCloseTimer(tableId: string): Promise<void> {
  try {
    console.info('[scheduleAutoCloseTimer] Checking eligibility for table:', tableId);

    // CRITICAL: Re-derive eligibility at timer start
    const result = await canCloseTable(tableId);

    if (!result.eligible) {
      // Silent exit: table is not eligible
      console.info('[scheduleAutoCloseTimer] Table not eligible, no timer scheduled:', tableId);
      return;
    }

    // Table is eligible: schedule timer
    const duration = getTimerDuration();
    console.info('[scheduleAutoCloseTimer] Scheduling timer for table:', tableId, 'duration:', duration, 'ms');

    // Emit advisory event: timer started
    await emitTimerEvent({
      event_type: 'AutoCloseTimerStarted',
      table_id: tableId,
      payload: { duration_ms: duration }
    });

    // Schedule timer (anonymous, stateless, disposable)
    // CRITICAL: No reference retained, no storage, no cleanup
    setTimeout(async () => {
      await onAutoCloseTimerExpiry(tableId);
    }, duration);

    console.info('[scheduleAutoCloseTimer] Timer scheduled successfully:', tableId);
  } catch (error) {
    console.error('[scheduleAutoCloseTimer] Error scheduling timer:', error);
    // Safe to ignore: eligibility will be re-observed later
  }
}

// ========================================
// TIMER EXPIRY HANDLER (CRITICAL)
// ========================================

/**
 * Handle timer expiry
 * Rule: Always re-check eligibility on expiry
 * Rule: Emit advisory event only, no mutations
 */
async function onAutoCloseTimerExpiry(tableId: string): Promise<void> {
  try {
    console.info('[onAutoCloseTimerExpiry] Timer expired for table:', tableId);

    // CRITICAL: Re-derive eligibility at timer expiry
    const result = await canCloseTable(tableId);

    if (result.eligible) {
      // Table is still eligible: emit advisory event
      console.info('[onAutoCloseTimerExpiry] Table still eligible:', tableId);
      await emitTimerEvent({
        event_type: 'AutoCloseTimerExpired',
        table_id: tableId,
        payload: { reason: 'timer_expired_still_eligible' }
      });
    } else {
      // Table is no longer eligible: emit advisory event
      console.info('[onAutoCloseTimerExpiry] Table no longer eligible:', tableId);
      await emitTimerEvent({
        event_type: 'AutoCloseTimerExpiredNotEligible',
        table_id: tableId,
        payload: { reason: 'timer_expired_not_eligible' }
      });
    }

    // CRITICAL: No cleanup needed (timers are stateless)
  } catch (error) {
    console.error('[onAutoCloseTimerExpiry] Error handling timer expiry:', error);
    // Safe to ignore: no state loss
  }
}

// ========================================
// EVENT CONSUMER (FROM PHASE 4B.1)
// ========================================

/**
 * Consume TableEligibleForClosure signal
 * Rule: Signals are optional and never authoritative
 * Rule: Re-derive eligibility before scheduling timer
 */
export async function onTableEligibleForClosure(tableId: string): Promise<void> {
  console.info('[onTableEligibleForClosure] Received eligibility signal for table:', tableId);
  await scheduleAutoCloseTimer(tableId);
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
 * Exists only to validate Phase 4B.2 timer behavior.
 */
export async function manuallyTriggerTimer(tableId: string): Promise<void> {
  console.warn('[manuallyTriggerTimer] TESTING ONLY - Manual trigger for table:', tableId);
  await scheduleAutoCloseTimer(tableId);
}
