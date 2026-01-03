import { RestaurantSettings as ApiRestaurantSettings } from '../api/restaurantSettingsApi';

export type RestaurantSettings = ApiRestaurantSettings;

export type FormSettings = {
  id: string;
  name: string;
  name_es: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  currency: string;
  tax_rate: string;
  service_fee: string;
  max_wait_time: string;
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
