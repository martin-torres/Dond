import { useMemo } from 'react';
import { useStaffData } from './StaffDataProvider';
import { StaffLayout } from './StaffLayout';
import { TicketCard } from './TicketCard';
import { filterItemsByKind } from './utils';
import { updateOrderStatus } from './orderStatus';
import { StaffOrder } from './types';

export const BarView = () => {
  const { orders, tables } = useStaffData();

  const tableOrders = useMemo(() => {
    // Group active bar orders by table
    const tableMap = new Map<string, StaffOrder[]>();

    orders.forEach((order) => {
      if (
        order.orderType !== 'request' &&
        filterItemsByKind(order, 'drink').length > 0 &&
        (order.status === 'NEW' || order.status === 'IN_PROGRESS') &&
        order.tableId
      ) {
        if (!tableMap.has(order.tableId)) {
          tableMap.set(order.tableId, []);
        }
        tableMap.get(order.tableId)!.push(order);
      }
    });

    // Convert to array with table info, sorted by oldest order
    return Array.from(tableMap.entries())
      .map(([tableId, orders]) => {
        const table = tables.find(t => t.id === tableId);
        const sortedOrders = orders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        const oldestOrderTime = Math.min(...orders.map(o => new Date(o.createdAt).getTime()));
        return {
          tableId,
          table,
          orders: sortedOrders,
          oldestOrderTime
        };
      })
      .filter(item => item.table) // Only include tables that exist
      .sort((a, b) => a.oldestOrderTime - b.oldestOrderTime); // Sort tables by oldest order
  }, [orders, tables]);

  return (
    <StaffLayout
      title="Bar stations"
      subtitle="Drink orders organized by table location."
      hideNav
    >
      <div className="h-full overflow-y-auto">
        {tableOrders.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">No active bar orders. New drink orders will appear here organized by table.</p>
          </div>
        ) : (
          <div className="flex gap-6 p-6 overflow-x-auto" style={{ width: 'max-content', minWidth: '100%' }}>
            {tableOrders.map(({ tableId, table, orders }) => (
              <div key={tableId} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-shrink-0" style={{ width: '320px' }}>
                {/* Table Header */}
                <div className="bg-blue-50 px-3 py-2 border-b border-blue-100">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {table?.label ?? 'Table'}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {orders.length} active order{orders.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Orders List */}
                <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
                  {orders.map((order) => {
                    const drinkItems = filterItemsByKind(order, 'drink');
                    const actions =
                      order.status === 'NEW'
                        ? [{ label: 'Start', onClick: () => updateOrderStatus(order.id, 'IN_PROGRESS') }]
                        : order.status === 'IN_PROGRESS'
                          ? [{ label: 'Ready', onClick: () => updateOrderStatus(order.id, 'READY') }]
                          : [];

                    return (
                      <TicketCard
                        key={order.id}
                        order={order}
                        items={drinkItems}
                        accent="bar"
                        actions={actions}
                        hideTableInfo={true}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StaffLayout>
  );
};
