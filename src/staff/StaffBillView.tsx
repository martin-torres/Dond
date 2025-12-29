import { useState, useMemo } from 'react';
import { StaffLayout } from './StaffLayout';
import { useStaffData } from './StaffDataProvider';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Bill, Language } from '../types';
import { t } from '../utils/translations';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';

type StaffBillViewProps = {
  tableId: string;
  onBackToFOH: () => void;
  language?: Language;
};

export function StaffBillView({ tableId, onBackToFOH, language = 'en' }: StaffBillViewProps) {
  const { orders, tables, closeTableSession } = useStaffData();

  // Find the table
  const table = useMemo(() => tables.find(t => t.id === tableId), [tables, tableId]);

  // Calculate bill from orders
  const bill = useMemo(() => {
    if (!tableId) return null;

    const tableOrders = orders.filter(order => order.tableId === tableId && order.orderType !== 'request');

    // For beta, we'll use a simplified approach - assume prices are available
    // In a real implementation, we'd need to fetch menu item prices
    const items = tableOrders.flatMap(order =>
      order.items.map(item => ({
        menuItem: {
          id: item.id,
          name: { en: item.name, es: item.name },
          // For beta, we'll use a placeholder price calculation
          // In production, this would come from menu data
          price: 10.00 // Placeholder price
        },
        quantity: item.quantity,
        price: 10.00 // Placeholder price per item
      }))
    );

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax (simplified)
    const tip = subtotal * 0.15; // 15% default tip (simplified)

    return {
      items: items,
      subtotal,
      tax,
      tip,
      total: subtotal + tax + tip
    };
  }, [orders, tableId]);

  const [showCashPaymentDialog, setShowCashPaymentDialog] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [changeConfirmed, setChangeConfirmed] = useState(false);

  const calculateChange = () => {
    const cash = parseFloat(cashAmount) || 0;
    const change = cash - (bill?.total || 0);
    return change >= 0 ? change.toFixed(2) : '0.00';
  };

  const handleCashPayment = () => {
    // In beta, we just close the table session
    if (tableId) {
      closeTableSession(tableId);
    }
    setShowCashPaymentDialog(false);
    onBackToFOH();
  };

  const handleCloseBill = () => {
    // Manual bill closure
    if (tableId) {
      closeTableSession(tableId);
    }
    onBackToFOH();
  };

  if (!bill || !table) {
    return (
      <StaffLayout title="Bill View" hideNav>
        <div className="p-6">
          <Card className="p-6">
            <p className="text-gray-600">Loading bill information...</p>
          </Card>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout title={`Table ${table.label} - Bill`} hideNav>
      <div className="p-6 space-y-6">
        {/* Bill Summary Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('billSummary', language)}</h2>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between font-semibold text-lg border-b pb-2">
              <span>Table: {table.label}</span>
              <span>Status: {table.state}</span>
            </div>

            <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
              {bill.items.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center px-1 py-1 border-b last:border-0">
                  <span className="font-medium">
                    {item.quantity}× {item.menuItem.name.en}
                  </span>
                  <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between font-semibold">
              <span>{t('subtotal', language)}</span>
              <span>${bill.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('tax', language)}</span>
              <span>${bill.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('tip', language)}</span>
              <span>${bill.tip.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
              <span>{t('total', language)}</span>
              <span>${bill.total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Payment Options Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Options</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              className="h-16 text-lg"
              onClick={() => setShowCashPaymentDialog(true)}
              variant="default"
            >
              💵 Accept Cash Payment
            </Button>

            <Button
              className="h-16 text-lg"
              onClick={handleCloseBill}
              variant="outline"
            >
              💳 Pay with Credit Card
            </Button>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={onBackToFOH}>
            ← Back to FOH
          </Button>
        </div>
      </div>

      {/* Cash Payment Dialog - Using manual modal like RequestModal */}
      {showCashPaymentDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCashPaymentDialog(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Accept Cash Payment</h2>
                <p className="text-sm text-gray-600 mt-1">Record the cash payment amount and calculate change</p>
              </div>

              <div className="grid gap-4 py-4">
                {/* Total Amount - Readonly */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="total" className="text-right">
                    Total
                  </Label>
                  <Input
                    id="total"
                    value={`$${bill?.total.toFixed(2) || '0.00'}`}
                    readOnly
                    className="col-span-3 bg-gray-100 font-medium"
                  />
                </div>

                {/* Cash Amount - Editable */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cash" className="text-right">
                    Cash Received
                  </Label>
                  <Input
                    id="cash"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    placeholder={`$${bill?.total.toFixed(2) || '0.00'}`}
                    className="col-span-3"
                    type="number"
                    step="0.01"
                    min={bill?.total || 0}
                  />
                </div>

                {/* Change Calculation - Readonly */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="change" className="text-right">
                    Change
                  </Label>
                  <Input
                    id="change"
                    value={`$${calculateChange()}`}
                    readOnly
                    className="col-span-3 bg-gray-100 font-semibold text-green-600"
                  />
                </div>

                {/* Customer Confirmation */}
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="confirm-change"
                    checked={changeConfirmed}
                    onCheckedChange={(checked: boolean) => setChangeConfirmed(checked)}
                    className="border-gray-300"
                  />
                  <Label htmlFor="confirm-change" className="text-sm">
                    Customer received ${calculateChange()} change
                  </Label>
                </div>

                {/* Payment Notes */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notes
                  </Label>
                  <Input
                    id="notes"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="e.g., Paid with $50 bill"
                    className="col-span-3"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end mt-6">
                  <Button variant="outline" onClick={() => setShowCashPaymentDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCashPayment}
                    disabled={!changeConfirmed || !cashAmount || parseFloat(cashAmount) < (bill?.total || 0)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Confirm Cash Payment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}
