import { useMemo } from 'react';
import { StaffLayout } from './StaffLayout';
import { useStaffData } from './StaffDataProvider';
import { TicketCard } from './TicketCard';
import { filterItemsByKind } from './utils';
import { updateOrderStatus } from './orderStatus';

export const OwnerView = () => {
  const { orders } = useStaffData();

  const grouped = useMemo(
    () => ({
      food: orders.filter(
        (order) => order.orderType !== 'request' && filterItemsByKind(order, 'food').length > 0
      ),
      drinks: orders.filter(
        (order) => order.orderType !== 'request' && filterItemsByKind(order, 'drink').length > 0
      ),
      requests: orders.filter((order) => order.orderType === 'request'),
    }),
    [orders]
  );

  const nextAction = (status: string) => {
    if (status === 'NEW') return { label: 'Start', next: 'IN_PROGRESS' as const };
    if (status === 'IN_PROGRESS') return { label: 'Ready', next: 'READY' as const };
    if (status === 'READY') return { label: 'Picking up', next: 'PICKING_UP' as const };
    if (status === 'PICKING_UP') return { label: 'Delivered', next: 'DELIVERED' as const };
    return null;
  };

  const renderColumn = (
    title: string,
    accent: 'kitchen' | 'bar' | 'server' | 'owner',
    list = orders
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{title}</p>
        <span className="text-xs text-gray-500">{list.length} tickets</span>
      </div>
      {list.length === 0 && (
        <p className="text-sm text-gray-500">Nothing queued here.</p>
      )}
      {list.map((order) => {
        const action = nextAction(order.status);
        const items =
          accent === 'kitchen'
            ? filterItemsByKind(order, 'food')
            : accent === 'bar'
              ? filterItemsByKind(order, 'drink')
              : order.items;
        const actions = action
          ? [
              {
                label: action.label,
                onClick: () => updateOrderStatus(order.id, action.next),
              },
            ]
          : [];
        return (
          <TicketCard
            key={`${title}-${order.id}`}
            order={order}
            items={items}
            accent={accent}
            actions={actions}
          />
        );
      })}
    </div>
  );

  return (
    <StaffLayout
      title="Owner view"
      subtitle="Single-operator control for food, drinks, and requests."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {renderColumn('Kitchen / Food', 'kitchen', grouped.food)}
        {renderColumn('Bar / Drinks', 'bar', grouped.drinks)}
      </div>
      <div>{renderColumn('Requests', 'server', grouped.requests)}</div>
    </StaffLayout>
  );
};
