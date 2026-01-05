// src/components/ToGoOrderFlow.tsx
import { useState, useEffect } from 'react';
import { Language, OrderItem, Restaurant } from '../types';
import { MenuDisplay } from './MenuDisplay';
import { OrderStatusTracker } from './OrderStatusTracker';
import { UnifiedBillView } from './UnifiedBillView';
import { PageShell } from './PageShell';
import { BottomActionBar } from './BottomActionBar';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { t } from '../utils/translations';
import { createToGoTable, deleteToGoTable } from '../api/togoTableManager';
import { createBill, recordBillPayment, clearBillAfterPayment } from '../api/billLifecycle';
import { ArrowLeft, ShoppingBag, CreditCard } from 'lucide-react';

type ToGoStage = 'ordering' | 'review' | 'tracking' | 'payment' | 'complete';

type ToGoOrderFlowProps = {
  restaurant: Restaurant;
  language: Language;
  onBack: () => void;
  onComplete: () => void;
  onSubmitOrder: (items: OrderItem[], tableId: string) => Promise<string>; // Returns order ID
};

/**
 * To-Go Order Flow Component
 * 
 * Handles the complete to-go ordering experience:
 * 1. Menu browsing and item selection
 * 2. Order review and confirmation
 * 3. Live order status tracking
 * 4. Payment processing
 * 5. Bill clearing and table cleanup
 * 
 * Key features:
 * - No table selection required
 * - Automatic temporary table assignment
 * - Real-time order tracking
 * - Seamless payment flow
 * - Automatic cleanup after completion
 */
export function ToGoOrderFlow({
  restaurant,
  language,
  onBack,
  onComplete,
  onSubmitOrder,
}: ToGoOrderFlowProps) {
  const [stage, setStage] = useState<ToGoStage>('ordering');
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [togoTableId, setTogoTableId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [billId, setBillId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // If user navigates away before completing, cleanup the temporary table
      if (togoTableId && stage !== 'complete') {
        deleteToGoTable(togoTableId).catch(err => 
          console.error('[ToGoOrderFlow] Failed to cleanup table on unmount:', err)
        );
      }
    };
  }, [togoTableId, stage]);

  const handlePlaceOrder = async (items: OrderItem[]) => {
    if (items.length === 0) return;

    try {
      // 1. Create temporary to-go table
      const table = await createToGoTable(restaurant.id, customerName || 'To-Go Customer');
      setTogoTableId(table.id);

      // 2. Submit order to Supabase
      const newOrderId = await onSubmitOrder(items, table.id);
      setOrderId(newOrderId);

      // 3. Create bill
      const subtotal = items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
      const tax = subtotal * 0.089999; // 9% tax
      const bill = await createBill({
        restaurantId: restaurant.id,
        tableId: table.id,
        orderIds: [newOrderId],
        subtotal,
        tax,
        tip: 0, // Tip will be added during payment
      });
      setBillId(bill.id);

      setSelectedItems(items);
      setStage('review');
    } catch (error) {
      console.error('[ToGoOrderFlow] Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  const handleConfirmOrder = () => {
    setStage('tracking');
  };

  const handleProceedToPayment = () => {
    setStage('payment');
  };

  const handlePaymentComplete = async (tipAmount: number) => {
    if (!billId) return;

    try {
      // 1. Record payment with tip
      await recordBillPayment({
        billId,
        paymentMethod: 'card', // In real app, this would come from payment form
        tip: tipAmount,
      });

      // 2. Clear bill and mark orders as delivered
      await clearBillAfterPayment(billId);

      // 3. Delete temporary to-go table
      if (togoTableId) {
        await deleteToGoTable(togoTableId);
      }

      setStage('complete');
    } catch (error) {
      console.error('[ToGoOrderFlow] Error completing payment:', error);
      alert('Payment processing failed. Please contact staff.');
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  const bill = selectedItems.length > 0 ? {
    items: selectedItems,
    subtotal: selectedItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0),
    tax: selectedItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0) * 0.089999,
    tip: 0,
    total: 0,
    payments: [],
  } : null;

  if (bill) {
    bill.total = bill.subtotal + bill.tax + bill.tip;
  }

  return (
    <>
      {/* Ordering Stage */}
      {stage === 'ordering' && (
        <MenuDisplay
          drinks={restaurant.menu!.drinks}
          food={restaurant.menu!.food}
          language={language}
          onPlaceOrder={handlePlaceOrder}
          isDrinksOnly={false}
          initialTab="food"
          onBack={onBack}
        />
      )}

      {/* Review Stage */}
      {stage === 'review' && bill && (
        <>
          <PageShell paddedForActionBar>
            <div className="space-y-6">
              {/* Header */}
              <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-8 h-8 text-green-600" />
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                      {t('toGo', language)} {t('placeOrder', language)}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {t('estimatedTime', language)}: 15-20 {t('minutes', language)}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Order Summary */}
              <UnifiedBillView
                bill={bill}
                language={language}
              />

              {/* Customer Name Input */}
              <Card className="p-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('orderNameLabel', language)} ({t('optional', language)})
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t('orderNamePlaceholder', language)}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-base"
                />
              </Card>
            </div>
          </PageShell>

          <BottomActionBar>
            <Button
              variant="outline"
              onClick={() => setStage('ordering')}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back', language)}
            </Button>
            <Button
              onClick={handleConfirmOrder}
              className="w-full sm:flex-1"
              size="lg"
            >
              {t('confirmAndPay', language)}
            </Button>
          </BottomActionBar>
        </>
      )}

      {/* Tracking Stage */}
      {stage === 'tracking' && orderId && (
        <>
          <PageShell paddedForActionBar>
            <div className="space-y-6">
              {/* Header */}
              <Card className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  {t('toGoOrderStatus', language)}
                </h1>
                <p className="text-sm text-gray-600">
                  {customerName || 'To-Go Customer'} • {t('estimatedTime', language)}: 15-20 {t('minutes', language)}
                </p>
              </Card>

              {/* Order Status Tracker */}
              <OrderStatusTracker
                orderId={orderId}
                language={language}
                isToGo={true}
                onStatusChange={(status) => {
                  if (status === 'READY') {
                    // Show notification that order is ready
                    if ('Notification' in window && Notification.permission === 'granted') {
                      new Notification(t('readyForPickup', language), {
                        body: t('orderStatusUpdated', language),
                      });
                    }
                  }
                }}
              />

              {/* Order Summary */}
              {bill && (
                <UnifiedBillView
                  bill={bill}
                  language={language}
                />
              )}
            </div>
          </PageShell>

          <BottomActionBar>
            <Button
              onClick={handleProceedToPayment}
              className="w-full"
              size="lg"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              {t('proceedToPayment', language)}
            </Button>
          </BottomActionBar>
        </>
      )}

      {/* Payment Stage */}
      {stage === 'payment' && bill && (
        <>
          <PageShell paddedForActionBar>
            <div className="space-y-6">
              <Card className="p-5">
                <h1 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('billPaymentTitle', language)}
                </h1>
                <p className="text-gray-600">
                  {t('billPaymentSubtitle', language)}
                </p>
              </Card>

              <UnifiedBillView
                bill={bill}
                language={language}
              />

              {/* Tip Selection */}
              <Card className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {t('totalTip', language)}
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {[0, 10, 15, 18, 20].map((percent) => (
                    <Button
                      key={percent}
                      variant="outline"
                      onClick={() => {
                        const tipAmount = bill.subtotal * (percent / 100);
                        handlePaymentComplete(tipAmount);
                      }}
                      className="flex-1 min-w-[80px]"
                    >
                      {percent}%
                    </Button>
                  ))}
                </div>
              </Card>
            </div>
          </PageShell>

          <BottomActionBar>
            <Button
              variant="outline"
              onClick={() => setStage('tracking')}
              className="w-full sm:w-auto"
            >
              {t('back', language)}
            </Button>
          </BottomActionBar>
        </>
      )}

      {/* Complete Stage */}
      {stage === 'complete' && (
        <PageShell>
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {t('thanksByName', language).replace('{name}', customerName || t('customer', language))}
              </h1>
              <p className="text-lg text-gray-600">
                {t('orderComplete', language)}
              </p>
            </div>

            <Card className="p-6 max-w-md w-full">
              <p className="text-gray-700 mb-4">
                {t('pickupInstructions', language)}
              </p>
              <div className="text-sm text-gray-500">
                {t('orderReference', language)}: {orderId?.slice(0, 8).toUpperCase()}
              </div>
            </Card>

            <Button
              onClick={handleComplete}
              size="lg"
              className="w-full max-w-md"
            >
              {t('done', language)}
            </Button>
          </div>
        </PageShell>
      )}
    </>
  );
}