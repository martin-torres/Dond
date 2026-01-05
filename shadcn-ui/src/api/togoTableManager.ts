// src/api/togoTableManager.ts
import { supabase } from '../lib/supabaseClient';
import { RestaurantTableRow } from './restaurantTablesApi';

/**
 * Manages temporary to-go tables that are created on-demand and cleaned up after payment.
 * These tables don't appear in the floor plan and are automatically assigned.
 */

const TOGO_TABLE_PREFIX = 'togo';
const TOGO_SECTION = 'to-go';

/**
 * Find the next available to-go table number for a restaurant
 */
async function getNextToGoNumber(restaurantId: string): Promise<number> {
  const { data, error } = await supabase
    .from('restaurant_tables')
    .select('display_name')
    .eq('restaurant_id', restaurantId)
    .eq('section', TOGO_SECTION)
    .like('display_name', `${TOGO_TABLE_PREFIX}%`);

  if (error) {
    console.error('[togoTableManager] Error fetching existing to-go tables:', error);
    return 1;
  }

  if (!data || data.length === 0) {
    return 1;
  }

  // Extract numbers from display names like "togo1", "togo2", etc.
  const numbers = data
    .map(t => {
      const match = t.display_name?.match(/togo(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => n > 0);

  if (numbers.length === 0) {
    return 1;
  }

  // Return the next available number
  return Math.max(...numbers) + 1;
}

/**
 * Create a temporary to-go table for a customer order
 */
export async function createToGoTable(restaurantId: string, customerName?: string): Promise<RestaurantTableRow> {
  const togoNumber = await getNextToGoNumber(restaurantId);
  const displayName = `${TOGO_TABLE_PREFIX}${togoNumber}`;

  const newTable: Partial<RestaurantTableRow> = {
    restaurant_id: restaurantId,
    display_name: displayName,
    table_number: null, // To-go tables don't have physical table numbers
    seats: 0, // No seats for to-go
    location: null,
    section: TOGO_SECTION,
    available: true,
    visible_to_customers: false, // Don't show in floor plan
    x: null,
    y: null,
    shape: null,
    rotation: null,
    is_interactive: false,
  };

  const { data, error } = await supabase
    .from('restaurant_tables')
    .insert(newTable)
    .select()
    .single();

  if (error) {
    console.error('[togoTableManager] Error creating to-go table:', error);
    throw error;
  }

  console.log(`✅ Created to-go table: ${displayName} for restaurant ${restaurantId}`);
  return data as RestaurantTableRow;
}

/**
 * Delete a to-go table after the order is complete and paid
 */
export async function deleteToGoTable(tableId: string): Promise<void> {
  // First verify this is actually a to-go table
  const { data: table, error: fetchError } = await supabase
    .from('restaurant_tables')
    .select('section, display_name')
    .eq('id', tableId)
    .single();

  if (fetchError) {
    console.error('[togoTableManager] Error fetching table for deletion:', fetchError);
    throw fetchError;
  }

  if (table.section !== TOGO_SECTION) {
    console.warn('[togoTableManager] Attempted to delete non-to-go table:', tableId);
    throw new Error('Cannot delete non-to-go table through this API');
  }

  const { error: deleteError } = await supabase
    .from('restaurant_tables')
    .delete()
    .eq('id', tableId);

  if (deleteError) {
    console.error('[togoTableManager] Error deleting to-go table:', deleteError);
    throw deleteError;
  }

  console.log(`✅ Deleted to-go table: ${table.display_name} (${tableId})`);
}

/**
 * Check if a table is a to-go table
 */
export function isToGoTable(table: RestaurantTableRow | null | undefined): boolean {
  if (!table) return false;
  return table.section === TOGO_SECTION || table.display_name?.startsWith(TOGO_TABLE_PREFIX) || false;
}

/**
 * Get all active to-go tables for a restaurant
 */
export async function getActiveToGoTables(restaurantId: string): Promise<RestaurantTableRow[]> {
  const { data, error } = await supabase
    .from('restaurant_tables')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('section', TOGO_SECTION)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[togoTableManager] Error fetching active to-go tables:', error);
    throw error;
  }

  return (data || []) as RestaurantTableRow[];
}

/**
 * Clean up old to-go tables that have been abandoned (no orders in last 2 hours)
 */
export async function cleanupAbandonedToGoTables(restaurantId: string): Promise<number> {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  // Get all to-go tables older than 2 hours
  const { data: oldTables, error: fetchError } = await supabase
    .from('restaurant_tables')
    .select('id, display_name, created_at')
    .eq('restaurant_id', restaurantId)
    .eq('section', TOGO_SECTION)
    .lt('created_at', twoHoursAgo);

  if (fetchError) {
    console.error('[togoTableManager] Error fetching old to-go tables:', fetchError);
    return 0;
  }

  if (!oldTables || oldTables.length === 0) {
    return 0;
  }

  // Check each table for recent orders
  let cleanedCount = 0;
  for (const table of oldTables) {
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('table_id', table.id)
      .gte('created_at', twoHoursAgo)
      .limit(1);

    // If no recent orders, delete the table
    if (!recentOrders || recentOrders.length === 0) {
      try {
        await deleteToGoTable(table.id);
        cleanedCount++;
      } catch (err) {
        console.error('[togoTableManager] Failed to cleanup table:', table.id, err);
      }
    }
  }

  if (cleanedCount > 0) {
    console.log(`✅ Cleaned up ${cleanedCount} abandoned to-go tables`);
  }

  return cleanedCount;
}