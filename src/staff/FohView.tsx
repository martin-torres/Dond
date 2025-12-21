import { useMemo, useState } from 'react';
import { StaffLayout } from './StaffLayout';
import { useStaffData } from './StaffDataProvider';
import { TicketCard } from './TicketCard';
import { updateOrderStatus } from './orderStatus';
import { Button } from '../components/ui/button';import { Card } from '../components/ui/card';
import FloorPlanTablePicker, { TableSignal } from '../components/FloorPlanTablePicker';
import { Table } from '../types';
import { OrderStatus, StaffOrder } from './types';

export const FohView = () => {
  const { tables, orders, setTableState, closeTableSession } = useStaffData();
  console.log('Table data check:', tables.map(t => ({ id: t.id, x: t.x, y: t.y })));
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
      const hasOrder = active.some(
        (order) => order.orderType !== 'request' && order.status === 'NEW'
      );
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

  const tableOrdersSorted = useMemo(
  () =>
    [...tableOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
  [tableOrders] // Add this
);

  const actionsForOrder = (order: StaffOrder) => {
    if (order.orderType === 'request') return requestActions(order);
    if (order.status === 'READY')
      return [{ label: 'Picking up', onClick: () => updateOrderStatus(order.id, 'PICKING_UP') }];
    if (order.status === 'PICKING_UP')
      return [{ label: 'Delivered', onClick: () => updateOrderStatus(order.id, 'DELIVERED') }];
    return [];
  };

  const sidebarWidthOpen = 'clamp(320px, 20vw, 420px)';
  const sidebarWidthClosed = '44px';

  return (
    <StaffLayout title="FOH / Server ✅ EDIT TEST" hideNav fullBleed>
      {/* ... */}
      <div className="h-full w-full overflow-hidden p-6" style={{ height: 'calc(100vh - 20px)' }}>
        <Card className="h-full w-full overflow-hidden border border-slate-200 bg-white shadow-sm flex flex-col" style={{ minHeight: 0 }}>
          <div className="flex h-full w-full overflow-hidden gap-6 p-6" style={{ minHeight: 0 }}>
            {/* LEFT: Floorplan card (bounded, no page scroll) */}
            <div
              className="h-full overflow-hidden"
            style={{
              width: sidebarOpen ? '80%' : '100%',
              transition: 'width 300ms',
            }}
           >
              <Card className="h-full w-full overflow-hidden border border-slate-200 bg-white shadow-sm">
                <div className="h-full w-full p-6 box-border overflow-hidden">
                  <FloorPlanTablePicker
                    tables={tables.map(
                      (table) =>
                        ({
                  id: table.id,
                  label: table.label ?? `Table ${table.tableNumber ?? 0}`,
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
                    compact={sidebarOpen}
                    hideMeta
                    selectedLocation="all"
                    selectedTableId={selectedTable?.id ?? null}
                    onTableClick={(table) => {
                      setSelectedTableId(table.id);
                      setSidebarOpen(true);
                    }}
                    tableSignals={tableSignals}
                  />
                </div>
              </Card>
            </div>

            {/* RIGHT: Sidebar card with internal scroll */}
            <div
              className="h-full flex-shrink-0 overflow-hidden"
              style={{
                width: sidebarOpen ? sidebarWidthOpen : sidebarWidthClosed,
                transition: 'width 300ms',
              }}
            >
              <Card className="h-full overflow-hidden border border-slate-200 bg-white shadow-sm flex flex-col">
                <div className="h-full w-full flex flex-col overflow-hidden p-4">
                  {/* Handle strip */}
                  <div className="flex items-center justify-between border border-slate-200 bg-white rounded-lg px-4 py-3 shadow-sm flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      onClick={() => setSidebarOpen((v) => !v)}
                      aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                      title={sidebarOpen ? 'Collapse' : 'Expand'}
                    >
                      {sidebarOpen ? '→' : '←'}
                    </button>

                    {sidebarOpen && (
                      <div className="flex-1 px-2">
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Table</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {selectedTable?.label ?? '—'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Scrollable content area */}
                  <div className="flex-1 overflow-hidden pt-3">
                    {sidebarOpen && selectedTable && (
                      <div className="rounded-lg border border-emerald-100 bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Table</p>
                            <h2 className="text-xl font-semibold text-gray-900">
                              {selectedTable.label}
                            </h2>
                            {selectedTable.cleaningStartedAt && selectedTable.state === 'CLEANING' && (
                              <p className="text-xs text-blue-700 mt-1">
                                Cleaning · {cleaningMinutes} min
                              </p>
                            )}
                          </div>

                          <div className="flex gap-3">
                            {selectedTable.state === 'CLEANING' && (
                              <>
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    setTableState(selectedTable.id, 'CLEANING', new Date())
                                  }
                                >
                                  Getting table ready
                                </Button>
                                <Button onClick={() => setTableState(selectedTable.id, 'READY', null)}>
                                  Table ready
                                </Button>
                              </>
                            )}
                            {selectedTable.state === 'OCCUPIED' && (
                              <Button
                                variant="outline"
                                onClick={() => closeTableSession(selectedTable.id)}
                              >
                                Close & clean
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Orders list - ONLY THIS SCROLLS */}
                        <div className="mt-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          <div className="space-y-4">
                            {tableOrdersSorted.length === 0 && (
                              <p className="text-sm text-gray-500">
                                No active orders for this table.
                              </p>
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
                      </div>
                    )}

                    {sidebarOpen && !selectedTable && (
                      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">Select a table.</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    </StaffLayout>
  );
};
