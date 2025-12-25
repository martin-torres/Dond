import { supabase } from '../lib/supabaseClient';
import type { Language } from '../types';

export type StationType = 'foh' | 'bar' | 'kitchen';
export type MenuKind = 'food' | 'drink';

export type RestaurantMenuItemRow = {
  id: string;
  restaurant_id: string;
  kind: MenuKind;
  category: string | null;
  station: StationType;
  station_label: string | null;
  name: Record<Language, string>;
  description: Record<Language, string> | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export async function fetchRestaurantMenuItems(restaurantId: string): Promise<RestaurantMenuItemRow[]> {
  console.log('🔍 [restaurantMenuApi] Fetching menu items for restaurant:', restaurantId);
  
  if (!restaurantId) {
    console.warn('[restaurantMenuApi] No restaurantId provided');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('restaurant_menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .order('kind', { ascending: true })
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[restaurantMenuApi] Failed to fetch restaurant_menu_items', error);
      throw error;
    }

    const result = (data ?? []) as RestaurantMenuItemRow[];
    console.log('📊 [restaurantMenuApi] Found menu items:', {
      restaurantId,
      count: result.length,
      kinds: result.reduce((acc, item) => {
        acc[item.kind] = (acc[item.kind] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    });

    return result;
  } catch (error) {
    console.error('[restaurantMenuApi] Unexpected error:', error);
    throw error;
  }
}

export async function upsertRestaurantMenuItems(rows: RestaurantMenuItemRow[]): Promise<void> {
  if (!rows || rows.length === 0) return;

  const { error } = await supabase
    .from('restaurant_menu_items')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('[restaurantMenuApi] Failed to upsert restaurant_menu_items', error);
    throw error;
  }
}
