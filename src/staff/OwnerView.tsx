import { useMemo, useState } from 'react';
import { StaffLayout } from './StaffLayout';
import { useStaffData } from './StaffDataProvider';
import { TicketCard } from './TicketCard';
import { filterItemsByKind } from './utils';
import { OrderStatus, StaffOrder } from './types';
import FloorPlanTablePicker, { TableSignal } from '../components/FloorPlanTablePicker';
import { Card } from '../components/ui/card';
import { Table } from '../types';

const pickItemsForOwner = (order: StaffOrder) => {
  if (order.orderType === 'request') return order.items;
  const food = filterItemsByKind(order, 'food');
  const drinks = filterItemsByKind(order, 'drink');
  if (food.length > 0 && drinks.length === 0) return food;
  if (drinks.length > 0 && food.length === 0) return drinks;
  return order.items;
};

const getAccent = (order: StaffOrder): 'kitchen' | 'bar' | 'server' | 'owner' => {
  if (order.orderType === 'request') return 'server';
  const hasFood = filterItemsByKind(order, 'food').length > 0;
  const hasDrink = filterItemsByKind(order, 'drink').length > 0;
  if (hasFood && !hasDrink) return 'kitchen';
  if (!hasFood && hasDrink) return 'bar';
  if (order.station === 'bar') return 'bar';
  if (order.station === 'kitchen') return 'kitchen';
  return 'owner';
};

type VirtualTable = Table & { isVirtual: boolean; orderIds: string[] };

export const OwnerView = () => {
  const { orders, tables, singleOperatorMode, updateOrderStatus } = useStaffData();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(tables[0]?.id ?? null);

  const managerEnabled = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const isManagerPath = window.location.pathname.replace(/\/+$/, '') === '/manager';
    return isManagerPath && sessionStorage.getItem('managerUnlocked') === '1';
  }, []);

  const virtualTables: VirtualTable[] = useMemo(() => {
    const toGoOrders = orders.filter((order) => order.orderType === 'to_go' && !order.tableId);
    return toGoOrders.map((order, idx) => ({
      id: `virtual-togo-${idx}`,
      number: 900 + idx + 1,
      seats: 0,
      location: 'middle',
      available: true,
      x: 0,
      y: 0,
      isVirtual: true,
      orderIds: [order.id],
      label: `TO-GO ${idx + 1}`,
      state: 'READY',
    }));
  }, [orders]);

  const allTables = useMemo(() => {
    const mapped = tables.map(
      (table) =>
        ({
          id: table.id,
          number: table.tableNumber ?? 0,
          seats: table.seats ?? 4,
          location: (table.location as Table['location']) ?? 'middle',
          available: table.available ?? (table.state === 'READY'),
          reserved: table.state === 'OCCUPIED' ? false : undefined,
          x: table.x ?? 0,
          y: table.y ?? 0,
          isVirtual: false,
          orderIds: [],
          label: table.label ?? `Table ${table.tableNumber ?? ''}`,
          state: table.state,
        } as VirtualTable)
    );
    return [...mapped, ...virtualTables];
  }, [tables, virtualTables]);

  const selectedTable = useMemo(
    () => allTables.find((table) => table.id === selectedTableId) ?? allTables[0],
    [allTables, selectedTableId]
  );

  const tableOrders = useMemo(() => {
    if (!selectedTable) return [];
    if (selectedTable.isVirtual) {
      return orders.filter((order) => selectedTable.orderIds.includes(order.id));
    }
    return orders.filter((order) => order.tableId === selectedTable.id);
  }, [orders, selectedTable]);

  const tableSignals = useMemo(() => {
    const signalMap: Record<string, TableSignal> = {};
    allTables.forEach((table) => {
      const active = orders.filter((order) => {
        if (table.isVirtual) return table.orderIds.includes(order.id) && order.status !== 'DELIVERED';
        return order.tableId === table.id && order.status !== 'DELIVERED';
      });
      const hasRequest = active.some((order) => order.orderType === 'request');
      const hasOrder = active.some((order) => order.orderType !== 'request');
      const inProcess = active.some((order) => order.status === 'IN_PROGRESS');
      const ready = active.some((order) => order.status === 'READY');
      const pickingUp = active.some((order) => order.status === 'PICKING_UP');
      signalMap[table.id] = {
        hasRequest,
        hasOrder,
        inProcess,
        ready,
        pickingUp,
      };
    });
    return signalMap;
  }, [allTables, orders]);

  const tableOrdersSorted = useMemo(
    () =>
      [...tableOrders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [tableOrders]
  );

  const actionsForOrder = (order: StaffOrder) => {
    if (order.orderType === 'request') {
      if (order.status === 'NEW') {
        return [
          { label: 'Handle now', onClick: () => updateOrderStatus(order.id, 'DELIVERED') },
          { label: 'Acknowledge', onClick: () => updateOrderStatus(order.id, 'IN_PROGRESS') },
        ];
      }
      if (order.status !== 'DELIVERED') {
        return [{ label: 'Done', onClick: () => updateOrderStatus(order.id, 'DELIVERED') }];
      }
      return [];
    }

    if (order.orderType === 'to_go') {
      if (order.status === 'NEW') {
        return [{ label: 'Start', onClick: () => updateOrderStatus(order.id, 'IN_PROGRESS') }];
      }
      if (order.status === 'IN_PROGRESS') {
        return [{ label: 'Ready for pickup', onClick: () => updateOrderStatus(order.id, 'READY') }];
      }
      if (order.status === 'READY' || order.status === 'PICKING_UP') {
        return [{ label: 'Done / Delivered', onClick: () => updateOrderStatus(order.id, 'DELIVERED') }];
      }
      return [];
    }

    // Dine-in and everything else: minimal taps for single operator
    if (order.status === 'NEW') {
      return [{ label: 'Start', onClick: () => updateOrderStatus(order.id, 'IN_PROGRESS') }];
    }
    if (order.status !== 'DELIVERED') {
      return [{ label: 'Deliver', onClick: () => updateOrderStatus(order.id, 'DELIVERED') }];
    }
    return [];
  };

  const legendPill = (label: string, color: string) => (
    <span
      key={label}
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
      style={{ borderColor: `${color}33`, color, backgroundColor: '#ffffff' }}
    >
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );

  return (
    <StaffLayout
      title="Owner view"
      subtitle={
        singleOperatorMode
          ? 'Single-operator control across food, drinks, requests, and to-go.'
          : 'Overview with full control across every order.'
      }
      hideNav
    >
      <Card className="p-4 space-y-4 border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Full floor</p>
            <h2 className="text-xl font-semibold text-gray-900">Tap a table or to-go ticket</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {managerEnabled && (
               <a
                   href="/manager/edit"
                   className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                   title="Edit restaurant configuration"
                   aria-label="Edit restaurant configuration"
               >
                ✎ Edit
             </a>
          )}

          {legendPill('Request', '#f59e0b')}
          {legendPill('Order', '#0ea5e9')}
          {legendPill('In process', '#fb7185')}
          {legendPill('Ready', '#10b981')}
          {legendPill('Pickup', '#6366f1')}
        </div>
        </div>

        <div className="grid gap-4">
          <FloorPlanTablePicker
            tables={allTables}
            language="en"
            selectedLocation="all"
            selectedTableId={selectedTable?.id ?? null}
            onTableClick={(table) => setSelectedTableId(table.id)}
            tableSignals={tableSignals}
          />

          {selectedTable && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Selected</p>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedTable.label ?? `Table ${selectedTable.number}`}
                  </h2>
                </div>
              </div>

              <div className="space-y-3">
                {tableOrdersSorted.length === 0 && (
                  <p className="text-sm text-gray-500">No active orders for this table.</p>
                )}
                {tableOrdersSorted.map((order) => (
                  <TicketCard
                    key={order.id}
                    order={order}
                    items={pickItemsForOwner(order)}
                    accent={getAccent(order)}
                    actions={actionsForOrder(order)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </StaffLayout>
  );
};
