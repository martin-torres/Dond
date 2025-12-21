import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Restaurant } from '../types';

export type FetchRestaurantsResult = {
  data: Restaurant[];
  liveDataUnavailable: boolean;
  error?: string;
};

export type FetchRestaurantByIdResult = {
  data: Restaurant | null;
  liveDataUnavailable: boolean;
  error?: string;
};

export const restaurantsInitial: Restaurant[] = [];

export async function fetchRestaurants(): Promise<FetchRestaurantsResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: [], liveDataUnavailable: true, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase.from<Restaurant>('restaurants').select('*');
    if (error) {
      // eslint-disable-next-line no-console
      console.error('fetchRestaurants supabase error', error);
      return { data: [], liveDataUnavailable: true, error: error.message };
    }

    if (!data || data.length === 0) {
      return { data: [], liveDataUnavailable: true };
    }

    return { data, liveDataUnavailable: false };
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('fetchRestaurants unexpected error', e);
    return { data: [], liveDataUnavailable: true, error: String(e?.message ?? e) };
  }
}

export async function fetchRestaurantById(id: string): Promise<FetchRestaurantByIdResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: null, liveDataUnavailable: true, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase.from<Restaurant>('restaurants').select('*').eq('id', id).limit(1).single();
    if (error) {
      // eslint-disable-next-line no-console
      console.error('fetchRestaurantById supabase error', error);
      return { data: null, liveDataUnavailable: true, error: error.message };
    }

    if (!data) {
      return { data: null, liveDataUnavailable: true };
    }

    return { data, liveDataUnavailable: false };
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('fetchRestaurantById unexpected error', e);
    return { data: null, liveDataUnavailable: true, error: String(e?.message ?? e) };
  }
}
