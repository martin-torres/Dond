import { useMemo } from 'react';
import { useStaffData } from './StaffDataProvider';
import { StaffLayout } from './StaffLayout';
import { TicketCard } from './TicketCard';
import { filterItemsByKind } from './utils';
import { updateOrderStatus } from './orderStatus';

export const KitchenView = () => {
  const { orders } = useStaffData();

  const tickets = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.orderType !== 'request' &&
          filterItemsByKind(order, 'food').length > 0 &&
          (order.status === 'NEW' || order.status === 'IN_PROGRESS' || order.status === 'READY')
      ),
    [orders]
  );

  return (
    <StaffLayout
      title="Kitchen tickets"
      subtitle="Food-only orders with quick Start → Ready actions."
      hideNav
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tickets.map((order) => {
          const foodItems = filterItemsByKind(order, 'food');
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
              items={foodItems}
              accent="kitchen"
              actions={actions}
            />
          );
        })}
      </div>
      {tickets.length === 0 && (
        <p className="text-sm text-gray-500">No kitchen tickets yet. New food orders will land here.</p>
      )}
    </StaffLayout>
  );
};
