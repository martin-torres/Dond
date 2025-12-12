// src/api/ordersApi.ts
import { supabase } from '../lib/supabaseClient';

export type OrderStatus =
  | 'NEW'
  | 'IN_PROGRESS'
  | 'READY'
  | 'PICKING_UP'
  | 'DELIVERED';

export type OrderType = 'dine_in' | 'to_go' | 'request';
export type ItemKind = 'food' | 'drink';

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
export function subscribeToOrders(
  onChange: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    newRow?: OrderRow | null;
    oldRow?: OrderRow | null;
  }) => void
) {
  const channel = supabase
    .channel('orders-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      (payload) => {
        onChange({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          newRow: (payload.new || null) as OrderRow | null,
          oldRow: (payload.old || null) as OrderRow | null,
        });
      }
    )
    .subscribe();

  // return an unsubscribe function
  return () => {
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
