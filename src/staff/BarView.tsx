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
          (order.status === 'NEW' || order.status === 'IN_PROGRESS' || order.status === 'READY')
      ),
    [orders]
  );

  return (
    <StaffLayout
      title="Bar tickets"
      subtitle="Drinks-only orders with Start → Ready flow."
      hideNav
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tickets.map((order) => {
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
            />
          );
        })}
      </div>
      {tickets.length === 0 && (
        <p className="text-sm text-gray-500">No bar tickets yet. Drink orders will pop up here.</p>
      )}
    </StaffLayout>
  );
};
