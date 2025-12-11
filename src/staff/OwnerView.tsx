import { useMemo } from 'react';
import { StaffLayout } from './StaffLayout';
import { useStaffData } from './StaffDataProvider';
import { TicketCard } from './TicketCard';
import { filterItemsByKind } from './utils';
import { updateOrderStatus } from './orderStatus';
import { OrderStatus, StaffOrder } from './types';

const nextAction = (status: OrderStatus) => {
  if (status === 'NEW') return { label: 'Start', next: 'IN_PROGRESS' as const };
  if (status === 'IN_PROGRESS') return { label: 'Ready', next: 'READY' as const };
  if (status === 'READY') return { label: 'Picking up', next: 'PICKING_UP' as const };
  if (status === 'PICKING_UP') return { label: 'Delivered', next: 'DELIVERED' as const };
  return null;
};

const pickItemsForOwner = (order: StaffOrder) => {
  if (order.orderType === 'request') return order.items;
  const food = filterItemsByKind(order, 'food');
  const drinks = filterItemsByKind(order, 'drink');
  if (food.length > 0 && drinks.length === 0) return food;
  if (drinks.length > 0 && food.length === 0) return drinks;
  return order.items;
};

const getAccent = (order: StaffOrder): 'kitchen' | 'bar' | 'server' | 'owner' => {
  if (order.orderType === 'request') return 'server';
  const hasFood = filterItemsByKind(order, 'food').length > 0;
  const hasDrink = filterItemsByKind(order, 'drink').length > 0;
  if (hasFood && !hasDrink) return 'kitchen';
  if (!hasFood && hasDrink) return 'bar';
  if (order.station === 'bar') return 'bar';
  if (order.station === 'kitchen') return 'kitchen';
  return 'owner';
};

export const OwnerView = () => {
  const { orders, singleOperatorMode } = useStaffData();

  const tickets = useMemo(
    () =>
      [...orders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [orders]
  );

  return (
    <StaffLayout
      title="Owner view"
      subtitle={
        singleOperatorMode
          ? 'Single-operator control across food, drinks, and requests.'
          : 'Overview with full control across every order.'
      }
      hideNav
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tickets.map((order) => {
          const action = nextAction(order.status);
          const actions =
            action && order.status !== 'DELIVERED'
              ? [
                  {
                    label: action.label,
                    onClick: () => updateOrderStatus(order.id, action.next),
                  },
                ]
              : [];
          return (
            <TicketCard
              key={order.id}
              order={order}
              items={pickItemsForOwner(order)}
              accent={getAccent(order)}
              actions={actions}
            />
          );
        })}
      </div>
      {tickets.length === 0 && (
        <p className="text-sm text-gray-500">No orders yet. Everything will show here in one place.</p>
      )}
    </StaffLayout>
  );
};
