import { useMemo, useState } from 'react';
import { Bill, Language } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { PageShell } from './PageShell';
import { BottomActionBar } from './BottomActionBar';

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
  const [tipPercent, setTipPercent] = useState(10);
  const [cookPercent, setCookPercent] = useState(0);

  const taxRate = bill.subtotal > 0 ? bill.tax / bill.subtotal : 0;
  const tipRate = (tipPercent + cookPercent) / 100;

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
    <>
      <PageShell
        width="lg"
        paddedForActionBar
        className="justify-start"
        title={t('billPaymentTitle', language)}
        description={t('billPaymentSubtitle', language)}
      >
        <div className="space-y-5">
          <Card className="p-4 space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">{t('billSummary', language)}</h2>
            <ul className="space-y-1 text-sm text-gray-700 max-h-40 overflow-y-auto">
              {bill.items.map((item, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center px-1 py-1"
                >
                  <span className="font-medium">
                    {item.quantity}× {item.menuItem.name[language] || item.menuItem.name.en}
                  </span>
                  <span className="font-semibold">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t pt-2 text-sm space-y-1">
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
              <div className="flex justify-between font-semibold pt-1">
                <span>{t('total', language)}</span>
                <span>${(bill.subtotal * (1 + taxRate + tipRate)).toFixed(2)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">{t('howToPay', language)}</h2>

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

            <div className="rounded-xl border border-gray-100 bg-white/70 p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-[220px]">
                  <p className="text-xs font-semibold text-gray-700">{t('tip', language)} {tipPercent}%</p>
                  <input
                    type="range"
                    min={10}
                    max={25}
                    step={5}
                    value={tipPercent}
                    onChange={(e) => setTipPercent(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <p className="text-xs text-gray-600">Starts at 10%, rises in 5% steps up to 25%.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-xs text-gray-700 whitespace-nowrap">+ to the cook</p>
                  {[0, 5, 10].map((value) => (
                    <Button
                      key={value}
                      size="sm"
                      variant={cookPercent === value ? 'default' : 'outline'}
                      onClick={() => setCookPercent(value)}
                    >
                      {value}%
                    </Button>
                  ))}
                </div>
              </div>
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
                    <span className="font-semibold">${amountToPay.toFixed(2)}</span>
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
                        className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
                      >
                        <div>
                          <p className="font-medium">
                            {item.menuItem.name[language] || item.menuItem.name.en}
                          </p>
                          <p className="text-xs text-gray-500">
                            ${item.menuItem.price.toFixed(2)} • {t('itemsAvailableLabel', language)}:{' '}
                            {item.quantity}
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
                              handleItemSelection(key, Math.min(item.quantity, selectedQty + 1))
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
                    <span className="font-semibold">${selectedItemsTotal.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-3 text-sm">
              <span className="text-gray-600">{t('amountToPayNow', language)}</span>
              <span className="text-lg font-semibold">${amountToPay.toFixed(2)}</span>
            </div>
          </Card>
        </div>
      </PageShell>

      <BottomActionBar>
        <div className="flex-1">
          <p className="text-sm text-gray-600">{getMethodLabel()}</p>
          <p className="text-lg font-semibold text-gray-900">${amountToPay.toFixed(2)}</p>
        </div>
        <Button
          className="w-full sm:w-auto sm:min-w-[180px]"
          onClick={handlePayment}
          disabled={splitMethod === 'items' && selectedItemsTotal <= 0}
          size="lg"
        >
          {t('confirmAndPay', language)}
        </Button>
      </BottomActionBar>
    </>
  );
}
