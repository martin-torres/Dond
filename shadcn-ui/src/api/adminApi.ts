import { supabase } from '../lib/supabaseClient';
import type {
  AppFee,
  CreateAppFee,
  UpdateAppFee,
  RestaurantFee,
  CreateRestaurantFee,
  UpdateRestaurantFee,
  RestaurantAnalytics,
  CreateRestaurantAnalytics,
  AnalyticsQuery,
  AdminCommunication,
  CreateAdminCommunication,
  UpdateAdminCommunication,
  DataImport,
  CreateDataImport,
  UpdateDataImport,
  DashboardStats,
  RestaurantStats,
  FeeCalculation,
  ImportProgress,
  PaginatedResponse,
  ApiResponse,
  RestaurantFilter,
  CommunicationFilter,
  ImportFilter
} from '../types/admin';

// App Fees API
export const appFeesApi = {
  async getAll(): Promise<AppFee[]> {
    const { data, error } = await supabase
      .from('app_fees')
      .select('*')
      .order('fee_type');
    
    if (error) throw error;
    return data;
  },

  async getById(id: string): Promise<AppFee> {
    const { data, error } = await supabase
      .from('app_fees')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(fee: CreateAppFee): Promise<AppFee> {
    const { data, error } = await supabase
      .from('app_fees')
      .insert([fee])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, fee: UpdateAppFee): Promise<AppFee> {
    const { data, error } = await supabase
      .from('app_fees')
      .update(fee)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('app_fees')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Restaurant Fees API
export const restaurantFeesApi = {
  async getByRestaurant(restaurantId: string): Promise<RestaurantFee[]> {
    const { data, error } = await supabase
      .from('restaurant_fees')
      .select(`
        *,
        app_fee:app_fees(*)
      `)
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true);
    
    if (error) throw error;
    return data;
  },

  async getByRestaurantWithInactive(restaurantId: string): Promise<RestaurantFee[]> {
    const { data, error } = await supabase
      .from('restaurant_fees')
      .select(`
        *,
        app_fee:app_fees(*)
      `)
      .eq('restaurant_id', restaurantId);
    
    if (error) throw error;
    return data;
  },

  async create(fee: CreateRestaurantFee): Promise<RestaurantFee> {
    const { data, error } = await supabase
      .from('restaurant_fees')
      .insert([fee])
      .select(`
        *,
        app_fee:app_fees(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, fee: UpdateRestaurantFee): Promise<RestaurantFee> {
    const { data, error } = await supabase
      .from('restaurant_fees')
      .update(fee)
      .eq('id', id)
      .select(`
        *,
        app_fee:app_fees(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('restaurant_fees')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Analytics API
export const analyticsApi = {
  async create(analytics: CreateRestaurantAnalytics): Promise<RestaurantAnalytics> {
    const { data, error } = await supabase
      .rpc('insert_restaurant_analytics', {
        p_restaurant_id: analytics.restaurant_id,
        p_event_type: analytics.event_type,
        p_duration_ms: analytics.duration_ms,
        p_stage: analytics.stage,
        p_metadata: analytics.metadata || {}
      });
    
    if (error) throw error;
    return data;
  },

  async getByRestaurant(restaurantId: string, query?: AnalyticsQuery): Promise<RestaurantAnalytics[]> {
    let queryBuilder = supabase
      .from('restaurant_analytics')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (query?.event_type) {
      queryBuilder = queryBuilder.eq('event_type', query.event_type);
    }

    if (query?.stage) {
      queryBuilder = queryBuilder.eq('stage', query.stage);
    }

    if (query?.start_date) {
      queryBuilder = queryBuilder.gte('timestamp', query.start_date);
    }

    if (query?.end_date) {
      queryBuilder = queryBuilder.lte('timestamp', query.end_date);
    }

    if (query?.limit) {
      queryBuilder = queryBuilder.limit(query.limit);
    }

    if (query?.offset) {
      queryBuilder = queryBuilder.range(query.offset, (query.offset || 0) + (query.limit || 50));
    }

    const { data, error } = await queryBuilder.order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getStats(restaurantId: string): Promise<{
    total_events: number;
    avg_duration: number;
    event_types: Array<{ event_type: string; count: number }>;
  }> {
    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('restaurant_analytics')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId);

    if (countError) throw countError;

    // Get average duration
    const { data: durationData, error: durationError } = await supabase
      .from('restaurant_analytics')
      .select('duration_ms')
      .eq('restaurant_id', restaurantId)
      .not('duration_ms', 'is', null);

    if (durationError) throw durationError;

    const avg_duration = durationData && durationData.length > 0
      ? durationData.reduce((sum, item) => sum + (item.duration_ms || 0), 0) / durationData.length
      : 0;

    // Get event types count
    const { data: eventData, error: eventError } = await supabase
      .from('restaurant_analytics')
      .select('event_type')
      .eq('restaurant_id', restaurantId);

    if (eventError) throw eventError;

    // Count event types
    const eventTypeCount: { [key: string]: number } = {};
    eventData?.forEach((item: unknown) => {
      eventTypeCount[item.event_type] = (eventTypeCount[item.event_type] || 0) + 1;
    });

    const event_types = Object.entries(eventTypeCount).map(([event_type, count]) => ({
      event_type,
      count
    }));

    return {
      total_events: totalCount || 0,
      avg_duration,
      event_types
    };
  }
};

// Communications API
export const communicationsApi = {
  async getByRestaurant(restaurantId: string, filter?: CommunicationFilter): Promise<AdminCommunication[]> {
    let queryBuilder = supabase
      .from('admin_communications')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (filter?.priority) {
      queryBuilder = queryBuilder.eq('priority', filter.priority);
    }

    if (filter?.unread_only) {
      queryBuilder = queryBuilder.is('read_at', null);
    }

    if (filter?.start_date) {
      queryBuilder = queryBuilder.gte('created_at', filter.start_date);
    }

    if (filter?.end_date) {
      queryBuilder = queryBuilder.lte('created_at', filter.end_date);
    }

    if (filter?.limit) {
      queryBuilder = queryBuilder.limit(filter.limit);
    }

    if (filter?.offset) {
      queryBuilder = queryBuilder.range(filter.offset, (filter.offset || 0) + (filter.limit || 50));
    }

    const { data, error } = await queryBuilder.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(communication: CreateAdminCommunication): Promise<AdminCommunication> {
    const { data, error } = await supabase
      .from('admin_communications')
      .insert([communication])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, communication: UpdateAdminCommunication): Promise<AdminCommunication> {
    const { data, error } = await supabase
      .from('admin_communications')
      .update(communication)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async markAsRead(communicationId: string): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('mark_communication_as_read', {
        p_communication_id: communicationId
      });
    
    if (error) throw error;
    return data;
  },

  async getUnreadCount(restaurantId: string): Promise<number> {
    const { data, error } = await supabase
      .rpc('get_unread_communications_count', {
        p_restaurant_id: restaurantId
      });
    
    if (error) throw error;
    return data;
  }
};

// Data Imports API
export const dataImportsApi = {
  async getByRestaurant(restaurantId: string, filter?: ImportFilter): Promise<DataImport[]> {
    let queryBuilder = supabase
      .from('data_imports')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (filter?.status) {
      queryBuilder = queryBuilder.eq('status', filter.status);
    }

    if (filter?.file_type) {
      queryBuilder = queryBuilder.eq('file_type', filter.file_type);
    }

    if (filter?.start_date) {
      queryBuilder = queryBuilder.gte('created_at', filter.start_date);
    }

    if (filter?.end_date) {
      queryBuilder = queryBuilder.lte('created_at', filter.end_date);
    }

    if (filter?.limit) {
      queryBuilder = queryBuilder.limit(filter.limit);
    }

    if (filter?.offset) {
      queryBuilder = queryBuilder.range(filter.offset, (filter.offset || 0) + (filter.limit || 50));
    }

    const { data, error } = await queryBuilder.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(importData: CreateDataImport): Promise<DataImport> {
    const { data, error } = await supabase
      .from('data_imports')
      .insert([importData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, importData: UpdateDataImport): Promise<DataImport> {
    const { data, error } = await supabase
      .from('data_imports')
      .update(importData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getProgress(importId: string): Promise<ImportProgress> {
    const { data, error } = await supabase
      .rpc('get_data_import_progress', {
        p_import_id: importId
      });
    
    if (error) throw error;
    return data;
  }
};

// Dashboard API
export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    // Get basic stats from restaurants table
    const { data: restaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('id, name, created_at');

    if (restaurantsError) throw restaurantsError;

    // For now, return basic counts - we can enhance this later with order data
    return {
      total_restaurants: restaurants?.length || 0,
      active_restaurants: restaurants?.length || 0, // Simplified
      total_orders: 0, // Would need orders table
      pending_communications: 0, // Would need communications table
      recent_imports: 0, // Would need data_imports table
      total_revenue: 0 // Would need orders/payments tables
    };
  },

  async getRestaurantStats(filter?: RestaurantFilter): Promise<PaginatedResponse<RestaurantStats>> {
    let queryBuilder = supabase
      .from('restaurants')
      .select('id, name, created_at');

    if (filter?.search) {
      queryBuilder = queryBuilder.ilike('name', `%${filter.search}%`);
    }

    if (filter?.limit) {
      queryBuilder = queryBuilder.limit(filter.limit);
    }

    if (filter?.offset) {
      queryBuilder = queryBuilder.range(filter.offset, (filter.offset || 0) + (filter.limit || 50));
    }

    if (filter?.order_by) {
      queryBuilder = queryBuilder.order(filter.order_by, {
        ascending: filter.order_direction === 'asc'
      });
    }

    const { data, error } = await queryBuilder;

    if (error) throw error;

    // Convert to RestaurantStats format (simplified)
    const stats: RestaurantStats[] = (data || []).map((restaurant: unknown) => ({
      id: restaurant.id,
      name: restaurant.name,
      total_orders: 0, // Would need to be calculated from orders table
      total_revenue: 0, // Would need to be calculated from orders table
      avg_order_value: 0, // Would need to be calculated from orders table
      last_order_date: null,
      active_tables: 0, // Would need to be calculated from tables table
      total_tables: 0 // Would need to be calculated from tables table
    }));

    return {
      data: stats,
      total: stats.length,
      page: 1,
      limit: filter?.limit || 50,
      has_more: false
    };
  }
};

// Fee Calculation API
export const feeApi = {
  async calculateFees(restaurantId: string, orderAmount: number): Promise<FeeCalculation> {
    // This would need a custom RPC function in Supabase
    // For now, we'll implement a basic calculation
    const baseFee = 0.30;
    const percentageFee = orderAmount * 0.05;
    const recurringFee = 29.99;

    return {
      base_fee: baseFee,
      percentage_fee: percentageFee,
      recurring_fee: recurringFee,
      total_fee: baseFee + percentageFee + recurringFee,
      breakdown: {
        base: baseFee,
        percentage: percentageFee,
        recurring: recurringFee
      }
    };
  }
};

// Export all APIs
export const adminApi = {
  appFees: appFeesApi,
  restaurantFees: restaurantFeesApi,
  analytics: analyticsApi,
  communications: communicationsApi,
  dataImports: dataImportsApi,
  dashboard: dashboardApi,
  fees: feeApi
};
