import { UUID } from 'crypto';

// App Fees Types
export interface AppFee {
  id: UUID;
  fee_type: 'percentage' | 'fixed' | 'recurring';
  amount: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAppFee {
  fee_type: AppFee['fee_type'];
  amount: number;
  description?: string | null;
}

export interface UpdateAppFee extends Partial<CreateAppFee> {
  id: UUID;
}

// Restaurant Fees Types
export interface RestaurantFee {
  id: UUID;
  restaurant_id: UUID;
  fee_id: UUID;
  custom_amount: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  app_fee?: AppFee;
}

export interface CreateRestaurantFee {
  restaurant_id: UUID;
  fee_id: UUID;
  custom_amount?: number | null;
  is_active?: boolean;
}

export interface UpdateRestaurantFee extends Partial<CreateRestaurantFee> {
  id: UUID;
}

// Analytics Types
export interface RestaurantAnalytics {
  id: UUID;
  restaurant_id: UUID;
  event_type: string;
  timestamp: string;
  duration_ms: number | null;
  stage: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface CreateRestaurantAnalytics {
  restaurant_id: UUID;
  event_type: string;
  duration_ms?: number | null;
  stage?: string | null;
  metadata?: Record<string, any>;
}

export interface AnalyticsQuery {
  restaurant_id?: UUID;
  event_type?: string;
  stage?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

// Communications Types
export interface AdminCommunication {
  id: UUID;
  restaurant_id: UUID | null;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  read_at: string | null;
  expires_at: string | null;
}

export interface CreateAdminCommunication {
  restaurant_id?: UUID | null;
  message: string;
  priority?: AdminCommunication['priority'];
  expires_at?: string | null;
}

export interface UpdateAdminCommunication extends Partial<CreateAdminCommunication> {
  id: UUID;
}

// Data Imports Types
export interface DataImport {
  id: UUID;
  restaurant_id: UUID;
  file_type: 'csv' | 'xlsx' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  records_processed: number;
  errors: number;
  error_details: string | null;
  file_name: string | null;
  file_size: number | null;
  import_options: Record<string, any>;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface CreateDataImport {
  restaurant_id: UUID;
  file_type: DataImport['file_type'];
  file_name?: string | null;
  file_size?: number | null;
  import_options?: Record<string, any>;
}

export interface UpdateDataImport extends Partial<CreateDataImport> {
  id: UUID;
  status?: DataImport['status'];
  records_processed?: number;
  errors?: number;
  error_details?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
}

// Dashboard Stats Types
export interface DashboardStats {
  total_restaurants: number;
  active_restaurants: number;
  total_orders: number;
  pending_communications: number;
  recent_imports: number;
  total_revenue: number;
}

export interface RestaurantStats {
  id: UUID;
  name: string;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  last_order_date: string | null;
  active_tables: number;
  total_tables: number;
}

// Fee Calculation Types
export interface FeeCalculation {
  base_fee: number;
  percentage_fee: number;
  recurring_fee: number;
  total_fee: number;
  breakdown: {
    base: number;
    percentage: number;
    recurring: number;
  };
}

// Import Progress Types
export interface ImportProgress {
  status: DataImport['status'];
  records_processed: number;
  errors: number;
  progress_percent: number;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Filter and Search Types
export interface RestaurantFilter {
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  created_after?: string;
  created_before?: string;
  limit?: number;
  offset?: number;
  order_by?: 'name' | 'created_at' | 'total_orders';
  order_direction?: 'asc' | 'desc';
}

export interface CommunicationFilter {
  priority?: AdminCommunication['priority'];
  unread_only?: boolean;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface ImportFilter {
  status?: DataImport['status'];
  file_type?: DataImport['file_type'];
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}
