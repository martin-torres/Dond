import { supabase } from '../lib/supabaseClient';

export type RestaurantSettings = {
  id: string;
  slug: string;
  name: {
    en: string;
    es: string;
  };
  address: string;
  phone: string;
  email: string;
  website: string;
  currency: string;
  tax_rate: number;
  service_fee: number;
  max_wait_time: number;
  allow_online_orders: boolean;
  allow_reservations: boolean;
  allow_table_requests: boolean;
  enable_notifications: boolean;
  enable_loyalty_program: boolean;
  enable_table_management: boolean;
  enable_kitchen_display: boolean;
  enable_bar_display: boolean;
  enable_foh_display: boolean;
  qr_code_enabled: boolean;
  demo_mode: boolean;
};

export async function fetchRestaurantSettings(restaurantId: string): Promise<RestaurantSettings | null> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', restaurantId)
    .single();

  if (error) {
    console.error('[restaurantSettingsApi] Failed to fetch restaurant settings:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    slug: data.slug,
    name: data.name || { en: '', es: '' },
    address: data.address || '',
    phone: data.phone || '',
    email: data.email || '',
    website: data.website || '',
    currency: data.currency || 'USD',
    tax_rate: data.tax_rate || 8.25,
    service_fee: data.service_fee || 0.00,
    max_wait_time: data.max_wait_time || 30,
    allow_online_orders: data.allow_online_orders ?? true,
    allow_reservations: data.allow_reservations ?? true,
    allow_table_requests: data.allow_table_requests ?? true,
    enable_notifications: data.enable_notifications ?? true,
    enable_loyalty_program: data.enable_loyalty_program ?? false,
    enable_table_management: data.enable_table_management ?? true,
    enable_kitchen_display: data.enable_kitchen_display ?? true,
    enable_bar_display: data.enable_bar_display ?? true,
    enable_foh_display: data.enable_foh_display ?? true,
    qr_code_enabled: data.qr_code_enabled ?? true,
    demo_mode: data.demo_mode ?? false,
  };
}

export async function updateRestaurantSettings(settings: Partial<RestaurantSettings> & { id: string }): Promise<void> {
  const { id, ...updateData } = settings;

  // Convert boolean values to proper format for Supabase
  const formattedData = {
    ...updateData,
    name: updateData.name ? updateData.name : undefined,
  };

  const { error } = await supabase
    .from('restaurants')
    .update(formattedData)
    .eq('id', id);

  if (error) {
    console.error('[restaurantSettingsApi] Failed to update restaurant settings:', error);
    throw error;
  }
}
