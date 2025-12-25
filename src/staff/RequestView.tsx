import { useMemo } from 'react';
import { useStaffData } from './StaffDataProvider';
import { StaffLayout } from './StaffLayout';
import { TicketCard } from './TicketCard';
import { filterItemsByKind } from './utils';
import { updateStationStatus, markStationDelivered } from './orderStatus';

export const RequestView = () => {
  const { orders } = useStaffData();

  const requestTickets = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.station === 'server' &&
          filterItemsByKind(order, 'request').length > 0 &&
          (order.status === 'NEW' || order.status === 'IN_PROGRESS' || order.status === 'READY')
      ),
    [orders]
  );

  return (
    <StaffLayout
      title="FOH Requests"
      subtitle="Water, condiments, utensils, and other guest requests."
      hideNav
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {requestTickets.map((order) => {
          const requestItems = filterItemsByKind(order, 'request');
          const actions =
            order.status === 'NEW'
              ? [{ label: 'Handle', onClick: () => updateStationStatus(order.id, 'server', 'IN_PROGRESS') }]
              : order.status === 'IN_PROGRESS'
                ? [{ label: 'Ready', onClick: () => updateStationStatus(order.id, 'server', 'READY') }]
                : order.status === 'READY'
                  ? [{ label: 'Delivered', onClick: () => markStationDelivered(order.id, 'server') }]
                : [];
          return (
            <TicketCard
              key={order.ticketId ?? order.id}
              order={order}
              items={requestItems}
              accent="server"
              actions={actions}
            />
          );
        })}
      </div>
      {requestTickets.length === 0 && (
        <p className="text-sm text-gray-500">No active FOH requests. Guest requests will appear here.</p>
      )}
    </StaffLayout>
  );
};
