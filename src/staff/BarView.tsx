import { useMemo } from 'react';
import { useStaffData } from './StaffDataProvider';
import { StaffLayout } from './StaffLayout';
import { TicketCard } from './TicketCard';
import { filterItemsByKind } from './utils';
import { updateOrderStatus } from './orderStatus';

export const BarView = () => {
  const { orders } = useStaffData();

  const tickets = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.orderType !== 'request' &&
          filterItemsByKind(order, 'drink').length > 0 &&
          order.status !== 'DELIVERED' &&
          order.status !== 'PICKING_UP'
      ),
    [orders]
  );

  return (
    <StaffLayout
      title="Bar tickets"
      subtitle="Drinks-only orders with Start → Ready flow."
      hideNav
    >
      <div className="h-full overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 pb-4" style={{ width: 'max-content', minWidth: '100%' }}>
          {tickets.map((order) => {
            const drinkItems = filterItemsByKind(order, 'drink');
            const actions =
              order.status === 'NEW'
                ? [{ label: 'Start', onClick: () => updateOrderStatus(order.id, 'IN_PROGRESS') }]
                : order.status === 'IN_PROGRESS'
                  ? [{ label: 'Ready', onClick: () => updateOrderStatus(order.id, 'READY') }]
                  : [];
            return (
              <div key={order.id} className="flex-shrink-0 w-80">
                <TicketCard
                  order={order}
                  items={drinkItems}
                  accent="bar"
                  actions={actions}
                />
              </div>
            );
          })}
        </div>
        {tickets.length === 0 && (
          <p className="text-sm text-gray-500">No bar tickets yet. Drink orders will pop up here.</p>
        )}
      </div>
    </StaffLayout>
  );
};
