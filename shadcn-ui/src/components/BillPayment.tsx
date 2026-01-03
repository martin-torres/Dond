import { useMemo, useState } from 'react';
import { Bill, Language } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { PageShell } from './PageShell';
import { BottomActionBar } from './BottomActionBar';
import { Bell, CreditCard, Banknote } from 'lucide-react';
import { RequestModal } from './RequestModal';

type BillPaymentProps = {
  bill: Bill;
  language: Language;
  onPaymentComplete: (paidAmount?: number, paidItems?: string[]) => void;
  onRequestItem?: (requestType: 'server' | 'condiments' | 'water' | 'bill' | 'issue') => void;
};

export function BillPayment({
  bill,
  language,
  onPaymentComplete,
  onRequestItem,
}: BillPaymentProps) {
  const [showRequestModal, setShowRequestModal] = useState(false);
  type SplitMethod = 'full' | 'even' | 'items';
  type PaymentMethod = 'card' | 'cash';
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('full');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [partySize, setPartySize] = useState(2);
  const [itemSelections, setItemSelections] = useState<Record<string, number>>(
    {}
  );
  const [tipPercent, setTipPercent] = useState(15);
  const [allocation, setAllocation] = useState(50); // % toward service; rest to kitchen
  const [serviceCouldBeBetter, setServiceCouldBeBetter] = useState(false);
  const [foodCouldBeBetter, setFoodCouldBeBetter] = useState(false);
  const [noTipReason, setNoTipReason] = useState('');

  const taxRate = bill.subtotal > 0 ? bill.tax / bill.subtotal : 0;
  const tipRate = tipPercent / 100;

  const getItemKey = (itemId: string, idx: number) => `${itemId}-${idx}`;

  const selectedItemsSubtotal = useMemo(() => {
    return bill.items.reduce((sum, item, idx) => {
      const key = getItemKey(item.menuItem.id, idx);
      const qty = itemSelections[key] ?? 0;
      return sum + qty * item.menuItem.price;
    }, 0);
  }, [bill.items, itemSelections]);

  const selectedItemsTotal = useMemo(() => {
    if (splitMethod !== 'items') return 0;
    const multiplier = 1 + taxRate + tipRate;
    return selectedItemsSubtotal * (multiplier || 1);
  }, [splitMethod, selectedItemsSubtotal, taxRate, tipRate]);

  const amountToPay = useMemo(() => {
    const computedTotal = bill.subtotal * (1 + taxRate + tipRate);
    if (splitMethod === 'even') {
      const safePartySize = Math.max(1, partySize);
      return computedTotal / safePartySize;
    }

    if (splitMethod === 'items') {
      return selectedItemsTotal;
    }

    return computedTotal;
  }, [bill.subtotal, partySize, selectedItemsTotal, splitMethod, taxRate, tipRate]);

  const handleItemSelection = (key: string, nextQuantity: number) => {
    setItemSelections((prev) => {
      if (nextQuantity <= 0) {
        const { [key]: _removed, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [key]: nextQuantity,
      };
    });
  };

  const handleNoTip = () => {
    setTipPercent(0);
  };

  const selectedItemsIds = () => {
    const ids: string[] = [];
    bill.items.forEach((item, idx) => {
      const key = getItemKey(item.menuItem.id, idx);
      const qty = itemSelections[key] ?? 0;
      for (let i = 0; i < qty; i++) {
        ids.push(item.menuItem.id);
      }
    });
    return ids;
  };

  const getMethodLabel = () => {
    if (splitMethod === 'even') {
      return t('splitMethodLabelEven', language);
    }
    if (splitMethod === 'items') {
      return t('splitMethodLabelItems', language);
    }
    return t('splitMethodLabelFull', language);
  };

  const handlePayment = () => {
    if (splitMethod === 'items' && selectedItemsTotal <= 0) {
      alert(t('selectItemsWarning', language));
      return;
    }
    if (tipPercent === 0 && !noTipReason.trim()) {
      alert(t('noTipReasonLabel', language));
      return;
    }

    const amount = Number(amountToPay.toFixed(2));
    const methodLabel = getMethodLabel();
    const paymentMethodLabel = paymentMethod === 'cash' ? t('cash', language) : t('card', language);
    const amountLabel = `$${amount.toFixed(2)}`;
    const message = t('processingPayment', language)
      .replace('{method}', methodLabel)
      .replace('{amount}', amountLabel) + ` ${t('via', language)} ${paymentMethodLabel}`;
    alert(message);

    const paidItems =
      splitMethod === 'items'
        ? selectedItemsIds()
        : bill.items.map((item) => item.menuItem.id);
    onPaymentComplete(amount, paidItems);
  };

  return (
    <>
      {/* Bell button for service requests */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          onClick={() => setShowRequestModal(true)}
          className="rounded-full border border-gray-200 bg-white shadow-sm px-3 h-12 w-12"
          aria-label="Request assistance"
        >
          <Bell className="w-6 h-6" />
        </Button>
      </div>

      <PageShell
        width="lg"
        paddedForActionBar
        className="justify-start"
        title={t('billPaymentTitle', language)}
        description={t('billPaymentSubtitle', language)}
      >
        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">{t('billSummary', language)}</h2>
            <ul className="space-y-2 text-base text-gray-700 max-h-48 overflow-y-auto">
              {bill.items.map((item, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center px-2 py-2"
                >
                  <span className="font-medium text-base">
                    {item.quantity}× {item.menuItem.name[language] || item.menuItem.name.en}
                  </span>
                  <span className="font-semibold text-base">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t pt-3 text-base space-y-2">
              <div className="flex justify-between">
                <span>{t('subtotal', language)}</span>
                <span>${bill.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('tax', language)}</span>
                <span>${bill.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('tip', language)}</span>
                <span>${(bill.subtotal * tipRate).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 text-lg">
                <span>{t('total', language)}</span>
                <span>${(bill.subtotal * (1 + taxRate + tipRate)).toFixed(2)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-5">
            <h2 className="text-2xl font-semibold text-gray-900">{t('howToPay', language)}</h2>

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <label className="text-base font-semibold text-gray-900 block">
                {t('paymentMethod', language)}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('card')}
                  className="h-14 text-base"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {t('card', language)}
                </Button>
                <Button
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('cash')}
                  className="h-14 text-base"
                >
                  <Banknote className="w-5 h-5 mr-2" />
                  {t('cash', language)}
                </Button>
              </div>
            </div>

            {/* Split Method Selection */}
            <div className="space-y-3">
              <label className="text-base font-semibold text-gray-900 block">
                {t('splitMethod', language)}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={splitMethod === 'full' ? 'default' : 'outline'}
                  onClick={() => setSplitMethod('full')}
                  className="h-12 text-sm"
                >
                  {t('payFull', language)}
                </Button>
                <Button
                  variant={splitMethod === 'even' ? 'default' : 'outline'}
                  onClick={() => setSplitMethod('even')}
                  className="h-12 text-sm"
                >
                  {t('splitEvenly', language)}
                </Button>
                <Button
                  variant={splitMethod === 'items' ? 'default' : 'outline'}
                  onClick={() => setSplitMethod('items')}
                  className="h-12 text-sm"
                >
                  {t('splitByItems', language)}
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white/70 p-5">
              <p className="text-base font-semibold text-gray-900 mb-3">
                {t('totalTip', language)}: {tipPercent}%
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {[10, 15, 18, 20, 25].map((value) => (
                  <Button
                    key={value}
                    size="lg"
                    variant={tipPercent === value ? 'default' : 'outline'}
                    onClick={() => setTipPercent(value)}
                    className="text-base"
                  >
                    {value}%
                  </Button>
                ))}
                {serviceCouldBeBetter && foodCouldBeBetter && noTipReason.trim().length > 0 && (
                  <>
                    <Button
                      size="lg"
                      variant={tipPercent === 5 ? 'default' : 'outline'}
                      onClick={() => setTipPercent(5)}
                      className="text-base"
                    >
                      5%
                    </Button>
                    <Button
                      size="lg"
                      variant={tipPercent === 0 ? 'default' : 'outline'}
                      onClick={handleNoTip}
                      className="text-base"
                    >
                      {t('noTip', language)}
                    </Button>
                  </>
                )}
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    {t('tipAllocationLabel', language)}
                  </span>
                  <span className="text-sm text-gray-600">
                    {t('cookTip', language)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700">
                    {t('serviceTipLabel', language)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={2.5}
                    value={allocation}
                    onChange={(e) => setAllocation(Number(e.target.value))}
                    className="flex-1 accent-emerald-600 h-3"
                  />
                  <span className="text-sm font-semibold text-gray-700">{t('cookTip', language)}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {allocation > 55
                    ? t('tipAllocationService', language)
                    : allocation < 45
                      ? t('tipAllocationKitchen', language)
                      : t('tipAllocationBalanced', language)}
                </p>
                <p className="text-sm text-gray-500">
                  {t('tipAllocationHint', language)}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <label className="flex items-center gap-3 text-base text-gray-700">
                  <input
                    type="checkbox"
                    checked={serviceCouldBeBetter}
                    onChange={(e) => setServiceCouldBeBetter(e.target.checked)}
                    className="rounded border-gray-300 w-5 h-5"
                  />
                  <span>{t('serviceCouldBeBetter', language)}</span>
                </label>
                <label className="flex items-center gap-3 text-base text-gray-700">
                  <input
                    type="checkbox"
                    checked={foodCouldBeBetter}
                    onChange={(e) => setFoodCouldBeBetter(e.target.checked)}
                    className="rounded border-gray-300 w-5 h-5"
                  />
                  <span>{t('foodCouldBeBetter', language)}</span>
                </label>
              </div>

              {(serviceCouldBeBetter || foodCouldBeBetter || tipPercent === 0) && (
                <div className="w-full mt-3">
                  <label className="text-base text-gray-700 block mb-2">
                    {t('noTipReasonLabel', language)}
                  </label>
                  <textarea
                    value={noTipReason}
                    onChange={(e) => setNoTipReason(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-3 text-base"
                    rows={3}
                    placeholder={t('noTipPlaceholder', language)}
                  />
                </div>
              )}
            </div>

            {splitMethod === 'even' && (
              <div className="space-y-3">
                <label className="text-base text-gray-600">
                  {t('splitEvenQuestion', language)}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min={1}
                    value={partySize}
                    onChange={(e) => setPartySize(Math.max(1, Number(e.target.value) || 1))}
                    className="w-24 rounded-md border border-gray-300 px-3 py-2 text-base"
                  />
                  <p className="text-base text-gray-600">
                    {t('eachPersonPays', language)}{' '}
                    <span className="font-semibold text-lg">${amountToPay.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            )}

            {splitMethod === 'items' && (
              <div className="space-y-4">
                <p className="text-base text-gray-600">
                  {t('selectItemsInstruction', language)}
                </p>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {bill.items.map((item, idx) => {
                    const key = getItemKey(item.menuItem.id, idx);
                    const selectedQty = itemSelections[key] ?? 0;
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-lg border px-5 py-4 text-base"
                      >
                        <div>
                          <p className="font-medium text-base">
                            {item.menuItem.name[language] || item.menuItem.name.en}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${item.menuItem.price.toFixed(2)} • {t('itemsAvailableLabel', language)}:{' '}
                            {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() =>
                              handleItemSelection(key, Math.max(0, selectedQty - 1))
                            }
                            className="h-10 w-10"
                          >
                            −
                          </Button>
                          <span className="w-8 text-center text-base font-semibold">{selectedQty}</span>
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() =>
                              handleItemSelection(key, Math.min(item.quantity, selectedQty + 1))
                            }
                            className="h-10 w-10"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-base text-gray-700">
                  <p>
                    {t('selectedTotal', language)}:{' '}
                    <span className="font-semibold">
                      ${selectedItemsSubtotal.toFixed(2)} {t('beforeTaxTip', language)}
                    </span>
                  </p>
                  <p>
                    {t('estimatedPayment', language)}:{' '}
                    <span className="font-semibold text-lg">${selectedItemsTotal.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-4 text-base">
              <span className="text-gray-600 text-lg">{t('amountToPayNow', language)}</span>
              <span className="text-2xl font-semibold">${amountToPay.toFixed(2)}</span>
            </div>
          </Card>
        </div>
      </PageShell>

      <BottomActionBar>
        <div className="flex-1">
          <p className="text-base text-gray-600">{getMethodLabel()}</p>
          <p className="text-xl font-semibold text-gray-900">${amountToPay.toFixed(2)}</p>
        </div>
        <Button
          className="w-full sm:w-auto sm:min-w-[200px] h-14 text-lg"
          onClick={handlePayment}
          disabled={splitMethod === 'items' && selectedItemsTotal <= 0}
          size="lg"
        >
          {t('confirmAndPay', language)}
        </Button>
      </BottomActionBar>

      <RequestModal
        open={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onRequestItem={onRequestItem || (() => {})}
      />
    </>
  );
}