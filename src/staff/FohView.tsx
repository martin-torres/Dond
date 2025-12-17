import { useMemo, useState } from 'react';
import { StaffLayout } from './StaffLayout';
import { useStaffData } from './StaffDataProvider';
import { TicketCard } from './TicketCard';
import { updateOrderStatus } from './orderStatus';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import FloorPlanTablePicker, { TableSignal } from '../components/FloorPlanTablePicker';
import { Table } from '../types';
import { OrderStatus, StaffOrder } from './types';

export const FohView = () => {
  const { tables, orders, setTableState, closeTableSession } = useStaffData();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(tables[0]?.id ?? null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? tables[0],
    [selectedTableId, tables]
  );

  const tableOrders = useMemo(
    () => (selectedTable ? orders.filter((order) => order.tableId === selectedTable.id) : []),
    [orders, selectedTable]
  );

  const tableSignals = useMemo(() => {
    const signalMap: Record<string, TableSignal> = {};
    tables.forEach((table) => {
      const active = orders.filter(
        (order) => order.tableId === table.id && order.status !== 'DELIVERED'
      );
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
  }, [orders, tables]);

  const cleaningMinutes =
    selectedTable?.cleaningStartedAt && selectedTable.state === 'CLEANING'
      ? Math.floor((Date.now() - new Date(selectedTable.cleaningStartedAt).getTime()) / 60000)
      : 0;

  const requestActions = (request: StaffOrder) => {
    const baseActions: { label: string; next: OrderStatus; variant?: 'outline' | 'secondary' }[] =
      request.status === 'NEW'
        ? [
            { label: 'Handle now', next: 'DELIVERED' },
            { label: 'Acknowledge', next: 'IN_PROGRESS', variant: 'outline' },
          ]
        : request.status === 'IN_PROGRESS'
          ? [
              { label: 'Ready', next: 'READY' },
              { label: 'Done', next: 'DELIVERED', variant: 'outline' },
            ]
          : request.status === 'READY'
            ? [
                { label: 'Picking up', next: 'PICKING_UP' },
                { label: 'Delivered', next: 'DELIVERED', variant: 'outline' },
              ]
            : request.status === 'PICKING_UP'
              ? [{ label: 'Delivered', next: 'DELIVERED' }]
              : [];

    return baseActions.map((action) => ({
      label: action.label,
      onClick: () => updateOrderStatus(request.id, action.next),
      variant: action.variant,
    }));
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

  const tableOrdersSorted = useMemo(
    () =>
      [...tableOrders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [tableOrders]
  );

  const actionsForOrder = (order: StaffOrder) => {
    if (order.orderType === 'request') return requestActions(order);
    if (order.status === 'READY')
      return [{ label: 'Picking up', onClick: () => updateOrderStatus(order.id, 'PICKING_UP') }];
    if (order.status === 'PICKING_UP')
      return [{ label: 'Delivered', onClick: () => updateOrderStatus(order.id, 'DELIVERED') }];
    return [];
  };

  return (
    <StaffLayout
      title="FOH / Server"
      subtitle="Single floor view with at-a-glance table alerts."
      hideNav
    >
      <Card className="p-4 space-y-4 border border-emerald-100 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Floor activity</p>
            <h2 className="text-xl font-semibold text-gray-900">Tap a table to view details</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setSidebarOpen((open) => !open)}>
              {sidebarOpen ? 'Hide details' : 'Show details'}
            </Button>

            {legendPill('Request', '#f59e0b')}
            {legendPill('Order', '#0ea5e9')}
            {legendPill('In process', '#fb7185')}
            {legendPill('Ready', '#10b981')}
            {legendPill('Pickup', '#6366f1')}
          </div>
        </div>

        <div className="flex gap-4">
          <div
            className={`transition-all duration-300 ${
              sidebarOpen ? 'flex-1 scale-[0.8] origin-top-left' : 'flex-1'
            }`}
          >
            <FloorPlanTablePicker
              tables={tables.map(
                (table) =>
                  ({
                    id: table.id,
                    number: table.tableNumber ?? 0,
                    seats: table.seats ?? 4,
                    location: (table.location as Table['location']) ?? 'middle',
                    available: table.state === 'READY',
                    reserved: table.state === 'OCCUPIED' ? false : undefined,
                    x: table.x ?? 0,
                    y: table.y ?? 0,
                  } as Table)
              )}
              language="en"
              selectedLocation="all"
              selectedTableId={selectedTable?.id ?? null}
              onTableClick={(table) => setSelectedTableId(table.id)}
              tableSignals={tableSignals}
            />
          </div>

          <div
            className={`transition-all duration-300 overflow-hidden ${
              sidebarOpen ? 'w-[420px]' : 'w-0'
            }`}
          >
            <div
              className={`transition-opacity duration-300 ${
                sidebarOpen ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {selectedTable && (
                <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Table</p>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedTable.label}</h2>
                      {selectedTable.cleaningStartedAt && selectedTable.state === 'CLEANING' && (
                        <p className="text-xs text-blue-700 mt-1">
                          Cleaning · {cleaningMinutes} min
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {selectedTable.state === 'CLEANING' && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => setTableState(selectedTable.id, 'CLEANING', new Date())}
                          >
                            Getting table ready
                          </Button>
                          <Button onClick={() => setTableState(selectedTable.id, 'READY', null)}>
                            Table ready
                          </Button>
                        </>
                      )}
                      {selectedTable.state === 'OCCUPIED' && (
                        <Button variant="outline" onClick={() => closeTableSession(selectedTable.id)}>
                          Close & clean
                        </Button>
                      )}
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
                        items={order.items}
                        accent="server"
                        actions={actionsForOrder(order)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </StaffLayout>
  );
};
