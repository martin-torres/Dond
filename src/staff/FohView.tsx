import { useMemo, useState } from 'react';
import { StaffLayout } from './StaffLayout';
import { useStaffData } from './StaffDataProvider';
import { TicketCard } from './TicketCard';
import { timeAgo } from './utils';
import { updateOrderStatus } from './orderStatus';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import FloorPlanTablePicker from '../components/FloorPlanTablePicker';
import { Table } from '../types';

const stateColor: Record<string, string> = {
  READY: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  OCCUPIED: 'bg-orange-100 text-orange-700 border-orange-200',
  PAYING: 'bg-amber-100 text-amber-700 border-amber-200',
  CLEANING: 'bg-blue-100 text-blue-700 border-blue-200',
  EMPTY: 'bg-gray-100 text-gray-600 border-gray-200',
};

export const FohView = () => {
  const { tables, orders, setTableState, closeTableSession } = useStaffData();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(tables[0]?.id ?? null);

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? tables[0],
    [selectedTableId, tables]
  );

  const tableOrders = useMemo(
    () => (selectedTable ? orders.filter((order) => order.tableId === selectedTable.id) : []),
    [orders, selectedTable]
  );

  const requestTickets = useMemo(
    () => orders.filter((order) => order.orderType === 'request'),
    [orders]
  );

  const cleaningMinutes =
    selectedTable?.cleaningStartedAt && selectedTable.state === 'CLEANING'
      ? Math.floor((Date.now() - new Date(selectedTable.cleaningStartedAt).getTime()) / 60000)
      : 0;

  return (
    <StaffLayout
      title="FOH / Server"
  subtitle="Track tables, pickup flow, and cleaning timers."
  hideNav
>
      <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
        <Card className="p-4 border border-emerald-100 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">
            Floor plan
          </p>
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
          />
        </Card>

        <Card className="p-4 border border-slate-200 shadow-sm h-full">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Requests</p>
              <h3 className="text-lg font-semibold text-gray-900">Call server</h3>
            </div>
            <Badge className="bg-slate-100 text-slate-700 border-slate-200">
              {requestTickets.length}
            </Badge>
          </div>
          <div className="mt-3 space-y-2">
            {requestTickets.length === 0 && (
              <p className="text-sm text-gray-500">No open requests.</p>
            )}
            {requestTickets.map((request) => (
              <div
                key={request.id}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/60"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-800">
                    {request.tableLabel ?? 'No table'}
                  </p>
                  <span className="text-xs text-gray-500">{timeAgo(request.createdAt)}</span>
                </div>
                {request.note && (
                  <p className="text-xs text-gray-600 mt-1">{request.note}</p>
                )}
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateOrderStatus(request.id, 'PICKING_UP')}
                  >
                    Acknowledge
                  </Button>
                  <Button size="sm" onClick={() => updateOrderStatus(request.id, 'DELIVERED')}>
                    Done
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {selectedTable && (
        <Card className="p-4 space-y-3 border border-emerald-100 shadow-sm">
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
            {tableOrders.length === 0 && (
              <p className="text-sm text-gray-500">No active orders for this table.</p>
            )}
            {tableOrders.map((order) => {
              const actions =
                order.status === 'READY'
                  ? [
                      {
                        label: 'Picking up',
                        onClick: () => updateOrderStatus(order.id, 'PICKING_UP'),
                      },
                    ]
                  : order.status === 'PICKING_UP'
                    ? [
                        {
                          label: 'Delivered',
                          onClick: () => updateOrderStatus(order.id, 'DELIVERED'),
                        },
                      ]
                    : [];
              return (
                <TicketCard
                  key={order.id}
                  order={order}
                  items={order.items}
                  accent="server"
                  actions={actions}
                />
              );
            })}
          </div>
        </Card>
      )}
    </StaffLayout>
  );
};
