import { useState, useMemo } from 'react';
import { StaffLayout } from './StaffLayout';
import { useStaffData } from './StaffDataProvider';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Bill, Language } from '../types';
import { t } from '../utils/translations';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

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
              📝 Close Bill (No Payment)
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

      {/* Cash Payment Dialog */}
      <Dialog open={showCashPaymentDialog} onOpenChange={setShowCashPaymentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Accept Cash Payment</DialogTitle>
            <DialogDescription>
              Record the cash payment amount and any notes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder={`$${bill.total.toFixed(2)}`}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Input
                id="notes"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="e.g., Paid with $50, change $12.50"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCashPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCashPayment}>
              Confirm Cash Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StaffLayout>
  );
}
