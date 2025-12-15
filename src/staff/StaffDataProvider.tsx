import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { mockRestaurants } from '../data/mockRestaurants';
import { Language, OrderItem, Restaurant } from '../types';
import { supabase } from '../lib/supabaseClient';
import {
  createOrderWithItems,
  fetchOpenOrdersWithItems,
  fetchOrderItemsForOrders,
  subscribeToOrders,
  updateOrderStatus as updateOrderStatusApi,
  type OrderItemRow,
  type OrderWithItems,
} from '../api/ordersApi';
import { fetchRestaurantTables, type RestaurantTableRow } from '../api/restaurantTablesApi';
import {
  ItemKind,
  OrderStatus,
  OrderType,
  StaffOrder,
  StaffOrderItem,
  StaffOrderPayload,
  Station,
  StaffSeedContext,
  TableInfo,
  TableState,
} from './types';

type StaffContextValue = {
  orders: StaffOrder[];
  tables: TableInfo[];
  singleOperatorMode: boolean;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addStaffOrder: (order: StaffOrder) => void;
  addCustomerOrder: (payload: StaffOrderPayload) => Promise<StaffOrder | null>;
  setTableState: (tableId: string, state: TableState, startedAt?: Date | null) => void;
  closeTableSession: (tableId: string) => void;
  getOrdersForTable: (tableId: string) => StaffOrder[];
};

const StaffDataContext = createContext<StaffContextValue | null>(null);
const SINGLE_OPERATOR_MODE = false;
let externalOrderStatusUpdater: ((orderId: string, status: OrderStatus) => void) | null = null;

export const getExternalOrderStatusUpdater = () => externalOrderStatusUpdater;

const seedRestaurant: Restaurant | null =
  mockRestaurants.find((r) => r.id === 'rest-one-maui') ?? mockRestaurants[0] ?? null;

const titleCase = (value?: string | null) => {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const buildMenuKindIndex = (restaurant?: Restaurant | null) => {
  const index = new Map<string, ItemKind>();
  if (!restaurant) return index;
  restaurant.menu.food.forEach((item) => index.set(item.id, 'food'));
  restaurant.menu.drinks.forEach((item) => index.set(item.id, 'drink'));
  return index;
};

const getTableLabel = (restaurant: Restaurant | null, tableId?: string | null) => {
  if (!restaurant || !tableId) return undefined;
  const table = restaurant.tables.find((t) => t.id === tableId);
  if (!table) return undefined;
  const section = titleCase(table.location);
  return `${section} ${table.number}`;
};

const seedTablesFromRestaurant = (restaurant: Restaurant | null): TableInfo[] => {
  if (!restaurant) return [];
  return restaurant.tables.map((table) => ({
    id: table.id,
    label: `${titleCase(table.location)} ${table.number}`,
    section: titleCase(table.location),
    state: table.available ? 'READY' : 'OCCUPIED',
    cleaningStartedAt: null,
    tableNumber: table.number,
    seats: table.seats,
    location: table.location,
    available: table.available,
    x: table.x,
    y: table.y,
  }));
};

const seedTablesFromDbRows = (rows: RestaurantTableRow[]): TableInfo[] => {
  return (rows ?? []).map((row) => ({
    id: row.id,
    label: row.display_name ?? row.id,
    section: titleCase(row.section ?? row.location),
    state: row.available ? 'READY' : 'OCCUPIED',
    cleaningStartedAt: null,
    tableNumber: row.table_number ?? undefined,
    seats: row.seats ?? undefined,
    location: row.location ?? undefined,
    available: row.available,
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

  const [activeRestaurantId, setActiveRestaurantId] = useState<string>(() => {
    if (typeof window === 'undefined') return seedRestaurant?.id ?? '';
    const params = new URLSearchParams(window.location.search);
    return params.get('restaurantId') ?? seedRestaurant?.id ?? '';
  });

  const activeRestaurant = useMemo(
    () => mockRestaurants.find((r) => r.id === activeRestaurantId) ?? seedRestaurant,
    [activeRestaurantId]
  );

  const [tables, setTables] = useState<TableInfo[]>(() => seedTablesFromRestaurant(activeRestaurant));
  const kindIndex = useMemo(() => buildMenuKindIndex(activeRestaurant), [activeRestaurant]);

  const syncTableOccupancy = useCallback(
    (nextOrders: StaffOrder[]) => {
      setTables((prev) =>
        prev.map((table) => {
          const hasActive = nextOrders.some(
            (order) => order.tableId === table.id && order.status !== 'DELIVERED'
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

  useEffect(() => {
    externalOrderStatusUpdater = updateOrderStatus;
    return () => {
      externalOrderStatusUpdater = null;
    };
  }, [updateOrderStatus]);

  useEffect(() => {
    let cancelled = false;

    const loadTables = async () => {
      if (!activeRestaurantId) return;

      try {
        const rows = await fetchRestaurantTables(activeRestaurantId);
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
        const rows = await fetchRestaurantTables(activeRestaurantId);
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

    const channel = supabase
      .channel(`restaurant-tables-${activeRestaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'restaurant_tables',
          filter: `restaurant_id=eq.${activeRestaurantId}`,
        },
        () => {
          // Any edit in manager tools should refresh the floor plan tables quickly
          void reloadTables();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
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
      const fallbackRestaurant = restaurant ?? seedRestaurant;
      if (!fallbackRestaurant) return [];
      const localKindIndex = restaurant ? buildMenuKindIndex(restaurant) : kindIndex;
      return items
        .map<StaffOrderItem | null>((item) => {
          const kind = localKindIndex.get(item.menuItem.id) ?? 'food';
          return {
            id: item.menuItem.id,
            quantity: item.quantity,
            name: formatMenuName(item.menuItem.name, language),
            kind,
          };
        })
        .filter(Boolean) as StaffOrderItem[];
    },
    [kindIndex]
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
    const hasFoodOnly = items.length > 0 && items.every((item) => item.kind === 'food');
    const hasDrinksOnly = items.length > 0 && items.every((item) => item.kind === 'drink');
    if (hasFoodOnly) return 'kitchen';
    if (hasDrinksOnly) return 'bar';
    return undefined;
  };

  const mapSupabaseOrderToStaff = useCallback(
    (order: OrderWithItems): StaffOrder => {
      const itemList = mapOrderItemsFromSupabase(order.items ?? []);
      const restaurantForOrder =
        mockRestaurants.find((restaurant) => restaurant.id === order.restaurant_id) ??
        activeRestaurant ??
        seedRestaurant;

      const tableLabel =
        order.table_label ??
        (order.table_id ? getTableLabel(restaurantForOrder, order.table_id) : undefined);

      return {
        id: order.id,
        orderType: order.order_type,
        items: itemList,
        tableId: order.table_id ?? undefined,
        tableLabel,
        customerName: order.customer_name ?? undefined,
        note: order.note ?? undefined,
        status: order.status,
        createdAt: new Date(order.created_at ?? Date.now()),
        station: deriveStation(itemList, order.order_type),
      };
    },
    [mapOrderItemsFromSupabase, activeRestaurant]
  );

  const upsertStaffOrder = useCallback((nextOrder: StaffOrder) => {
    setOrders((prev) => {
      const exists = prev.some((order) => order.id === nextOrder.id);
      if (exists) {
        return prev.map((order) => (order.id === nextOrder.id ? nextOrder : order));
      }
      return [nextOrder, ...prev];
    });
  }, []);

  const addCustomerOrder = useCallback(
    async (payload: StaffOrderPayload): Promise<StaffOrder | null> => {
      const restaurant = payload.meta?.restaurant ?? seedRestaurant;
      if (!restaurant) return null;

      const items = adaptOrderItems(payload.items, restaurant, payload.meta?.language);
      if (!items.length) return null;

      const orderType: OrderType =
        payload.meta?.tableId || payload.meta?.tableNumber ? 'dine_in' : 'to_go';
      const tableLabel = payload.meta?.tableId
        ? getTableLabel(restaurant, payload.meta.tableId)
        : undefined;

      try {
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

        const staffOrder = mapSupabaseOrderToStaff({
          ...orderRow,
          items: orderItemRows,
        });

        upsertStaffOrder(staffOrder);
        return staffOrder;
      } catch (err) {
        console.error('Failed to create order in Supabase', err);
        return null;
      }
    },
    [adaptOrderItems, mapSupabaseOrderToStaff, upsertStaffOrder]
  );

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    const loadOrders = async () => {
      try {
        const openOrders = await fetchOpenOrdersWithItems();
        if (cancelled) return;

        const nextRestaurantId = openOrders.find((order) => order.restaurant_id)?.restaurant_id;
        if (nextRestaurantId && nextRestaurantId !== activeRestaurantId) {
          setActiveRestaurantId(nextRestaurantId);
        }

        const mapped = openOrders.map(mapSupabaseOrderToStaff);
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
        upsertStaffOrder(
          mapSupabaseOrderToStaff({
            ...(row as OrderWithItems),
            items,
          })
        );
      } catch (err) {
        console.error('Failed to process incoming order', err);
      }
    };

    const unsubscribeFn = subscribeToOrders((payload) => {
      if (cancelled) return;
      if (payload.eventType === 'INSERT' && payload.newRow) {
        handleInsert(payload.newRow);
      } else if (payload.eventType === 'UPDATE' && payload.newRow) {
        setOrders((prev) => {
          const tableLabel =
            (payload.newRow as any).table_label ??
            ((payload.newRow as any).table_id
              ? getTableLabel(activeRestaurant, (payload.newRow as any).table_id)
              : undefined);
          const hasExisting = prev.some((order) => order.id === (payload.newRow as any).id);
          if (!hasExisting) return prev;
          return prev.map((order) =>
            order.id === (payload.newRow as any).id
              ? {
                  ...order,
                  status: (payload.newRow as any).status ?? order.status,
                  note: (payload.newRow as any).note ?? order.note,
                  tableId: (payload.newRow as any).table_id ?? order.tableId,
                  tableLabel: tableLabel ?? order.tableLabel,
                }
              : order
          );
        });
      } else if (payload.eventType === 'DELETE' && payload.oldRow) {
        setOrders((prev) => prev.filter((order) => order.id !== (payload.oldRow as any).id));
      }
    });

    unsubscribe = unsubscribeFn;
    loadOrders();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [mapSupabaseOrderToStaff, upsertStaffOrder, activeRestaurantId]);

  const setTableState = useCallback((tableId: string, state: TableState, startedAt?: Date | null) => {
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId ? { ...table, state, cleaningStartedAt: startedAt ?? table.cleaningStartedAt ?? null } : table
      )
    );
  }, []);

  const closeTableSession = useCallback(
    (tableId: string) => {
      const tableOrders = orders.filter(
        (order) => order.tableId === tableId && order.status !== 'DELIVERED'
      );
      tableOrders.forEach((order) => {
        updateOrderStatusApi(order.id, 'DELIVERED').catch((err) =>
          console.error('Failed to close table order in Supabase', err)
        );
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
      singleOperatorMode: SINGLE_OPERATOR_MODE,
      updateOrderStatus,
      addStaffOrder,
      addCustomerOrder,
      setTableState,
      closeTableSession,
      getOrdersForTable,
    }),
    [addCustomerOrder, addStaffOrder, closeTableSession, getOrdersForTable, orders, setTableState, tables, updateOrderStatus]
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
