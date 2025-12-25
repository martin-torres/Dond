import { useMemo } from 'react';
import { useStaffData } from './StaffDataProvider';
import { StaffLayout } from './StaffLayout';
import { TicketCard } from './TicketCard';
import { filterItemsByKind } from './utils';
import { updateOrderStatus } from './orderStatus';
import { StaffOrder, StaffOrderItem } from './types';
import { updateOrderItemStatus, fetchItemsByStationAndStatus } from '../api/ordersApi';

export const KitchenView = () => {
  const { orders, tables } = useStaffData();

  // Filter to show only food items that need kitchen attention
  const kitchenItems = useMemo(() => {
    const items: Array<{
      orderId: string;
      order: StaffOrder;
      itemId: string;
      item: StaffOrderItem;
      tableId?: string;
      table?: any;
    }> = [];

    orders.forEach((order) => {
      const foodItems = filterItemsByKind(order, 'food');
      
      foodItems.forEach((item) => {
        // Only show items that need kitchen attention
        if (item.status === 'NEW' || item.status === 'IN_PROGRESS') {
          const table = tables.find(t => t.id === order.tableId);
          items.push({
            orderId: order.id,
            order,
            itemId: item.id,
            item,
            tableId: order.tableId,
            table
          });
        }
      });
    });

    // Sort by order creation time, then by item status (NEW first, then IN_PROGRESS)
    return items.sort((a, b) => {
      const timeDiff = new Date(a.order.createdAt).getTime() - new Date(b.order.createdAt).getTime();
      if (timeDiff !== 0) return timeDiff;
      
      // NEW items first, then IN_PROGRESS
      if (a.item.status === 'NEW' && b.item.status === 'IN_PROGRESS') return -1;
      if (a.item.status === 'IN_PROGRESS' && b.item.status === 'NEW') return 1;
      
      return 0;
    });
  }, [orders, tables]);

  const handleStartItem = async (itemId: string) => {
    try {
      await updateOrderItemStatus(itemId, 'IN_PROGRESS');
    } catch (error) {
      console.error('Failed to start item:', error);
    }
  };

  const handleItemReady = async (itemId: string) => {
    try {
      await updateOrderItemStatus(itemId, 'READY');
    } catch (error) {
      console.error('Failed to mark item as ready:', error);
    }
  };

  return (
    <StaffLayout
      title="Kitchen stations"
      subtitle="Food orders organized by table location. Each item has independent status."
      hideNav
    >
      <div className="h-full overflow-y-auto">
        {kitchenItems.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">No active kitchen items. New food orders will appear here organized by table.</p>
          </div>
        ) : (
          <div className="flex gap-6 p-6 overflow-x-auto" style={{ width: 'max-content', minWidth: '100%' }}>
            {/* Group items by table */}
            {Array.from(
              kitchenItems.reduce((acc, item) => {
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
                <div key={tableKey} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-shrink-0" style={{ width: '320px' }}>
                  {/* Table Header */}
                  <div className="bg-orange-50 px-3 py-2 border-b border-orange-100">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {table?.label ?? (tableId ? `Table ${tableId}` : 'Unassigned')}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {itemsForTable.length} food item{itemsForTable.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Items List */}
                  <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
                    {itemsForTable.map(({ orderId, order, itemId, item }) => {
                      const actions =
                        item.status === 'NEW'
                          ? [{ label: 'Start', onClick: () => handleStartItem(itemId) }]
                          : item.status === 'IN_PROGRESS'
                            ? [{ label: 'Ready', onClick: () => handleItemReady(itemId) }]
                            : [];

                      return (
                        <div key={itemId} className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {item.quantity}x {item.name}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              item.status === 'NEW' 
                                ? 'bg-blue-100 text-blue-800 border-blue-200' 
                                : 'bg-green-100 text-green-800 border-green-200'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {actions.map((action) => (
                              <button
                                key={action.label}
                                onClick={action.onClick}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-1 px-2 rounded transition-colors"
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
        )}
      </div>
    </StaffLayout>
  );
};
