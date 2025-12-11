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
import {
  ItemKind,
  OrderStatus,
  OrderType,
  StaffOrder,
  StaffOrderItem,
  StaffOrderPayload,
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
  addCustomerOrder: (payload: StaffOrderPayload) => StaffOrder | null;
  setTableState: (tableId: string, state: TableState, startedAt?: Date | null) => void;
  closeTableSession: (tableId: string) => void;
  getOrdersForTable: (tableId: string) => StaffOrder[];
};

const StaffDataContext = createContext<StaffContextValue | null>(null);
const SINGLE_OPERATOR_MODE = false;
let externalOrderStatusUpdater: ((orderId: string, status: OrderStatus) => void) | null = null;

export const getExternalOrderStatusUpdater = () => externalOrderStatusUpdater;

const seedRestaurant: Restaurant | null = mockRestaurants[0] ?? null;

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

const formatMenuName = (name: Record<Language, string>, language?: Language) => {
  if (language && name[language]) return name[language];
  return name.en ?? Object.values(name)[0];
};

const makeItem = (
  id: string,
  kindIndex: Map<string, ItemKind>,
  restaurant: Restaurant | null,
  quantity = 1,
  language?: Language
): StaffOrderItem | null => {
  if (!restaurant) return null;
  const allItems = [...restaurant.menu.food, ...restaurant.menu.drinks];
  const match = allItems.find((item) => item.id === id);
  if (!match) return null;
  return {
    id,
    quantity,
    name: formatMenuName(match.name, language),
    kind: kindIndex.get(id) ?? 'food',
  };
};

const seedOrdersFromRestaurant = (restaurant: Restaurant | null): StaffOrder[] => {
  if (!restaurant) return [];
  const kindIndex = buildMenuKindIndex(restaurant);
  const sample: StaffOrder[] = [];
  const taco = makeItem('rup-food-1', kindIndex, restaurant, 2);
  const empanada = makeItem('rup-food-3', kindIndex, restaurant, 1);
  const beer = makeItem('rup-drink-3', kindIndex, restaurant, 2);
  const mezcal = makeItem('rup-drink-1', kindIndex, restaurant, 1);
  if (taco && beer) {
    sample.push({
      id: 'seed-order-1',
      orderType: 'dine_in',
      tableId: 'rup-table-2',
      tableLabel: getTableLabel(restaurant, 'rup-table-2'),
      items: [taco, beer],
      note: 'NO ONION',
      createdAt: new Date(Date.now() - 8 * 60 * 1000),
      status: 'NEW',
      station: 'kitchen',
    });
  }
  if (empanada && mezcal) {
    sample.push({
      id: 'seed-order-2',
      orderType: 'dine_in',
      tableId: 'rup-table-8',
      tableLabel: getTableLabel(restaurant, 'rup-table-8'),
      items: [empanada, mezcal],
      note: 'FIRE FAST',
      createdAt: new Date(Date.now() - 14 * 60 * 1000),
      status: 'IN_PROGRESS',
      station: 'bar',
    });
  }
  if (mezcal) {
    sample.push({
      id: 'seed-order-3',
      orderType: 'to_go',
      customerName: 'Camila',
      items: [{ ...mezcal, quantity: 2 }],
      note: 'WHATSAPP ETA 15',
      createdAt: new Date(Date.now() - 4 * 60 * 1000),
      status: 'NEW',
      station: 'bar',
    });
  }
  sample.push({
    id: 'seed-request-1',
    orderType: 'request',
    tableId: 'rup-table-4',
    tableLabel: getTableLabel(restaurant, 'rup-table-4'),
    items: [
      {
        id: 'request-water',
        name: 'Water refill',
        quantity: 1,
        kind: 'food',
      },
    ],
    note: 'CALL SERVER',
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
    status: 'READY',
    station: 'server',
  });
  return sample;
};

export const StaffDataProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<StaffOrder[]>(() => seedOrdersFromRestaurant(seedRestaurant));
  const [tables, setTables] = useState<TableInfo[]>(() => seedTablesFromRestaurant(seedRestaurant));
  const [kindIndex] = useState(() => buildMenuKindIndex(seedRestaurant));

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
      setOrders((prev) => {
        const next = prev.map((order) => (order.id === orderId ? { ...order, status } : order));
        return next;
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
    syncTableOccupancy(orders);
  }, [orders, syncTableOccupancy]);

  const addStaffOrder = useCallback(
    (order: StaffOrder) => {
      setOrders((prev) => [order, ...prev]);
      if (order.tableId) {
        setTables((prev) =>
          prev.map((table) =>
            table.id === order.tableId ? { ...table, state: 'OCCUPIED', cleaningStartedAt: null } : table
          )
        );
      }
    },
    []
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

  const addCustomerOrder = useCallback(
    (payload: StaffOrderPayload): StaffOrder | null => {
      const restaurant = payload.meta?.restaurant ?? seedRestaurant;
      const items = adaptOrderItems(payload.items, restaurant, payload.meta?.language);
      if (!items.length) return null;
      const orderType: OrderType =
        payload.meta?.tableId || payload.meta?.tableNumber ? 'dine_in' : 'to_go';
      const tableLabel = payload.meta?.tableId
        ? getTableLabel(restaurant, payload.meta.tableId)
        : undefined;
      const order: StaffOrder = {
        id: `order-${Date.now()}`,
        orderType,
        tableId: payload.meta?.tableId ?? undefined,
        tableLabel,
        items,
        customerName: payload.meta?.customerName,
        note: payload.meta?.note,
        status: 'NEW',
        createdAt: new Date(),
      };
      addStaffOrder(order);
      return order;
    },
    [adaptOrderItems, addStaffOrder]
  );

  const setTableState = useCallback((tableId: string, state: TableState, startedAt?: Date | null) => {
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId ? { ...table, state, cleaningStartedAt: startedAt ?? table.cleaningStartedAt ?? null } : table
      )
    );
  }, []);

  const closeTableSession = useCallback(
    (tableId: string) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.tableId === tableId ? { ...order, status: 'DELIVERED' } : order
        )
      );
      setTableState(tableId, 'CLEANING', new Date());
    },
    [setTableState]
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
