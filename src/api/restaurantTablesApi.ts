// src/api/restaurantTablesApi.ts
import { supabase } from '../lib/supabaseClient';

export type RestaurantTableRow = {
  id: string;
  restaurant_id: string;
  restaurant_slug?: string; // Human-readable restaurant identifier

  display_name: string | null;
  table_number: number | null;
  seats: number | null;

  location: string | null;
  section: string | null;

  // REMOVED: available - now derived from orders + payment status (canonical)
  visible_to_customers: boolean | null;

  x: number | null;
  y: number | null;

  // floorplan editor fields (safe to keep optional/nullable)
  shape?: string | null;
  rotation?: string | null;
  is_interactive?: boolean | null;

  created_at?: string;
  updated_at?: string;
};

export async function fetchRestaurantTables(restaurantId: string): Promise<RestaurantTableRow[]> {
  if (!restaurantId) return [];

  const { data, error } = await supabase
    .from('restaurant_tables')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('display_name', { ascending: true });

  if (error) {
    console.error('[restaurantTablesApi] Failed to fetch restaurant_tables', error);
    throw error;
  }

  return (data ?? []) as RestaurantTableRow[];
}

export async function fetchRestaurantTablesBySlug(restaurantSlug: string): Promise<RestaurantTableRow[]> {
  if (!restaurantSlug) return [];

  const { data, error } = await supabase
    .from('restaurant_tables')
    .select('*')
    .eq('restaurant_slug', restaurantSlug)
    .order('display_name', { ascending: true });

  if (error) {
    console.error('[restaurantTablesApi] Failed to fetch restaurant_tables by slug', error);
    throw error;
  }

  return (data ?? []) as RestaurantTableRow[];
}

export async function upsertRestaurantTables(rows: RestaurantTableRow[]): Promise<void> {
  if (!rows || rows.length === 0) return;

  const { error } = await supabase.from('restaurant_tables').upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('[restaurantTablesApi] Failed to upsert restaurant_tables', error);
    throw error;
  }
}
