import { useEffect, useState } from 'react';
import { BillPayment } from './BillPayment';
import { useStaffData } from '../staff/StaffDataProvider';
import { OrderItem, Bill } from '../types';
import { useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';

interface StaffBillPageProps {
  tableId: string;
  orderId?: string;
  onBackToFOH: () => void;
}

export function StaffBillPage({ tableId, orderId, onBackToFOH }: StaffBillPageProps) {
  const { orders, getBillDataByOrderId } = useStaffData();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [orderPaymentStatus, setOrderPaymentStatus] = useState<Bill['orderPaymentStatus']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBillData = async () => {
      setLoading(true);
      try {
        if (orderId) {
          const billItems = await getBillDataByOrderId(orderId);
          setItems(billItems);
          return;
        }

        const tableOrders = orders.filter(
          (order) => order.tableId === tableId && order.status !== 'DELIVERED'
        );

        if (!tableOrders.length) {
          setItems([]);
          setOrderPaymentStatus([]);
          return;
        }

        const orderIds = Array.from(new Set(tableOrders.map((order) => order.id)));
        const itemsByOrder = await Promise.all(
          orderIds.map((id) => getBillDataByOrderId(id))
        );
        setItems(itemsByOrder.flat());

        // CANONICAL: Query order_payment_status view for payment completeness
        const { data: paymentStatus, error } = await supabase
          .from('order_payment_status')
          .select('order_id, total_due, total_paid, is_payment_complete')
          .in('order_id', orderIds);

        if (error) {
          console.error('Failed to query payment status:', error);
          setOrderPaymentStatus([]);
          return;
        }

        const newOrderPaymentStatus = paymentStatus.map((status) => ({
          orderId: status.order_id,
          totalDue: status.total_due,
          totalPaid: status.total_paid,
          isPaymentComplete: status.is_payment_complete,
          remainingDue: Math.max(0, status.total_due - status.total_paid),
        }));

        setOrderPaymentStatus(newOrderPaymentStatus);

        console.log('✅ StaffBillPage payment status updated from canonical view:', {
          orderIds,
          paymentStatus: newOrderPaymentStatus,
          allPaid: newOrderPaymentStatus.every((s) => s.isPaymentComplete),
          totalRemaining: newOrderPaymentStatus.reduce((sum, s) => sum + s.remainingDue, 0),
        });

      } catch (error) {
        console.error('Failed to load bill data:', error);
        setItems([]);
        setOrderPaymentStatus([]);
      } finally {
        setLoading(false);
      }
    };

    loadBillData();
  }, [tableId, orderId, orders, getBillDataByOrderId]);

  // CANONICAL: Subscribe to payments table for reactive updates
  useEffect(() => {
    if (!tableId) return;

    const tableOrders = orders.filter(
      (order) => order.tableId === tableId && order.status !== 'DELIVERED'
    );
    const orderIds = Array.from(new Set(tableOrders.map((order) => order.id)));
    if (orderIds.length === 0) return;

    const channel = supabase
      .channel(`payments-${tableId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'payments',
          filter: `order_id=in.(${orderIds.join(',')})`,
        },
        async (payload) => {
          console.log('💰 Payment insert detected, refreshing payment status');

          // Re-query order_payment_status view
          const { data: paymentStatus, error } = await supabase
            .from('order_payment_status')
            .select('order_id, total_due, total_paid, is_payment_complete')
            .in('order_id', orderIds);

          if (error) {
            console.error('Failed to refresh payment status:', error);
            return;
          }

          const newOrderPaymentStatus = paymentStatus.map((status) => ({
            orderId: status.order_id,
            totalDue: status.total_due,
            totalPaid: status.total_paid,
            isPaymentComplete: status.is_payment_complete,
            remainingDue: Math.max(0, status.total_due - status.total_paid),
          }));

          setOrderPaymentStatus(newOrderPaymentStatus);

          console.log('✅ Payment status refreshed:', {
            orderIds,
            allPaid: newOrderPaymentStatus.every((s) => s.isPaymentComplete),
            totalRemaining: newOrderPaymentStatus.reduce((sum, s) => sum + s.remainingDue, 0),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableId, orders]);

  const bill = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    );
    const tax = subtotal * 0.089999;
    const tip = subtotal * 0.15;
    return {
      items,
      subtotal,
      tax,
      tip,
      total: subtotal + tax + tip,
      payments: [], // Legacy field, not used for payment completeness
      orderPaymentStatus: orderPaymentStatus, // CANONICAL: Payment status from view
    };
  }, [items, orderPaymentStatus]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading bill...</p>
        </div>
      </div>
    );
  }

  // CANONICAL: A bill EXISTS iff there exists ≥1 non-request order for the table
  const hasNonRequestOrders = orders.some(
    (order) => order.tableId === tableId && order.orderType !== 'request' && order.status !== 'DELIVERED'
  );

  if (!hasNonRequestOrders) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-600">No billable items yet.</p>
      </div>
    );
  }

  return (
    <BillPayment
      bill={bill}
      language="en"
      onPaymentComplete={() => onBackToFOH()}
      onRequestItem={(requestType) => {
        console.log('Staff request:', requestType);
      }}
    />
  );
}
