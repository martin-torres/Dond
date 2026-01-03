import { useEffect, useState } from 'react';
import { BillPayment } from './BillPayment';
import { useStaffData } from '../staff/StaffDataProvider';
import { OrderItem } from '../types';
import { useMemo } from 'react';

interface StaffBillPageProps {
  tableId: string;
  orderId?: string;
  onBackToFOH: () => void;
}

export function StaffBillPage({ tableId, orderId, onBackToFOH }: StaffBillPageProps) {
  const { orders, getBillDataByOrderId } = useStaffData();
  const [items, setItems] = useState<OrderItem[]>([]);
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
          return;
        }

        const orderIds = Array.from(new Set(tableOrders.map((order) => order.id)));
        const itemsByOrder = await Promise.all(
          orderIds.map((id) => getBillDataByOrderId(id))
        );
        setItems(itemsByOrder.flat());
      } catch (error) {
        console.error('Failed to load bill data:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadBillData();
  }, [tableId, orderId, orders, getBillDataByOrderId]);

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
      payments: [],
    };
  }, [items]);

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

  if (!items.length) {
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
