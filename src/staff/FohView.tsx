import { useMemo, useState, useEffect } from 'react';
import { StaffLayout } from './StaffLayout';
import { useStaffData } from './StaffDataProvider';
import { TicketCard } from './TicketCard';
import { updateOrderStatus } from './orderStatus';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import FloorPlanTablePicker, { TableSignal } from '../components/FloorPlanTablePicker';
import { Table } from '../types';
import { OrderStatus, StaffOrder, StaffOrderItem } from './types';
import { updateOrderItemStatus, getItemsReadyForPickup } from '../api/ordersApi';

export const FohView = () => {
  const { tables, orders, setTableState, closeTableSession } = useStaffData();
  console.log('Table data check:', tables.map(t => ({ id: t.id, x: t.x, y: t.y })));
  const [selectedTableId, setSelectedTableId] = useState<string | null>(tables[0]?.id ?? null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [singleOperatorMode, setSingleOperatorMode] = useState(false);
  // ADD THESE:
  const [manuallySelectedTable, setManuallySelectedTable] = useState(false);
  const [lastOrderCount, setLastOrderCount] = useState(0);

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? tables[0],
    [selectedTableId, tables]
  );

  // Filter to show ALL items that need FOH attention (not just READY)
  const fohItems = useMemo(() => {
    const items: Array<{
      orderId: string;
      order: StaffOrder;
      itemId: string;
      item: StaffOrderItem;
      tableId?: string;
      table?: any;
    }> = [];

    orders.forEach((order) => {
      const allItems = order.items;
      
      allItems.forEach((item) => {
        // Show ALL items except DELIVERED (FOH should see the whole process)
        if (item.status !== 'DELIVERED') {
          const table = tables.find(t => t.id === order.tableId);
          items.push({
            orderId: order.id,
            order,
            itemId: item.id, // This should be the order_items.id (row ID)
            item,
            tableId: order.tableId,
            table
          });
        }
      });
    });

    // Sort by order creation time, then by item kind (drinks first, then food), then by status priority
    return items.sort((a, b) => {
      const timeDiff = new Date(a.order.createdAt).getTime() - new Date(b.order.createdAt).getTime();
      if (timeDiff !== 0) return timeDiff;
      
      // Status priority: READY > PICKING_UP > IN_PROGRESS > NEW
      const statusPriority = (status: string) => {
        switch (status) {
          case 'READY': return 4;
          case 'PICKING_UP': return 3;
          case 'IN_PROGRESS': return 2;
          case 'NEW': return 1;
          default: return 0;
        }
      };
      
      const aPriority = statusPriority(a.item.status || 'NEW');
      const bPriority = statusPriority(b.item.status || 'NEW');
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      // Food first, then drinks (PRIORITY: Food is urgent!)
      if (a.item.kind === 'food' && b.item.kind === 'drink') return -1;
      if (a.item.kind === 'drink' && b.item.kind === 'food') return 1;
      
      return 0;
    });
  }, [orders, tables]);

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

  // Smart sidebar auto-open/close behavior
  useEffect(() => {
    const hasWork = fohItems.length > 0;
    
    if (hasWork && !sidebarOpen) {
      // Auto-open sidebar when work arrives
      setSidebarOpen(true);
    } else if (!hasWork && sidebarOpen && !singleOperatorMode) {
      // Auto-close sidebar when empty (unless single operator mode)
      setSidebarOpen(false);
    }
  }, [fohItems.length, sidebarOpen, singleOperatorMode]);

  // Auto-select priority table only when new orders arrive (not on status changes)
  useEffect(() => {
    const currentOrderCount = orders.length;
    
    // Only auto-select if:
    // 1. New order arrived (order count increased)
    // 2. User hasn't manually selected a table, OR
    // 3. Previously selected table no longer has items
    if (currentOrderCount > lastOrderCount) {
      const selectedTableHasItems = fohItems.some(item => item.tableId === selectedTableId);
      
      if (!manuallySelectedTable || !selectedTableHasItems) {
        // Find highest priority table (has READY items)
        const priorityItem = fohItems.find(item => item.item.status === 'READY');
        if (priorityItem && priorityItem.tableId) {
          setSelectedTableId(priorityItem.tableId);
          setManuallySelectedTable(false);  // Reset since we auto-selected
          console.log('✅ AUTO-SELECT: New order arrived, auto-selected table with READY items');
        }
      } else {
        console.log('✅ MANUAL OVERRIDE: Staying on manually selected table');
      }
    }
    
    setLastOrderCount(currentOrderCount);
  }, [orders.length, fohItems, selectedTableId, manuallySelectedTable, lastOrderCount]);

  const handlePickupItem = async (itemId: string) => {
    console.log('🔴 PICKUP - Item ID:', itemId);
    console.log('🔴 PICKUP - Item Object:', fohItems.find(i => i.itemId === itemId));
    
    try {
      if (singleOperatorMode) {
        // In single operator mode, skip directly to DELIVERED
        await updateOrderItemStatus(itemId, 'DELIVERED');
        console.log('✅ PICKUP - Single operator mode: Item marked as DELIVERED');
      } else {
        // Normal flow: NEW → IN_PROGRESS → READY → PICKING_UP → DELIVERED
        await updateOrderItemStatus(itemId, 'PICKING_UP');
        console.log('✅ PICKUP - Normal mode: Item marked as PICKING_UP');
      }
    } catch (error) {
      console.error('❌ PICKUP - Failed:', error);
    }
  };

  const handleDeliverItem = async (itemId: string) => {
    try {
      await updateOrderItemStatus(itemId, 'DELIVERED');
    } catch (error) {
      console.error('Failed to mark item as delivered:', error);
    }
  };

  // Single operator mode: Skip steps and move items directly
  const handleSingleOperatorAction = async (itemId: string, itemStatus: string) => {
    try {
      if (!singleOperatorMode) return;
      
      if (itemStatus === 'NEW') {
        // Skip to READY (simulate kitchen/bar work)
        await updateOrderItemStatus(itemId, 'READY');
      } else if (itemStatus === 'IN_PROGRESS') {
        // Skip to READY
        await updateOrderItemStatus(itemId, 'READY');
      } else if (itemStatus === 'READY') {
        // Skip to DELIVERED (FOH work)
        await updateOrderItemStatus(itemId, 'DELIVERED');
      }
    } catch (error) {
      console.error('Failed to update item status in single operator mode:', error);
    }
  };

  const sidebarWidthOpen = 'clamp(320px, 20vw, 420px)';
  const sidebarWidthClosed = '44px';

  return (
    <StaffLayout title="FOH / Server ✅ EDIT TEST" hideNav fullBleed>
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
                      setManuallySelectedTable(true);  // Mark as manual selection
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
              <Card className="h-full overflow-hidden border border-slate-200 shadow-sm flex flex-col">
                <div className="h-full w-full flex flex-col overflow-hidden p-4">
                  {/* Handle strip */}
                  <div className="flex items-center justify-between border border-slate-200 rounded-lg px-4 py-3 shadow-sm flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        onClick={() => setSidebarOpen((v) => !v)}
                        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                        title={sidebarOpen ? 'Collapse' : 'Expand'}
                      >
                        {sidebarOpen ? '→' : '←'}
                      </button>
                      
                      {/* Single Operator Mode Toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Single Operator</span>
                        <button
                          type="button"
                          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                            singleOperatorMode ? 'bg-rose-500' : 'bg-gray-200'
                          }`}
                          onClick={() => setSingleOperatorMode(!singleOperatorMode)}
                          aria-label="Toggle single operator mode"
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              singleOperatorMode ? 'translate-x-3' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {sidebarOpen && (
                      <div className="flex-1 px-2">
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Pickup</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {fohItems.length} item{fohItems.length !== 1 ? 's' : ''} ready
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Scrollable content area */}
                  <div className="flex-1 overflow-hidden pt-3">
                    {sidebarOpen && (
                      <div className="rounded-lg border border-emerald-100 p-6 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            {selectedTable?.cleaningStartedAt && selectedTable.state === 'CLEANING' && (
                              <p className="text-xs text-blue-700">
                                Cleaning · {cleaningMinutes} min
                              </p>
                            )}
                          </div>

                          <div className="flex gap-3">
                            {selectedTable?.state === 'CLEANING' && (
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
                            {selectedTable?.state === 'OCCUPIED' && (
                              <Button
                                variant="outline"
                                onClick={() => closeTableSession(selectedTable.id)}
                              >
                                Close & clean
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Items ready for pickup - ONLY THIS SCROLLS */}
                        <div className="mt-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          <div className="space-y-4">
                            {fohItems.length === 0 && (
                              <p className="text-sm text-gray-500">
                                No items ready for pickup. Items will appear here when kitchen/bar marks them as ready.
                              </p>
                            )}
                            {Array.from(
                              fohItems.reduce((acc, item) => {
                                const key = item.tableId || 'unassigned';
                                if (!acc.has(key)) {
                                  acc.set(key, []);
                                }
                                acc.get(key)!.push(item);
                                return acc;
                              }, new Map())
                            ).map(([tableKey, itemsForTable]) => {
                              const table = itemsForTable[0].table;
                              const tableId = itemsForTable[0].tableId;

                              return (
                                <div key={tableKey} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-gray-900">
                                      {table?.label ?? (tableId ? `Table ${tableId}` : 'Unassigned')}
                                    </h4>
                                    <span className="text-xs text-gray-600">
                                      {itemsForTable.length} item{itemsForTable.length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    {itemsForTable.map(({ orderId, order, itemId, item }: {
                                      orderId: string;
                                      order: StaffOrder;
                                      itemId: string;
                                      item: StaffOrderItem;
                                    }) => {
                                      const isDrink = item.kind === 'drink';
                                      const isFood = item.kind === 'food';
                                      
                                      // Status badge colors
                                      const getStatusBadgeColor = (status: string) => {
                                        switch (status) {
                                          case 'NEW': return 'bg-blue-100 text-blue-800 border-blue-200';
                                          case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                                          case 'READY': return 'bg-green-100 text-green-800 border-green-200';
                                          case 'PICKING_UP': return 'bg-purple-100 text-purple-800 border-purple-200';
                                          default: return 'bg-gray-100 text-gray-800 border-gray-200';
                                        }
                                      };

                                      // Button actions based on status
                                      const actions =
                                        item.status === 'READY'
                                          ? [{
                                              label: '🔴 Pickup',
                                              onClick: () => handlePickupItem(itemId),
                                              className: 'bg-rose-500 hover:bg-rose-600 text-white'
                                            }]
                                          : item.status === 'PICKING_UP'
                                            ? [{
                                                label: 'Delivered',
                                                onClick: () => handleDeliverItem(itemId),
                                                className: 'bg-green-500 hover:bg-green-600 text-white'
                                              }]
                                            : [];

                                      return (
                                        <div 
                                          key={itemId} 
                                          onClick={() => {
                                            // Handle click based on status
                                            if (item.status === 'READY') {
                                              handlePickupItem(itemId);
                                            } else if (item.status === 'PICKING_UP') {
                                              handleDeliverItem(itemId);
                                            }
                                          }}
                                          className={`flex items-center justify-between p-2 bg-white rounded border border-gray-200 transition-all cursor-pointer ${
                                            item.status === 'READY' || item.status === 'PICKING_UP' 
                                              ? 'hover:bg-rose-50 hover:border-rose-300 hover:shadow-md' 
                                              : 'cursor-default'
                                          }`}
                                        >
                                          <div className="flex items-center gap-3">
                                            {/* Status Badge with Oval Design */}
                                            <div className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(item.status || 'NEW')}`}>
                                              {item.status || 'NEW'}
                                            </div>
                                            
                                            {/* Item Info */}
                                            <div>
                                              <span className="text-sm font-medium text-gray-900">
                                                {item.quantity}x {item.name}
                                              </span>
                                              <span className="text-xs text-gray-600 ml-2 capitalize">
                                                {item.kind}
                                              </span>
                                            </div>
                                          </div>
                                          
                                          {/* Action Buttons */}
                                          <div 
                                            className="flex gap-2" 
                                            onClick={(e) => e.stopPropagation()}  // Prevent row click when clicking button
                                          >
                                            {actions.map((action) => (
                                              <button
                                                key={action.label}
                                                onClick={action.onClick}
                                                className={`text-sm font-semibold py-1 px-3 rounded transition-colors relative z-10 pointer-events-auto ${action.className}`}
                                              >
                                                {action.label}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {!sidebarOpen && (
                      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">Pickup notifications</p>
                        <p className="text-xs text-gray-400 mt-1">{fohItems.length} ready</p>
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
