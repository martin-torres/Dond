// src/api/restaurantTablesApi.ts
import { supabase } from '../lib/supabaseClient';

export type RestaurantTableRow = {
  id: string;
  restaurant_id: string;
  display_name: string;
  table_number: number | null;
  seats: number | null;
  location: string | null;
  section: string | null;
  available: boolean;
  visible_to_customers: boolean;
  x: number | null;
  y: number | null;
  created_at?: string;
  updated_at?: string;
};

export async function fetchRestaurantTables(
  restaurantId: string
): Promise<RestaurantTableRow[]> {
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
export async function upsertRestaurantTables(rows: RestaurantTableRow[]): Promise<void> {
  if (!rows || rows.length === 0) return;

  const { error } = await supabase
    .from('restaurant_tables')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('[restaurantTablesApi] Failed to upsert restaurant_tables', error);
    throw error;
  }
}

