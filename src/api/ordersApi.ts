// src/api/ordersApi.ts
import { supabase } from '../lib/supabaseClient';
import { resolveRestaurantId } from './restaurantsApi';

export type OrderStatus =
  | 'NEW'
  | 'IN_PROGRESS'
  | 'READY'
  | 'PICKING_UP'
  | 'DELIVERED';

export type OrderType = 'dine_in' | 'to_go' | 'request';
export type ItemKind = 'food' | 'drink' | 'request';

export type OrderItemInput = {
  menuItemId?: string; // if you have a menu table
  name: string;
  quantity: number;
  price: number;
  kind: ItemKind;
  note?: string;
};

export type NewOrderInput = {
  restaurantId: string;
  orderType: OrderType;
  tableId?: string | null;
  tableLabel?: string; // dine-in only
  customerName?: string; // esp. for to-go
  customerId?: string; // optional link to customers table
  note?: string; // overall note for the order
  items: OrderItemInput[];
};

export type OrderRow = {
  id: string;
  restaurant_id: string;
  order_type: OrderType;
  table_id?: string | null;
  table_label: string | null;
  customer_name: string | null;
  customer_id?: string | null;
  status: OrderStatus;
  note: string | null;
  created_at: string; // ISO timestamp
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name: string;
  quantity: number;
  price: number | null;
  kind: ItemKind;
  note: string | null;
  status?: string | null;
  table_id?: string | null;
  created_at?: string;
  assigned_station?: string | null;
  status_updated_at?: string | null;
  orders?: {
    restaurant_id: string;
    table_id?: string | null;
    table_label?: string | null;
    customer_name?: string | null;
    created_at?: string;
  } | null;
};

export type OrderWithItems = OrderRow & { items: OrderItemRow[] };

/**
 * STEP 3: Load existing open orders once.
 * You can call this in your StaffDataProvider when it mounts.
 */
export async function fetchOpenOrders(): Promise<OrderRow[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .in('status', ['NEW', 'IN_PROGRESS', 'READY', 'PICKING_UP'])
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching orders', error);
    throw error;
  }

  return (data ?? []) as OrderRow[];
}

/**
 * Fetch order_items for a list of order IDs.
 */
export async function fetchOrderItemsForOrders(orderIds: string[]): Promise<Map<string, OrderItemRow[]>> {
  const map = new Map<string, OrderItemRow[]>();
  if (!orderIds.length) return map;

  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', orderIds);

  if (error) {
    console.error('Error fetching order items', error);
    throw error;
  }

  (data ?? []).forEach((item) => {
    const list = map.get(item.order_id) ?? [];
    list.push(item as OrderItemRow);
    map.set(item.order_id, list);
  });

  return map;
}

/**
 * Convenience helper to load open orders with their items.
 */
export async function fetchOpenOrdersWithItems(): Promise<OrderWithItems[]> {
  const orders = await fetchOpenOrders();
  const itemsMap = await fetchOrderItemsForOrders(orders.map((order) => order.id));
  return orders.map((order) => ({
    ...order,
    items: itemsMap.get(order.id) ?? [],
  }));
}

/**
 * STEP 3: Subscribe to realtime changes on orders.
 * Call this once (e.g. in a useEffect) and update your local state
 * inside the callback.
 */
export async function subscribeToOrders(
  onChange: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    newRow?: OrderRow | null;
    oldRow?: OrderRow | null;
  }) => void,
  restaurantId?: string | null
) {
  console.log('📡 [ordersApi] Setting up subscription:', {
    restaurantId,
    resolvedRestaurantId: restaurantId
  });

  // Resolve restaurant identifier to UUID for database filtering
  let resolvedRestaurantId = restaurantId;
  if (restaurantId) {
    resolvedRestaurantId = await resolveRestaurantId(restaurantId);
    if (!resolvedRestaurantId) {
      console.error('❌ [ordersApi] Could not resolve restaurant identifier:', restaurantId);
      // Fall back to no filter if resolution fails
      resolvedRestaurantId = null;
    } else {
      console.log('✅ [ordersApi] Resolved restaurant ID:', {
        original: restaurantId,
        resolved: resolvedRestaurantId
      });
    }
  }

  const channelName = resolvedRestaurantId ? `orders-${resolvedRestaurantId}` : 'orders-all';
  const filter = resolvedRestaurantId ? `restaurant_id=eq.${resolvedRestaurantId}` : undefined;

  console.log('📡 [ordersApi] Creating channel:', {
    channelName,
    filter,
    hasFilter: !!filter
  });

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        ...(filter ? { filter } : {}),
      },
      (payload) => {
        console.log('📥 [ordersApi] Received order update:', {
          restaurantId: resolvedRestaurantId,
          eventType: payload.eventType,
          newStatus: (payload.new as any)?.status,
          oldStatus: (payload.old as any)?.status,
          orderId: (payload.new as any)?.id || (payload.old as any)?.id
        });
        
        onChange({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          newRow: (payload.new || null) as OrderRow | null,
          oldRow: (payload.old || null) as OrderRow | null,
        });
      }
    )
    .subscribe();

  console.log('✅ [ordersApi] Subscription active:', { channelName });

  return () => {
    console.log('📡 [ordersApi] Removing channel:', channelName);
    supabase.removeChannel(channel);
  };
}

/**
 * STEP 4: Create a new order + related order_items.
 * Call this when the customer submits their cart.
 */
export async function createOrderWithItems(input: NewOrderInput): Promise<OrderRow> {
  // 1) Insert into orders
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      restaurant_id: input.restaurantId,
      order_type: input.orderType,
      table_id: input.tableId ?? null,
      table_label: input.tableLabel ?? null,
      customer_name: input.customerName ?? null,
      customer_id: input.customerId ?? null,
      note: input.note ?? null,
      status: 'NEW',
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error('Error inserting order', orderError);
    throw orderError;
  }

  // 2) Insert into order_items
  if (input.items.length > 0) {
    const itemsToInsert = input.items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menuItemId ?? null, // adjust if you don't have this column
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      kind: item.kind,
      note: item.note ?? null,
      table_id: input.tableId ?? null,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Error inserting order items', itemsError);
      throw itemsError;
    }
  }

  return order as OrderRow;
}

/**
 * STEP 5: Update the status of an order.
 * Staff views (kitchen/bar/FOH/owner) should call this when pressing Start / Ready / Picking up / Delivered.
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order status', error);
    throw error;
  }
}

/**
 * NEW: Update the status of an individual order item.
 * Used by kitchen/bar to update specific items without affecting other items in the same order.
 */
export async function updateOrderItemStatus(itemId: string, status: OrderStatus) {
  const { error } = await supabase
    .from('order_items')
    .update({ 
      status,
      status_updated_at: new Date().toISOString()
    })
    .eq('id', itemId);

  if (error) {
    console.error('Error updating order item status', error);
    throw error;
  }
}

/**
 * NEW: Update multiple order items status at once (batch operation).
 * Used when a station completes multiple items for the same order.
 */
export async function updateOrderItemsStatus(itemIds: string[], status: OrderStatus) {
  const { error } = await supabase
    .from('order_items')
    .update({ 
      status,
      status_updated_at: new Date().toISOString()
    })
    .in('id', itemIds);

  if (error) {
    console.error('Error updating order items status', error);
    throw error;
  }
}

/**
 * NEW: Get order items by station and status for staff views.
 * Returns items filtered by station (kitchen/bar/server) and status.
 */
export async function fetchItemsByStationAndStatus(
  restaurantId: string,
  station: 'kitchen' | 'bar' | 'server',
  statuses: OrderStatus[]
): Promise<OrderItemRow[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select(`
      *,
      orders!inner(restaurant_id, table_id, table_label, customer_name, created_at)
    `)
    .eq('orders.restaurant_id', restaurantId)
    .eq('assigned_station', station)
    .in('status', statuses)
    .order('orders.created_at', { ascending: true });

  if (error) {
    console.error('Error fetching items by station', error);
    throw error;
  }

  return data as OrderItemRow[];
}

/**
 * NEW: Get all items for a specific order with their individual statuses.
 */
export async function fetchOrderItemsWithStatuses(orderId: string): Promise<OrderItemRow[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching order items with statuses', error);
    throw error;
  }

  return data as OrderItemRow[];
}

/**
 * NEW: Get order summary with item-level status breakdown.
 * Used by FOH view to show which items are ready for pickup.
 */
export async function getOrderSummaryWithStatuses(orderId: string): Promise<{
  orderId: string;
  tableId?: string;
  tableLabel?: string;
  customerName?: string;
  items: OrderItemRow[];
  statusBreakdown: {
    food: { ready: number; inProgress: number; new: number };
    drinks: { ready: number; inProgress: number; new: number };
    requests: { ready: number; inProgress: number; new: number };
  };
}> {
  const items = await fetchOrderItemsWithStatuses(orderId);
  
  // Get order info
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('table_id, table_label, customer_name')
    .eq('id', orderId)
    .single();

  if (orderError) {
    console.error('Error fetching order info', orderError);
    throw orderError;
  }

  // Calculate status breakdown
  const statusBreakdown = {
    food: { ready: 0, inProgress: 0, new: 0 },
    drinks: { ready: 0, inProgress: 0, new: 0 },
    requests: { ready: 0, inProgress: 0, new: 0 }
  };

  items.forEach(item => {
    const category = item.kind === 'food' ? 'food' : 
                    item.kind === 'drink' ? 'drinks' : 'requests';
    
    if (item.status === 'READY') statusBreakdown[category].ready++;
    else if (item.status === 'IN_PROGRESS') statusBreakdown[category].inProgress++;
    else statusBreakdown[category].new++;
  });

  return {
    orderId,
    tableId: orderData?.table_id,
    tableLabel: orderData?.table_label,
    customerName: orderData?.customer_name,
    items,
    statusBreakdown
  };
}

/**
 * NEW: Get items ready for pickup by station.
 * Used by FOH to show what needs to be picked up.
 */
export async function getItemsReadyForPickup(
  restaurantId: string,
  station?: 'kitchen' | 'bar' | 'server'
): Promise<{
  orders: Array<{
    orderId: string;
    tableId?: string;
    tableLabel?: string;
    customerName?: string;
    readyItems: OrderItemRow[];
    station: 'kitchen' | 'bar' | 'server';
  }>;
}> {
  const query = supabase
    .from('order_items')
    .select(`
      *,
      orders!inner(restaurant_id, table_id, table_label, customer_name, created_at)
    `)
    .eq('orders.restaurant_id', restaurantId)
    .eq('status', 'READY');

  if (station) {
    query.eq('assigned_station', station);
  }

  const { data, error } = await query.order('orders.created_at', { ascending: true });

  if (error) {
    console.error('Error fetching items ready for pickup', error);
    throw error;
  }

  // Group by order
  const ordersMap = new Map<string, any>();
  (data as OrderItemRow[]).forEach(item => {
    const orderId = item.order_id;
    if (!ordersMap.has(orderId)) {
      ordersMap.set(orderId, {
        orderId,
        tableId: item.orders?.table_id,
        tableLabel: item.orders?.table_label,
        customerName: item.orders?.customer_name,
        readyItems: [],
        station: item.assigned_station as 'kitchen' | 'bar' | 'server'
      });
    }
    ordersMap.get(orderId).readyItems.push(item);
  });

  return {
    orders: Array.from(ordersMap.values())
  };
}
