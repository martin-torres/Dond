import { useMemo, useState } from 'react';
import { Bill, Language } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';

type BillPaymentProps = {
  bill: Bill;
  language: Language;
  onPaymentComplete: (paidAmount?: number, paidItems?: string[]) => void;
};

export function BillPayment({
  bill,
  language,
  onPaymentComplete,
}: BillPaymentProps) {
  type SplitMethod = 'full' | 'even' | 'items';
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('full');
  const [partySize, setPartySize] = useState(2);
  const [itemSelections, setItemSelections] = useState<Record<string, number>>(
    {}
  );

  const taxRate = bill.subtotal > 0 ? bill.tax / bill.subtotal : 0;
  const tipRate = bill.subtotal > 0 ? bill.tip / bill.subtotal : 0;

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
    if (splitMethod === 'even') {
      const safePartySize = Math.max(1, partySize);
      return bill.total / safePartySize;
    }

    if (splitMethod === 'items') {
      return selectedItemsTotal;
    }

    return bill.total;
  }, [bill.total, partySize, selectedItemsTotal, splitMethod]);

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

    const amount = Number(amountToPay.toFixed(2));
    const methodLabel = getMethodLabel();
    const amountLabel = `$${amount.toFixed(2)}`;
    const message = t('processingPayment', language)
      .replace('{method}', methodLabel)
      .replace('{amount}', amountLabel);
    alert(message);

    const paidItems =
      splitMethod === 'items'
        ? selectedItemsIds()
        : bill.items.map((item) => item.menuItem.id);
    onPaymentComplete(amount, paidItems);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white shadow-sm px-4 py-3">
        <h1 className="text-xl font-semibold">
          {t('billPaymentTitle', language)}
        </h1>
        <p className="text-xs text-gray-500">
          {t('billPaymentSubtitle', language)}
        </p>
      </header>

      <main className="flex-1 px-4 py-4 space-y-4">
        {/* Bill summary */}
        <section className="bg-white rounded-xl shadow-sm p-4 border">
          <h2 className="text-sm font-semibold mb-2">
            {t('billSummary', language)}
          </h2>
          <ul className="space-y-1 text-sm text-gray-700 max-h-40 overflow-y-auto">
            {bill.items.map((item, idx) => (
              <li key={idx} className="flex justify-between">
                <span>
                  {item.quantity}× {item.menuItem.name[language] || item.menuItem.name.en}
                </span>
                <span>
                  ${(item.menuItem.price * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t mt-2 pt-2 text-sm">
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
              <span>${bill.tip.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold mt-1">
              <span>{t('total', language)}</span>
              <span>${bill.total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Payment split options */}
        <section className="bg-white rounded-xl shadow-sm p-4 border space-y-4">
          <h2 className="text-sm font-semibold">
            {t('howToPay', language)}
          </h2>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <Button
              variant={splitMethod === 'full' ? 'default' : 'outline'}
              onClick={() => setSplitMethod('full')}
            >
              {t('payFull', language)}
            </Button>
            <Button
              variant={splitMethod === 'even' ? 'default' : 'outline'}
              onClick={() => setSplitMethod('even')}
            >
              {t('splitEvenly', language)}
            </Button>
            <Button
              variant={splitMethod === 'items' ? 'default' : 'outline'}
              onClick={() => setSplitMethod('items')}
            >
              {t('splitByItems', language)}
            </Button>
          </div>

          {splitMethod === 'even' && (
            <div className="space-y-2">
              <label className="text-xs text-gray-600">
                {t('splitEvenQuestion', language)}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={partySize}
                  onChange={(e) => setPartySize(Math.max(1, Number(e.target.value) || 1))}
                  className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
                />
                <p className="text-sm text-gray-600">
                  {t('eachPersonPays', language)}{' '}
                  <span className="font-semibold">
                    ${amountToPay.toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
          )}

          {splitMethod === 'items' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-600">
                {t('selectItemsInstruction', language)}
              </p>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {bill.items.map((item, idx) => {
                  const key = getItemKey(item.menuItem.id, idx);
                  const selectedQty = itemSelections[key] ?? 0;
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">
                          {item.menuItem.name[language] || item.menuItem.name.en}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${item.menuItem.price.toFixed(2)} •{' '}
                          {t('itemsAvailableLabel', language)}: {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleItemSelection(key, Math.max(0, selectedQty - 1))
                          }
                        >
                          −
                        </Button>
                        <span className="w-6 text-center">{selectedQty}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleItemSelection(
                              key,
                              Math.min(item.quantity, selectedQty + 1)
                            )
                          }
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-sm text-gray-700">
                <p>
                  {t('selectedTotal', language)}:{' '}
                  <span className="font-semibold">
                    ${selectedItemsSubtotal.toFixed(2)} {t('beforeTaxTip', language)}
                  </span>
                </p>
                <p>
                  {t('estimatedPayment', language)}:{' '}
                  <span className="font-semibold">
                    ${selectedItemsTotal.toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-3 text-sm">
            <span className="text-gray-600">
              {t('amountToPayNow', language)}
            </span>
            <span className="text-lg font-semibold">
              ${amountToPay.toFixed(2)}
            </span>
          </div>

          <Button
            className="w-full"
            onClick={handlePayment}
            disabled={splitMethod === 'items' && selectedItemsTotal <= 0}
          >
            {t('confirmAndPay', language)}
          </Button>
        </section>
      </main>
    </div>
  );
}
