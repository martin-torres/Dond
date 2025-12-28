import { useEffect, useMemo, useState, useCallback } from 'react';
import { StaffLayout } from './StaffLayout';
import { useStaffData } from './StaffDataProvider';
import { TicketCard } from './TicketCard';
import { markStationPickedUp, markStationDelivered, updateStationStatus } from './orderStatus';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import FloorPlanTablePicker, { TableSignal } from '../components/FloorPlanTablePicker';
import { Table } from '../types';
import { OrderStatus, StaffOrder, TableInfo } from './types';

export const FohView = () => {
  const { tables, orders, setTableState, closeTableSession, singleOperatorMode, setSingleOperatorMode } = useStaffData();
  const activeRestaurantId = new URLSearchParams(window.location.search).get('restaurantId') ?? '';
  const [selectedTableId, setSelectedTableId] = useState<string | null>(tables[0]?.id ?? null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [gridMode, setGridMode] = useState(false);

  // In single-operator mode, automatically focus the most urgent table and keep sidebar open.
  // Priority: request > ready > picking_up > in_progress > new.
  const preferredTableId = useMemo(() => {
    if (!tables.length) return null;

    const weightFor = (signal: TableSignal): number => {
      if (signal.hasRequest) return 400;
      if (signal.ready) return 350;
      if (signal.pickingUp) return 300;
      if (signal.inProcess) return 150;
      if (signal.hasOrder) return 100;
      return 0;
    };

    let bestId: string | null = null;
    let bestScore = -1;

    for (const table of tables) {
      const active = orders.filter((order) => order.tableId === table.id && order.status !== 'DELIVERED');
      if (!active.length) continue;
      const hasRequest = active.some((order) => order.orderType === 'request');
      const hasOrder = active.some((order) => order.orderType !== 'request' && order.status === 'NEW');
      const inProcess = active.some((order) => order.status === 'IN_PROGRESS');
      const ready = active.some((order) => order.status === 'READY');
      const pickingUp = active.some((order) => order.status === 'PICKING_UP');
      const score = weightFor({ hasRequest, hasOrder, inProcess, ready, pickingUp });
      if (score > bestScore) {
        bestScore = score;
        bestId = table.id;
      }
    }

    return bestId ?? tables[0]?.id ?? null;
  }, [orders, tables]);

  // Enhanced priority detection for auto-select
  const getHighestPriorityTable = useCallback((tables: TableInfo[], orders: StaffOrder[]): TableInfo | null => {
    // Find tables with READY items first (highest priority)
    const readyTables = tables.filter(table =>
      orders.some(order =>
        order.tableId === table.id &&
        (order.status === 'READY' || order.status === 'PICKING_UP')
      )
    );

    if (readyTables.length > 0) {
      // Sort by oldest READY order (time-based tiebreaker)
      return readyTables.sort((a, b) => {
        const aReadyOrders = orders.filter(o => o.tableId === a.id && o.status === 'READY');
        const bReadyOrders = orders.filter(o => o.tableId === b.id && o.status === 'READY');
        const aOldest = Math.min(...aReadyOrders.map(o => new Date(o.createdAt).getTime()));
        const bOldest = Math.min(...bReadyOrders.map(o => new Date(o.createdAt).getTime()));
        return aOldest - bOldest; // Oldest first
      })[0];
    }

    // Fallback to any table with active orders if no READY items
    const tablesWithOrders = tables.filter(table =>
      orders.some(order => order.tableId === table.id && order.status !== 'DELIVERED')
    );

    return tablesWithOrders.length > 0 ? tablesWithOrders[0] : null;
  }, []);

  // React to changes after new orders arrive.
  // (We keep it minimal to avoid disrupting manual selection in normal mode.)
  useEffect(() => {
    if (!singleOperatorMode) return;
    if (!preferredTableId) return;
    if (selectedTableId === preferredTableId) return;
    setSelectedTableId(preferredTableId);
    setSidebarOpen(true);
  }, [preferredTableId, selectedTableId, singleOperatorMode]);

  // Enhanced auto-select logic for seamless updates
  useEffect(() => {
    // Only auto-select on initial load or when no table is manually selected
    if (selectedTableId) return; // Don't override manual selection

    const priorityTable = getHighestPriorityTable(tables, orders);
    if (priorityTable) {
      setSelectedTableId(priorityTable.id);
      setSidebarOpen(true);
    }
  }, [tables, orders, selectedTableId, getHighestPriorityTable]);

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? tables[0],
    [selectedTableId, tables]
  );

  const tableOrders = useMemo(
    () =>
      selectedTable
        ? orders.filter(
            (order) =>
              order.tableId === selectedTable.id &&
              order.status !== 'DELIVERED'
          )
        : [],
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

  const tableOrdersSorted = useMemo(
    () =>
      [...tableOrders].sort((a, b) => {
        // Priority order: REQUEST > READY > PICKING_UP > IN_PROGRESS > NEW
        const getPriorityWeight = (order: StaffOrder): number => {
          if (order.orderType === 'request') return 400;
          if (order.status === 'READY') return 350;
          if (order.status === 'PICKING_UP') return 300;
          if (order.status === 'IN_PROGRESS') return 150;
          if (order.status === 'NEW') return 100;
          return 0;
        };

        const aWeight = getPriorityWeight(a);
        const bWeight = getPriorityWeight(b);

        // If same priority, sort by creation time (older first)
        if (aWeight === bWeight) {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }

        // Higher priority comes first
        return bWeight - aWeight;
      }),
    [tableOrders]
  );

  const actionsForOrder = (order: StaffOrder) => {
    // In 1-op mode, allow full control over all order types
    if (singleOperatorMode) {
      if (order.orderType === 'request') {
        // Handle request orders in 1-op mode
        if (order.status === 'NEW') {
          return [{ label: 'Handle', onClick: () => updateStationStatus(order.id, 'server', 'IN_PROGRESS') }];
        }
        if (order.status === 'IN_PROGRESS') {
          return [{ label: 'Complete', onClick: () => markStationDelivered(order.id, 'server') }];
        }
        return [];
      }
      // Handle kitchen/bar orders in 1-op mode
      const station = order.station;
      if (order.status === 'NEW' && (station === 'kitchen' || station === 'bar')) {
        return [{ label: 'Start', onClick: () => updateStationStatus(order.id, station, 'IN_PROGRESS') }];
      }
      if (order.status === 'IN_PROGRESS' && (station === 'kitchen' || station === 'bar')) {
        return [{ label: 'Ready', onClick: () => updateStationStatus(order.id, station, 'READY') }];
      }
      if (order.status === 'READY' && (station === 'kitchen' || station === 'bar')) {
        return [{ label: 'Pick Up', onClick: () => markStationPickedUp(order.id, station) }];
      }
      if (order.status === 'PICKING_UP' && (station === 'kitchen' || station === 'bar')) {
        return [{ label: 'Delivered', onClick: () => markStationDelivered(order.id, station) }];
      }
      return [];
    }

    // Normal mode - FOH only handles pickup/delivery
    if (order.orderType === 'request') return [];
    const station = order.station;
    if (order.status === 'READY' && (station === 'kitchen' || station === 'bar')) {
      return [
        {
          label: `Pick up ${station === 'bar' ? 'drinks' : 'food'}`,
          onClick: () => markStationPickedUp(order.id, station),
        },
      ];
    }
    if (order.status === 'PICKING_UP' && (station === 'kitchen' || station === 'bar')) {
      return [
        {
          label: `Delivered ${station === 'bar' ? 'drinks' : 'food'}`,
          onClick: () => markStationDelivered(order.id, station),
        },
      ];
    }
    return [];
  };

  const sidebarWidthOpen = 'clamp(320px, 20vw, 420px)';
  const sidebarWidthClosed = '44px';

  return (
    <StaffLayout title="FOH / Server" hideNav fullBleed>
      {/* ... */}
      <div className="h-full w-full overflow-hidden p-6" style={{ height: 'calc(100vh - 20px)' }}>
        <Card className="h-full w-full overflow-hidden border border-slate-200 shadow-sm flex flex-col" style={{ minHeight: 0 }}>
          <div className="flex h-full w-full overflow-hidden gap-6 p-6" style={{ minHeight: 0 }}>
            {/* LEFT: Floorplan card (bounded, no page scroll) */}
            <div
              className="h-full overflow-hidden"
            style={{
              width: sidebarOpen ? '80%' : '100%',
              transition: 'width 300ms',
            }}
           >
              <Card className="h-full w-full overflow-hidden border border-slate-200 shadow-sm">
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
                    gridMode={gridMode}
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
              <Card className="h-full overflow-hidden border border-slate-200 shadow-sm flex flex-col">
                <div className="h-full w-full flex flex-col overflow-hidden p-4">
                  {/* Handle strip */}
                  <div className="flex items-center justify-between border border-slate-200 rounded-lg px-4 py-3 shadow-sm flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
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

                    {sidebarOpen && (
                      <>
                        <button
                          type="button"
                          className={`ml-2 inline-flex items-center justify-center rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors ${
                            gridMode
                              ? 'border-blue-300 bg-blue-50 text-blue-800'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                          onClick={() => setGridMode(!gridMode)}
                          title="Toggle grid view"
                        >
                          📍 {gridMode ? 'Grid' : 'Flex'}
                        </button>

                        <button
                          type="button"
                          className={`ml-2 inline-flex items-center justify-center rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors ${
                            singleOperatorMode
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                          onClick={() => setSingleOperatorMode(!singleOperatorMode)}
                          title="Single-operator demo mode"
                        >
                          1-op: {singleOperatorMode ? 'ON' : 'OFF'}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Scrollable content area */}
                  <div className="flex-1 overflow-hidden pt-3">
                    {sidebarOpen && selectedTable && (
                      <div className="rounded-lg border border-emerald-100 p-6 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            {selectedTable.cleaningStartedAt && selectedTable.state === 'CLEANING' && (
                              <p className="text-xs text-blue-700">
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
                                key={order.ticketId ?? order.id}
                                order={order}
                                items={order.items}
                                accent="server"
                                actions={actionsForOrder(order)}
                                hideTableInfo={true}
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
