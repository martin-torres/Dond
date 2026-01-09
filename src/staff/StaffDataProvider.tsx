import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Language, OrderItem, Restaurant } from '../types';
import { supabase } from '../lib/supabaseClient';
import {
  createOrderWithItems,
  fetchOpenOrdersWithItems,
  fetchOrderItemsForOrders,
  subscribeToOrders,
  updateOrderStatus as updateOrderStatusApi,
  updateOrderStationStatus as updateOrderStationStatusApi,
  markStationPickedUp as markStationPickedUpApi,
  markStationDelivered as markStationDeliveredApi,
  type OrderItemRow,
  type OrderWithItems,
} from '../api/ordersApi';
import { fetchRestaurantTables, type RestaurantTableRow } from '../api/restaurantTablesApi';
import { getRestaurant } from '../api/restaurantsApi';
import {
  ItemKind,
  OrderStatus,
  OrderType,
  StaffOrder,
  StaffOrderItem,
  StaffOrderPayload,
  Station,
  ProductionStatus,
  StaffSeedContext,
  TableInfo,
  TableState,
} from './types';

type StaffContextValue = {
  orders: StaffOrder[];
  tables: TableInfo[];
  singleOperatorMode: boolean;
  setSingleOperatorMode: (enabled: boolean) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateStationStatus: (orderId: string, station: Station, status: ProductionStatus) => void;
  markStationPickedUp: (orderId: string, station: Exclude<Station, 'server'>) => void;
  markStationDelivered: (orderId: string, station: Station) => void;
  addStaffOrder: (order: StaffOrder) => void;
  addCustomerOrder: (payload: StaffOrderPayload) => Promise<StaffOrder | null>;
  setTableState: (tableId: string, state: TableState, startedAt?: Date | null) => void;
  closeTableSession: (tableId: string) => void;
  getOrdersForTable: (tableId: string) => StaffOrder[];
  getBillDataByOrderId: (orderId: string) => Promise<OrderItem[]>;
};

const StaffDataContext = createContext<StaffContextValue | null>(null);
const SINGLE_OPERATOR_MODE_DEFAULT = false;
let externalOrderStatusUpdater: ((orderId: string, status: OrderStatus) => void) | null = null;
let externalStationStatusUpdater:
  | ((orderId: string, station: Station, status: ProductionStatus) => void)
  | null = null;
let externalStationPickupUpdater:
  | ((orderId: string, station: Exclude<Station, 'server'>) => void)
  | null = null;
let externalStationDeliveredUpdater:
  | ((orderId: string, station: Station) => void)
  | null = null;

export const getExternalOrderStatusUpdater = () => externalOrderStatusUpdater;
export const getExternalStationStatusUpdater = () => externalStationStatusUpdater;
export const getExternalStationPickupUpdater = () => externalStationPickupUpdater;
export const getExternalStationDeliveredUpdater = () => externalStationDeliveredUpdater;

const seedRestaurant: Restaurant | null = null;

const titleCase = (value?: string | null) => {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const buildMenuKindIndex = (restaurant?: Restaurant | null) => {
  const index = new Map<string, ItemKind>();
  if (!restaurant) return index;
  restaurant.menu?.food?.forEach((item) => index.set(item.id, 'food'));
  restaurant.menu?.drinks?.forEach((item) => index.set(item.id, 'drink'));
  return index;
};

// Helper function to get order items by orderId (canonical identifier)
const getOrderItemsByOrderId = async (orderId: string): Promise<OrderItem[]> => {
  try {
    const itemsMap = await fetchOrderItemsForOrders([orderId]);
    const items = itemsMap.get(orderId) || [];
    
    // Convert OrderItemRow to OrderItem format for OrderSummaryScreen
    return items.map(item => ({
      menuItem: {
        id: item.menu_item_id || item.id,
        name: {
          en: item.name,
          es: item.name,
          fr: item.name,
          de: item.name,
          ja: item.name,
          ar: item.name,
          zh: item.name
        },
        description: {
          en: '',
          es: '',
          fr: '',
          de: '',
          ja: '',
          ar: '',
          zh: ''
        },
        price: item.price || 0,
        category: item.kind || 'food',
        image: ''
      },
      quantity: item.quantity
    }));
  } catch (error) {
    console.error('Failed to fetch order items by orderId:', error);
    return [];
  }
};

const getTableLabel = (restaurant: Restaurant | null, tableId?: string | null) => {
  if (!restaurant || !tableId) return undefined;
  const table = restaurant.tables?.find((t) => t.id === tableId);
  if (!table) return undefined;
  const section = titleCase(table.location);
  return `${section} ${table.number}`;
};

const seedTablesFromRestaurant = (restaurant: Restaurant | null): TableInfo[] => {
  if (!restaurant) return [];
  return (restaurant.tables ?? []).map((table) => ({
    id: table.id,
    label: `${titleCase(table.location)} ${table.number}`,
    section: titleCase(table.location),
    state: 'READY', // Default state, will be updated based on orders
    cleaningStartedAt: null,
    tableNumber: table.number,
    seats: table.seats,
    location: table.location,
    x: table.x,
    y: table.y,
  }));
};

const seedTablesFromDbRows = (rows: RestaurantTableRow[]): TableInfo[] => {
  return (rows ?? []).map((row) => ({
    id: row.id,
    label: row.display_name ?? `Table ${row.table_number ?? row.id}`,
    section: titleCase(row.section ?? row.location),
    state: 'READY', // Default state, will be updated based on orders
    cleaningStartedAt: null,
    tableNumber: row.table_number ?? undefined,
    seats: row.seats ?? undefined,
    location: row.location ?? undefined,
    x: row.x ?? undefined,
    y: row.y ?? undefined,
  }));
};

const formatMenuName = (name: Record<Language, string>, language?: Language) => {
  if (language && name[language]) return name[language];
  return name.en ?? Object.values(name)[0];
};

export const StaffDataProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<StaffOrder[]>([]);

  // Demo helper: enable auto-selection/auto-opening behaviours in FOH.
  // Sources (priority): URL ?singleOperator=1 > localStorage > default.
  const [singleOperatorMode, setSingleOperatorMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return SINGLE_OPERATOR_MODE_DEFAULT;
    const params = new URLSearchParams(window.location.search);
    const qp = params.get('singleOperator');
    if (qp === '1' || qp === 'true') return true;
    if (qp === '0' || qp === 'false') return false;
    const stored = window.localStorage.getItem('dond_singleOperatorMode');
    if (stored === '1') return true;
    if (stored === '0') return false;
    return SINGLE_OPERATOR_MODE_DEFAULT;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('dond_singleOperatorMode', singleOperatorMode ? '1' : '0');
  }, [singleOperatorMode]);

  const [activeRestaurantId, setActiveRestaurantId] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    return params.get('restaurantId') ?? '';
  });

  const activeRestaurant = useMemo(
    () => null, // Will be loaded from Supabase when needed
    [activeRestaurantId]
  );

  const [tables, setTables] = useState<TableInfo[]>(() => seedTablesFromRestaurant(activeRestaurant));
  const kindIndex = useMemo(() => buildMenuKindIndex(activeRestaurant), [activeRestaurant]);

  const syncTableOccupancy = useCallback(
    async (nextOrders: StaffOrder[]) => {
      // CANONICAL: Query payment status for all non-DELIVERED orders
      const nonDeliveredOrders = nextOrders.filter((order) => order.status !== 'DELIVERED');
      const orderIds = Array.from(new Set(nonDeliveredOrders.map((order) => order.id)));

      let paymentStatusMap = new Map<string, { is_payment_complete: boolean }>();

      if (orderIds.length > 0) {
        try {
          const { data: paymentStatus, error } = await supabase
            .from('order_payment_status')
            .select('order_id, is_payment_complete')
            .in('order_id', orderIds);

          if (!error && paymentStatus) {
            paymentStatusMap = new Map(
              paymentStatus.map((status) => [status.order_id, status])
            );
          }
        } catch (error) {
          console.error('Failed to query payment status for table occupancy:', error);
        }
      }

      // CANONICAL: An order is ACTIVE iff status !== 'DELIVERED' AND is_payment_complete === false
      const isOrderActive = (order: StaffOrder): boolean => {
        if (order.status === 'DELIVERED') return false;
        const paymentStatus = paymentStatusMap.get(order.id);
        return paymentStatus ? !paymentStatus.is_payment_complete : true; // Default to active if payment status unknown
      };

      setTables((prev) =>
        prev.map((table) => {
          const hasActive = nextOrders.some(
            (order) => order.tableId === table.id && isOrderActive(order)
          );
          if (table.state === 'CLEANING' || table.state === 'PAYING') return table;
          if (hasActive) {
            return { ...table, state: 'OCCUPIED' };
          }
          if (table.state === 'OCCUPIED' && !hasActive) {
            return { ...table, state: 'READY', cleaningStartedAt: null };
          }
          return table;
        })
      );
    },
    []
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      let previousStatus: OrderStatus | null = null;

      // 1) Optimistic UI update: update local state immediately
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order;
          previousStatus = order.status;
          return { ...order, status };
        })
      );

      // 2) Save to Supabase
      updateOrderStatusApi(orderId, status).catch((err) => {
        console.error('Failed to update order status in Supabase', err);

        // 3) Roll back UI if Supabase update failed
        if (previousStatus) {
          setOrders((prev) =>
            prev.map((order) =>
              order.id === orderId ? { ...order, status: previousStatus as OrderStatus } : order
            )
          );
        }

        alert('Could not update order status. Please check internet/login and try again.');
      });
    },
    []
  );

  const updateStationStatus = useCallback(
    (orderId: string, station: Station, status: ProductionStatus) => {
      // optimistic update
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order;
          if (order.station !== station) return order;
          return { ...order, status };
        })
      );

      updateOrderStationStatusApi(orderId, station, status).catch((err) => {
        console.error('Failed to update station status in Supabase', err);
        alert('Could not update station status. Please check internet/login and try again.');
      });

      // NOTE: We intentionally do NOT update the top-level `orders.status` column here.
      // Kitchen/bar should progress independently; FOH delivery is tracked per station.
    },
    []
  );

  const markStationPickedUp = useCallback(
    (orderId: string, station: Exclude<Station, 'server'>) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order;
          if (order.station !== station) return order;
          return { ...order, pickedUpAt: new Date(), status: 'PICKING_UP' };
        })
      );

      markStationPickedUpApi(orderId, station).catch((err) => {
        console.error('Failed to mark station picked up', err);
        alert('Could not mark picked up. Please check internet/login and try again.');
      });
    },
    []
  );

  const markStationDelivered = useCallback(
    (orderId: string, station: Station) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order;
          if (order.station !== station) return order;
          return { ...order, deliveredAt: new Date(), status: 'DELIVERED' };
        })
      );

      markStationDeliveredApi(orderId, station).catch((err) => {
        console.error('Failed to mark station delivered', err);
        alert('Could not mark delivered. Please check internet/login and try again.');
      });
    },
    []
  );

  useEffect(() => {
    externalOrderStatusUpdater = updateOrderStatus;
    externalStationStatusUpdater = updateStationStatus;
    externalStationPickupUpdater = markStationPickedUp;
    externalStationDeliveredUpdater = markStationDelivered;
    return () => {
      externalOrderStatusUpdater = null;
      externalStationStatusUpdater = null;
      externalStationPickupUpdater = null;
      externalStationDeliveredUpdater = null;
    };
  }, [updateOrderStatus, updateStationStatus, markStationPickedUp, markStationDelivered]);

  useEffect(() => {
    let cancelled = false;

    const loadTables = async () => {
      if (!activeRestaurantId) return;

      try {
        // Convert slug to UUID before querying
        const restaurant = await getRestaurant(activeRestaurantId);
        if (!restaurant) {
          console.error('Restaurant not found:', activeRestaurantId);
          return;
        }

        const rows = await fetchRestaurantTables(restaurant.id);
        if (cancelled) return;

        if (rows.length > 0) {
          setTables(seedTablesFromDbRows(rows));
        } else {
          setTables(seedTablesFromRestaurant(activeRestaurant));
        }
      } catch (err) {
        console.error('Failed to load restaurant_tables from Supabase', err);
        setTables(seedTablesFromRestaurant(activeRestaurant));
      }
    };

    loadTables();

    return () => {
      cancelled = true;
    };
  }, [activeRestaurantId, activeRestaurant]);

  useEffect(() => {
    if (!activeRestaurantId) return;

    let cancelled = false;

    const reloadTables = async () => {
      try {
        // Convert slug to UUID before querying
        const restaurant = await getRestaurant(activeRestaurantId);
        if (!restaurant) {
          console.error('Restaurant not found for reload:', activeRestaurantId);
          return;
        }

        const rows = await fetchRestaurantTables(restaurant.id);
        if (cancelled) return;

        if (rows.length > 0) {
          setTables(seedTablesFromDbRows(rows));
        } else {
          setTables(seedTablesFromRestaurant(activeRestaurant));
        }
      } catch (err) {
        console.error('Failed to reload restaurant_tables after change', err);
      }
    };

    const setupTableSubscription = async () => {
      // Resolve restaurant identifier to UUID for database filtering
      const resolvedRestaurantId = await getRestaurant(activeRestaurantId);
      if (!resolvedRestaurantId) {
        console.error('Could not resolve restaurant identifier for table subscription:', activeRestaurantId);
        return;
      }

      const channel = supabase
        .channel(`restaurant-tables-${resolvedRestaurantId.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'restaurant_tables',
            filter: `restaurant_id=eq.${resolvedRestaurantId.id}`,
          },
          () => {
            // Any edit in manager tools should refresh the floor plan tables quickly
            void reloadTables();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanup = setupTableSubscription();

    return () => {
      cancelled = true;
      cleanup?.then(cleanupFn => cleanupFn?.());
    };
  }, [activeRestaurantId, activeRestaurant]);
  
  const addStaffOrder = useCallback(
    (order: StaffOrder) => {
      setOrders((prev) => {
        const exists = prev.some((existing) => existing.id === order.id);
        if (exists) {
          return prev.map((existing) => (existing.id === order.id ? order : existing));
        }
        return [order, ...prev];
      });
      if (order.tableId) {
        setTables((prev) =>
          prev.map((table) =>
            table.id === order.tableId ? { ...table, state: 'OCCUPIED', cleaningStartedAt: null } : table
          )
        );
      }
    },
    [setTables]
  );

  const adaptOrderItems = useCallback(
    (items: OrderItem[], restaurant: Restaurant | null, language?: Language) => {
      if (!restaurant) return [];
      const localKindIndex = buildMenuKindIndex(restaurant);
      return items
        .map<StaffOrderItem | null>((item) => {
          // Check if this is a request item (starts with 'request-')
          const isRequest = item.menuItem.id.startsWith('request-');
          const kind = isRequest ? 'request' : (localKindIndex.get(item.menuItem.id) ?? 'food');
          return {
            id: item.menuItem.id,
            quantity: item.quantity,
            name: formatMenuName(item.menuItem.name, language),
            kind,
          };
        })
        .filter(Boolean) as StaffOrderItem[];
    },
    []
  );

  const mapOrderItemsFromSupabase = useCallback(
    (items: OrderItemRow[]): StaffOrderItem[] =>
      (items ?? []).map((item) => ({
        id: item.menu_item_id ?? item.id,
        quantity: item.quantity,
        name: item.name,
        kind: item.kind,
        note: item.note ?? undefined,
      })),
    []
  );

const deriveStation = (items: StaffOrderItem[], orderType: OrderType): Station | undefined => {
  if (orderType === 'request') return 'server';
  
  const hasFood = items.some((item) => item.kind === 'food');
  const hasDrinks = items.some((item) => item.kind === 'drink');
  
  if (hasFood && !hasDrinks) return 'kitchen';
  if (hasDrinks && !hasFood) return 'bar';
  if (hasFood && hasDrinks) return 'kitchen'; // Mixed orders → kitchen (primary station)
  
  return undefined;
};

  // Get all relevant stations for an order (for UI filtering)
  const getRelevantStations = (items: StaffOrderItem[], orderType: OrderType): Station[] => {
    const stations = new Set<Station>();
    
    if (orderType === 'request') {
      stations.add('server');
      return Array.from(stations);
    }
    
    const hasFood = items.some((item) => item.kind === 'food');
    const hasDrinks = items.some((item) => item.kind === 'drink');
    
    if (hasFood) stations.add('kitchen');
    if (hasDrinks) stations.add('bar');
    
    return Array.from(stations);
  };

  // Filter items by station for UI display
  const filterItemsByStation = (items: StaffOrderItem[], station: Station): StaffOrderItem[] => {
    if (station === 'kitchen') {
      return items.filter(item => item.kind === 'food');
    }
    if (station === 'bar') {
      return items.filter(item => item.kind === 'drink');
    }
    if (station === 'server') {
      return items; // FOH sees all items for requests
    }
    return items; // Default fallback
  };

  const mapSupabaseOrderToStaff = useCallback(
    (order: OrderWithItems): StaffOrder[] => {
      const itemList = mapOrderItemsFromSupabase(order.items ?? []);
      const restaurantForOrder = activeRestaurant;

      const tableLabel =
        order.table_label ??
        (order.table_id ? getTableLabel(restaurantForOrder, order.table_id) : undefined);

      const createdAt = new Date(order.created_at ?? Date.now());

      // Request-only orders are FOH tickets.
      if (order.order_type === 'request') {
        const deliveredAt = order.foh_request_delivered_at
          ? new Date(order.foh_request_delivered_at)
          : null;
        // FIX: Use foh_request_status directly, don't fall back to order.status
        const productionStatus = (order.foh_request_status || 'NEW') as OrderStatus;
        return [
          {
            id: order.id,
            ticketId: `${order.id}-server`,
            orderType: order.order_type,
            items: itemList,
            tableId: order.table_id ?? undefined,
            tableLabel,
            customerName: order.customer_name ?? undefined,
            note: order.note ?? undefined,
            status: deliveredAt ? 'DELIVERED' : productionStatus,
            createdAt,
            station: 'server',
            deliveredAt,
          },
        ];
      }

      // Non-request orders can expand into up to 2 station tickets.
      const tickets: StaffOrder[] = [];

      const foodItems = itemList.filter((i) => i.kind === 'food');
      if (foodItems.length) {
        const pickedUpAt = order.kitchen_picked_up_at ? new Date(order.kitchen_picked_up_at) : null;
        const deliveredAt = order.kitchen_delivered_at ? new Date(order.kitchen_delivered_at) : null;
        // FIX: Use kitchen_status directly, don't fall back to order.status
        const productionStatus = (order.kitchen_status || 'NEW') as OrderStatus;
        tickets.push({
          id: order.id,
          ticketId: `${order.id}-kitchen`,
          orderType: order.order_type,
          items: foodItems,
          tableId: order.table_id ?? undefined,
          tableLabel,
          customerName: order.customer_name ?? undefined,
          note: order.note ?? undefined,
          status: deliveredAt ? 'DELIVERED' : pickedUpAt ? 'PICKING_UP' : productionStatus,
          createdAt,
          station: 'kitchen',
          pickedUpAt,
          deliveredAt,
        });
      }

      const drinkItems = itemList.filter((i) => i.kind === 'drink');
      if (drinkItems.length) {
        const pickedUpAt = order.bar_picked_up_at ? new Date(order.bar_picked_up_at) : null;
        const deliveredAt = order.bar_delivered_at ? new Date(order.bar_delivered_at) : null;
        // FIX: Use bar_status directly, don't fall back to order.status
        const productionStatus = (order.bar_status || 'NEW') as OrderStatus;
        tickets.push({
          id: order.id,
          ticketId: `${order.id}-bar`,
          orderType: order.order_type,
          items: drinkItems,
          tableId: order.table_id ?? undefined,
          tableLabel,
          customerName: order.customer_name ?? undefined,
          note: order.note ?? undefined,
          status: deliveredAt ? 'DELIVERED' : pickedUpAt ? 'PICKING_UP' : productionStatus,
          createdAt,
          station: 'bar',
          pickedUpAt,
          deliveredAt,
        });
      }

      return tickets;
    },
    [mapOrderItemsFromSupabase, activeRestaurant]
  );

  const upsertStaffOrder = useCallback((nextOrder: StaffOrder) => {
    setOrders((prev) => {
      const nextKey = nextOrder.ticketId ?? nextOrder.id;
      const exists = prev.some((order) => (order.ticketId ?? order.id) === nextKey);
      if (exists) {
        return prev.map((order) => ((order.ticketId ?? order.id) === nextKey ? nextOrder : order));
      }
      return [nextOrder, ...prev];
    });
  }, []);

  const addCustomerOrder = useCallback(
    async (payload: StaffOrderPayload): Promise<StaffOrder | null> => {
      try {
        // Prefer explicit restaurant in payload.meta, fallback to activeRestaurant if available.
        const restaurant = payload.meta?.restaurant ?? activeRestaurant;
        if (!restaurant) {
          console.error('[addCustomerOrder] No restaurant provided in payload.meta and no activeRestaurant is set', payload);
          return null;
        }

        const items = adaptOrderItems(payload.items, restaurant, payload.meta?.language);
        if (!items.length) {
          console.warn('[addCustomerOrder] No valid items after adaptOrderItems', { payload, items });
          return null;
        }

        // Check for request type flag in meta
        const isRequest = (payload.meta as { requestType?: string } | undefined)?.requestType === 'request';
        const orderType: OrderType = isRequest
          ? 'request'
          : payload.meta?.tableId || payload.meta?.tableNumber
            ? 'dine_in'
            : 'to_go';
        const tableLabel = payload.meta?.tableId
          ? getTableLabel(restaurant, payload.meta.tableId)
          : undefined;

        const orderRow = await createOrderWithItems({
          restaurantId: restaurant.id,
          orderType,
          tableId: payload.meta?.tableId ?? null,
          tableLabel,
          customerName: payload.meta?.customerName,
          customerId: payload.meta?.customerId,
          note: payload.meta?.note,
          items: payload.items.map((item) => ({
            menuItemId: item.menuItem.id,
            name: formatMenuName(item.menuItem.name, payload.meta?.language),
            quantity: item.quantity,
            price: item.menuItem.price,
            kind: items.find((i) => i.id === item.menuItem.id)?.kind ?? 'food',
          })),
        });

        const orderItemRows: OrderItemRow[] = items.map((item) => ({
          id: `${orderRow.id}-${item.id}`,
          order_id: orderRow.id,
          menu_item_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: payload.items.find((p) => p.menuItem.id === item.id)?.menuItem.price ?? null,
          kind: item.kind,
          note: item.note ?? null,
          table_id: payload.meta?.tableId ?? null,
        }));

        const staffOrders = mapSupabaseOrderToStaff({
          ...orderRow,
          items: orderItemRows,
        });

        staffOrders.forEach(upsertStaffOrder);
        return staffOrders[0] ?? null;
      } catch (err) {
        console.error('[addCustomerOrder] unexpected error', err);
        return null;
      }
    },
    [adaptOrderItems, mapSupabaseOrderToStaff, upsertStaffOrder]
  );

  // New function to get bill data by orderId for OrderSummaryScreen
  const getBillDataByOrderId = useCallback(
    async (orderId: string): Promise<OrderItem[]> => {
      return await getOrderItemsByOrderId(orderId);
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    const loadOrders = async () => {
      try {
        const openOrders = await fetchOpenOrdersWithItems();
        if (cancelled) return;

        // Only switch restaurant if URL doesn't specify one (prevents overriding URL selection)
        if (!activeRestaurantId) {
          const nextRestaurantId = openOrders.find((order) => order.restaurant_id)?.restaurant_id;
          if (nextRestaurantId) {
            setActiveRestaurantId(nextRestaurantId);
          }
        }

        const mapped = openOrders.flatMap(mapSupabaseOrderToStaff);
        setOrders(
          mapped.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      } catch (err) {
        console.error('Failed to load orders from Supabase', err);
      }
    };

    const handleInsert = async (row: any) => {
      try {
        const itemsMap = await fetchOrderItemsForOrders([row.id]);
        if (cancelled) return;
        const items = itemsMap.get(row.id) ?? [];
        mapSupabaseOrderToStaff({
          ...(row as OrderWithItems),
          items,
        }).forEach(upsertStaffOrder);
      } catch (err) {
        console.error('Failed to process incoming order', err);
      }
    };

    const setupSubscription = async () => {
      const unsubscribeFn = await subscribeToOrders((payload) => {
        if (cancelled) return;
        console.log('🔔 Subscription callback received:', {
          eventType: payload.eventType,
          orderId: payload.newRow?.id || payload.oldRow?.id
        });
        
        if (payload.eventType === 'INSERT' && payload.newRow) {
          console.log('🔔 INSERT event for order:', payload.newRow.id);
          handleInsert(payload.newRow);
        } else if (payload.eventType === 'UPDATE' && payload.newRow) {
          console.log('🔔 UPDATE event for order:', payload.newRow.id);
          // Recompute station tickets from the updated DB order to avoid clobbering
          // kitchen_status / bar_status changes with the legacy `orders.status` column.
          const updatedOrder = payload.newRow as any as OrderWithItems;
          fetchOrderItemsForOrders([updatedOrder.id])
            .then((itemsMap) => {
              const items = itemsMap.get(updatedOrder.id) ?? [];
              const nextTickets = mapSupabaseOrderToStaff({ ...updatedOrder, items });
              console.log('🔔 Mapped updated order to tickets:', nextTickets.length);
              nextTickets.forEach(upsertStaffOrder);
            })
            .catch((err) => {
              console.error('Failed to refresh order items after UPDATE', err);
            });
        } else if (payload.eventType === 'DELETE' && payload.oldRow) {
          const deletedId = (payload.oldRow as any).id;
          console.log('🔔 DELETE event for order:', deletedId);
          setOrders((prev) => prev.filter((order) => order.id !== deletedId));
        }
      }, activeRestaurantId);

      unsubscribe = unsubscribeFn;
    };

    setupSubscription();
    loadOrders();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [mapSupabaseOrderToStaff, upsertStaffOrder, activeRestaurantId]);

  // CANONICAL: Update table occupancy when orders change
  useEffect(() => {
    syncTableOccupancy(orders);
  }, [orders, syncTableOccupancy]);

  const setTableState = useCallback(async (tableId: string, state: TableState, startedAt?: Date | null) => {
    // Update local state immediately
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId ? { ...table, state, cleaningStartedAt: startedAt ?? table.cleaningStartedAt ?? null } : table
      )
    );

    // NOTE: Table state is now derived from orders, not persisted to legacy 'available' flag
    // The 'available' flag is non-authoritative and should not be used for truth
  }, []);

  const closeTableSession = useCallback(
    async (tableId: string) => {
      const tableOrders = orders.filter(
        (order) => order.tableId === tableId && order.status !== 'DELIVERED'
      );

      // CANONICAL GATE: Check payment completeness before closing
      const uniqueOrderIds = Array.from(new Set(tableOrders.map((order) => order.id)));
      
      if (uniqueOrderIds.length > 0) {
        try {
          // Query order_payment_status view for payment completeness
          const { data: paymentStatus, error } = await supabase
            .from('order_payment_status')
            .select('order_id, is_payment_complete')
            .in('order_id', uniqueOrderIds);

          if (error) {
            console.error('Failed to query payment status:', error);
            alert('Cannot close table: Failed to verify payment status');
            return;
          }

          // Check if all orders are payment complete
          const allPaid = paymentStatus.every((status) => status.is_payment_complete === true);
          
          if (!allPaid) {
            const unpaidOrders = paymentStatus
              .filter((status) => !status.is_payment_complete)
              .map((status) => status.order_id);
            
            console.warn('Blocked table close: Unpaid orders', unpaidOrders);
            alert('Cannot close table: Some orders are not fully paid. Please ensure all bills are settled.');
            return;
          }
        } catch (err) {
          console.error('Error checking payment completeness:', err);
          alert('Cannot close table: Error verifying payment status');
          return;
        }
      }

      // All orders are paid - proceed with closing
      tableOrders.forEach((order) => {
        // With per-station tickets, we only need to close each DB order once.
        // Picking the first ticket per DB order prevents duplicate updates.
        if (!order.ticketId || order.ticketId.endsWith('-kitchen')) {
          updateOrderStatusApi(order.id, 'DELIVERED').catch((err) =>
            console.error('Failed to close table order in Supabase', err)
          );
        }
      });
      setTableState(tableId, 'CLEANING', new Date());
    },
    [orders, setTableState]
  );

  const getOrdersForTable = useCallback(
    (tableId: string) => orders.filter((order) => order.tableId === tableId),
    [orders]
  );

  const value = useMemo<StaffContextValue>(
    () => ({
      orders,
      tables,
      singleOperatorMode,
      setSingleOperatorMode,
      updateOrderStatus,
      updateStationStatus,
      markStationPickedUp,
      markStationDelivered,
      addStaffOrder,
      addCustomerOrder,
      setTableState,
      closeTableSession,
      getOrdersForTable,
      getBillDataByOrderId,
    }),
    [
      addCustomerOrder,
      addStaffOrder,
      closeTableSession,
      getOrdersForTable,
      getBillDataByOrderId,
      markStationDelivered,
      markStationPickedUp,
      orders,
      setTableState,
      tables,
      singleOperatorMode,
      updateOrderStatus,
      updateStationStatus,
    ]
  );

  return <StaffDataContext.Provider value={value}>{children}</StaffDataContext.Provider>;
};

export const useStaffData = () => {
  const context = useContext(StaffDataContext);
  if (!context) {
    throw new Error('useStaffData must be used within StaffDataProvider');
  }
  return context;
};