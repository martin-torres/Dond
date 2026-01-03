import { supabase } from '../lib/supabaseClient';
import type { Language } from '../types';

export type LayoutType = 'full_width' | 'two_column' | 'three_column';
export type MenuCategory = 'food' | 'drinks' | 'all';

export type PromoRow = {
  id: string;
  restaurant_id: string;
  title: Record<Language, string>;
  description: Record<Language, string> | null;
  discount_percent: number;
  discount_amount: number;
  image_url: string | null;
  menu_item_id: string | null;
  menu_category: MenuCategory | null;
  layout_type: LayoutType;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at?: string;
  updated_at?: string;
};

export type EventRow = {
  id: string;
  restaurant_id: string;
  title: Record<Language, string>;
  description: Record<Language, string> | null;
  image_url: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export async function fetchRestaurantPromos(restaurantId: string): Promise<PromoRow[]> {
  if (!restaurantId) return [];

  const { data, error } = await supabase
    .from('promos')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[promosEventsApi] Failed to fetch promos', error);
    throw error;
  }

  return (data ?? []) as PromoRow[];
}

export async function fetchRestaurantEvents(restaurantId: string): Promise<EventRow[]> {
  if (!restaurantId) return [];

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('is_active', true)
    .order('event_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    console.error('[promosEventsApi] Failed to fetch events', error);
    throw error;
  }

  return (data ?? []) as EventRow[];
}

export async function upsertRestaurantPromos(promos: PromoRow[]): Promise<void> {
  if (!promos || promos.length === 0) return;

  const { error } = await supabase
    .from('promos')
    .upsert(promos, { onConflict: 'id' });

  if (error) {
    console.error('[promosEventsApi] Failed to upsert promos', error);
    throw error;
  }
}

export async function upsertRestaurantEvents(events: EventRow[]): Promise<void> {
  if (!events || events.length === 0) return;

  const { error } = await supabase
    .from('events')
    .upsert(events, { onConflict: 'id' });

  if (error) {
    console.error('[promosEventsApi] Failed to upsert events', error);
    throw error;
  }
}

export async function deletePromo(promoId: string): Promise<void> {
  const { error } = await supabase
    .from('promos')
    .delete()
    .eq('id', promoId);

  if (error) {
    console.error('[promosEventsApi] Failed to delete promo', error);
    throw error;
  }
}

export async function deleteEvent(eventId: string): Promise<void> {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  if (error) {
    console.error('[promosEventsApi] Failed to delete event', error);
    throw error;
  }
}
