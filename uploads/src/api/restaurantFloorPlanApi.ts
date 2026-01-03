import { supabase } from '../lib/supabaseClient';

export type RestaurantFloorPlanRow = {
  restaurant_id: string;
  grid_size: number;
  canvas_w: number;
  canvas_h: number;
  created_at?: string;
  updated_at?: string;
};

export async function fetchRestaurantFloorPlan(
  restaurantId: string
): Promise<RestaurantFloorPlanRow | null> {
  if (!restaurantId) return null;

  const { data, error } = await supabase
    .from('restaurant_floor_plans')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .single();

  // Supabase “no rows” case → return null
  if (error && (error as any).code === 'PGRST116') return null;

  if (error) {
    console.error('[restaurantFloorPlanApi] fetch failed', error);
    throw error;
  }

  return data as RestaurantFloorPlanRow;
}

export async function upsertRestaurantFloorPlan(row: RestaurantFloorPlanRow): Promise<void> {
  if (!row?.restaurant_id) return;

  const { error } = await supabase
    .from('restaurant_floor_plans')
    .upsert(row, { onConflict: 'restaurant_id' });

  if (error) {
    console.error('[restaurantFloorPlanApi] upsert failed', error);
    throw error;
  }
}
