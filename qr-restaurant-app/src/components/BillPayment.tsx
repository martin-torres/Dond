import { useState } from 'react';
import { CreditCard, Users, Receipt, Check, Minus, Plus } from 'lucide-react';
import { Bill, Language, OrderItem } from '../types';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';

// Helper type for individual item instances
interface ItemInstance {
  menuItemId: string;
  instanceIndex: number;
  name: Record<string, string>;
  price: number;
  paid: boolean; // Track if this instance has been paid
}

interface BillPaymentProps {
  bill: Bill;
  language: Language;
  onPaymentComplete: (paidAmount: number, paidItems: string[]) => void;
}

export function BillPayment({ bill, language, onPaymentComplete }: BillPaymentProps) {
  const [splitMode, setSplitMode] = useState<'full' | 'even' | 'items' | null>(null);
  const [tipPercentage, setTipPercentage] = useState(15);
  const [selectedItemInstances, setSelectedItemInstances] = useState<Set<string>>(new Set());
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [paidItemInstances, setPaidItemInstances] = useState<Set<string>>(new Set());

  // Expand items into individual instances for split-by-items mode
  const expandedItems: ItemInstance[] = [];
  bill.items.forEach((item) => {
    for (let i = 0; i < item.quantity; i++) {
      const key = `${item.menuItem.id}-${i}`;
      expandedItems.push({
        menuItemId: item.menuItem.id,
        instanceIndex: i,
        name: item.menuItem.name,
        price: item.menuItem.price,
        paid: paidItemInstances.has(key),
      });
    }
  });

  // Filter out already paid items
  const unpaidExpandedItems = expandedItems.filter(item => !item.paid);

  // Create a map to track how many instances of each item are selected
  const getSelectedCountForItem = (menuItemId: string): number => {
    return unpaidExpandedItems.filter(
      (instance) => 
        instance.menuItemId === menuItemId && 
        selectedItemInstances.has(`${instance.menuItemId}-${instance.instanceIndex}`)
    ).length;
  };

  // Calculate totals based on unpaid items only
  const unpaidSubtotal = unpaidExpandedItems.reduce((sum, instance) => sum + instance.price, 0);
  const serviceCharge = unpaidSubtotal * 0.08999; // 8.999% service charge
  const fullTipAmount = unpaidSubtotal * (tipPercentage / 100);
  const totalWithTip = unpaidSubtotal + serviceCharge + fullTipAmount;
  
  // Amount already paid by others
  const alreadyPaid = bill.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = totalWithTip - alreadyPaid;

  // Calculate amount based on split mode
  let yourAmount = remaining;
  let yourSubtotal = unpaidSubtotal;
  let yourService = serviceCharge;
  let yourTip = fullTipAmount;

  if (splitMode === 'even') {
    yourAmount = remaining / numberOfPeople;
    yourSubtotal = unpaidSubtotal / numberOfPeople;
    yourService = serviceCharge / numberOfPeople;
    yourTip = fullTipAmount / numberOfPeople;
  } else if (splitMode === 'items') {
    const selectedItemsSubtotal = unpaidExpandedItems
      .filter(instance => selectedItemInstances.has(`${instance.menuItemId}-${instance.instanceIndex}`))
      .reduce((sum, instance) => sum + instance.price, 0);
    
    // Proportional service and tip based on items selected
    const proportion = unpaidSubtotal > 0 ? selectedItemsSubtotal / unpaidSubtotal : 0;
    yourSubtotal = selectedItemsSubtotal;
    yourService = serviceCharge * proportion;
    yourTip = fullTipAmount * proportion;
    yourAmount = yourSubtotal + yourService + yourTip;
  }

  const toggleItemInstance = (menuItemId: string, instanceIndex: number) => {
    const key = `${menuItemId}-${instanceIndex}`;
    // Don't allow toggling paid items
    if (paidItemInstances.has(key)) return;
    
    setSelectedItemInstances(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const adjustItemSelection = (menuItemId: string, currentCount: number, maxCount: number, increment: boolean) => {
    const unpaidInstances = unpaidExpandedItems.filter(i => i.menuItemId === menuItemId);
    
    if (increment && currentCount < unpaidInstances.length) {
      // Add the next unselected instance
      for (const instance of unpaidInstances) {
        const key = `${instance.menuItemId}-${instance.instanceIndex}`;
        if (!selectedItemInstances.has(key)) {
          setSelectedItemInstances(prev => new Set(prev).add(key));
          break;
        }
      }
    } else if (!increment && currentCount > 0) {
      // Remove the last selected instance
      for (let i = unpaidInstances.length - 1; i >= 0; i--) {
        const instance = unpaidInstances[i];
        const key = `${instance.menuItemId}-${instance.instanceIndex}`;
        if (selectedItemInstances.has(key)) {
          setSelectedItemInstances(prev => {
            const newSet = new Set(prev);
            newSet.delete(key);
            return newSet;
          });
          break;
        }
      }
    }
  };

  const handlePayment = () => {
    if (splitMode === 'items') {
      // Mark selected items as paid
      const paidKeys = Array.from(selectedItemInstances);
      setPaidItemInstances(prev => new Set([...prev, ...paidKeys]));
      
      // Clear selection for next person
      setSelectedItemInstances(new Set());
      
      // Reset to bill view if all items are paid
      const allPaid = unpaidExpandedItems.every(item => 
        selectedItemInstances.has(`${item.menuItemId}-${item.instanceIndex}`) ||
        paidItemInstances.has(`${item.menuItemId}-${item.instanceIndex}`)
      );
      
      if (allPaid || yourAmount >= remaining - 0.01) {
        // Payment complete
        onPaymentComplete(yourAmount, paidKeys);
      } else {
        // Go back to bill view for next payment
        setSplitMode(null);
      }
    } else {
      // Full or even payment - complete
      const paidKeys = unpaidExpandedItems.map(item => `${item.menuItemId}-${item.instanceIndex}`);
      onPaymentComplete(yourAmount, paidKeys);
    }
  };

  // Check if all items are paid
  const allItemsPaid = unpaidExpandedItems.length === 0;

  if (allItemsPaid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Check className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-gray-900 mb-2">{t('paymentComplete', language)}</h2>
          <p className="text-gray-600">{t('thankYou', language)}</p>
        </Card>
      </div>
    );
  }

  if (splitMode === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-gray-900 mb-2">{t('bill', language)}</h1>
          </div>

          {/* Bill Summary */}
          <Card className="p-6">
            <div className="space-y-3">
              {bill.items.map((item, index) => {
                const itemInstances = expandedItems.filter(i => i.menuItemId === item.menuItem.id);
                const paidCount = itemInstances.filter(i => i.paid).length;
                const unpaidCount = item.quantity - paidCount;
                
                if (unpaidCount === 0) return null;
                
                return (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-700">
                      {unpaidCount}x {item.menuItem.name[language]}
                      {paidCount > 0 && <span className="text-green-600 ml-2">({paidCount} paid)</span>}
                    </span>
                    <span className="text-gray-900">
                      ${(item.menuItem.price * unpaidCount).toFixed(2)}
                    </span>
                  </div>
                );
              })}
              
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>{t('subtotal', language)}</span>
                  <span>${unpaidSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t('tax', language)}</span>
                  <span>${serviceCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t('tip', language)} ({tipPercentage}%)</span>
                  <span>${fullTipAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-900 pt-2 border-t">
                  <span>{t('total', language)}</span>
                  <span>${totalWithTip.toFixed(2)}</span>
                </div>
              </div>

              {alreadyPaid > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between text-green-700">
                    <span>{t('paid', language)}</span>
                    <span>${alreadyPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-900">
                    <span>{t('remaining', language)}</span>
                    <span>${remaining.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Tip Slider */}
          <Card className="p-6">
            <label className="text-gray-900 mb-3 block">
              {t('tip', language)}: {tipPercentage}%
            </label>
            <Slider
              value={[tipPercentage]}
              onValueChange={(value) => setTipPercentage(value[0])}
              min={10}
              max={30}
              step={5}
              className="mb-2"
            />
            <div className="flex justify-between text-gray-600">
              <span>10%</span>
              <span>30%</span>
            </div>
          </Card>

          {/* Payment already made by others */}
          {bill.payments.length > 0 && (
            <Card className="p-6">
              <h3 className="text-gray-900 mb-3">{t('paid', language)}</h3>
              <div className="space-y-2">
                {bill.payments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">{payment.userName}</span>
                    </div>
                    <span className="text-green-700">${payment.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Split Options */}
          <Card className="p-6">
            <h2 className="text-gray-900 mb-4">{t('splitBill', language)}</h2>
            <div className="space-y-3">
              <Button
                onClick={() => setSplitMode('full')}
                variant="outline"
                className="w-full justify-start"
                size="lg"
              >
                <CreditCard className="w-5 h-5 mr-3" />
                {t('payFull', language)}
              </Button>
              
              <Button
                onClick={() => setSplitMode('even')}
                variant="outline"
                className="w-full justify-start"
                size="lg"
              >
                <Users className="w-5 h-5 mr-3" />
                {t('splitEvenly', language)}
              </Button>
              
              <Button
                onClick={() => setSplitMode('items')}
                variant="outline"
                className="w-full justify-start"
                size="lg"
              >
                <Receipt className="w-5 h-5 mr-3" />
                {t('splitByItems', language)}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 pb-32">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button onClick={() => setSplitMode(null)} variant="outline" size="sm">
            {t('back', language)}
          </Button>
          <h1 className="text-gray-900">
            {splitMode === 'full' ? t('payFull', language) :
             splitMode === 'even' ? t('splitEvenly', language) :
             t('splitByItems', language)}
          </h1>
        </div>

        {/* Split Even - Number of People */}
        {splitMode === 'even' && (
          <Card className="p-6">
            <label className="text-gray-900 mb-3 block">
              Number of People: {numberOfPeople}
            </label>
            <Slider
              value={[numberOfPeople]}
              onValueChange={(value) => setNumberOfPeople(value[0])}
              min={2}
              max={10}
              step={1}
              className="mb-2"
            />
            <div className="flex justify-between text-gray-600">
              <span>2</span>
              <span>10</span>
            </div>
          </Card>
        )}

        {/* Split by Items - Item Selection */}
        {splitMode === 'items' && (
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">{t('selectYourItems', language)}</h3>
            <div className="space-y-3">
              {bill.items.map((item, index) => {
                const itemInstances = unpaidExpandedItems.filter(i => i.menuItemId === item.menuItem.id);
                if (itemInstances.length === 0) return null;
                
                const selectedCount = getSelectedCountForItem(item.menuItem.id);
                const totalCount = itemInstances.length;
                const unitPrice = item.menuItem.price;
                
                return (
                  <div key={index} className="p-4 border-2 border-gray-200 rounded-lg space-y-3">
                    {/* Item header */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-gray-900">{item.menuItem.name[language]}</p>
                        <p className="text-gray-600">${unitPrice.toFixed(2)} each</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-900">
                          ${(unitPrice * selectedCount).toFixed(2)}
                        </p>
                        <p className="text-gray-600">
                          {selectedCount} of {totalCount} selected
                        </p>
                      </div>
                    </div>
                    
                    {/* Individual item instances */}
                    {totalCount > 1 ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                          {itemInstances.map((instance) => {
                            const key = `${instance.menuItemId}-${instance.instanceIndex}`;
                            const isSelected = selectedItemInstances.has(key);
                            return (
                              <button
                                key={key}
                                onClick={() => toggleItemInstance(instance.menuItemId, instance.instanceIndex)}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                  isSelected
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-gray-300 bg-white hover:border-blue-400'
                                }`}
                              >
                                <div className="flex flex-col items-center gap-1">
                                  {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                                  <span className="text-gray-700">#{instance.instanceIndex + 1}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-gray-600">Quick select:</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => adjustItemSelection(item.menuItem.id, selectedCount, totalCount, false)}
                              disabled={selectedCount === 0}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="text-gray-700 min-w-[3rem] text-center">
                              {selectedCount} / {totalCount}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => adjustItemSelection(item.menuItem.id, selectedCount, totalCount, true)}
                              disabled={selectedCount === totalCount}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleItemInstance(item.menuItem.id, itemInstances[0].instanceIndex)}
                        className={`w-full p-3 rounded-lg border-2 transition-all ${
                          selectedItemInstances.has(`${item.menuItem.id}-${itemInstances[0].instanceIndex}`)
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-300 bg-white hover:border-blue-400'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {selectedItemInstances.has(`${item.menuItem.id}-${itemInstances[0].instanceIndex}`) && (
                            <Check className="w-5 h-5 text-blue-600" />
                          )}
                          <span className="text-gray-700">
                            {selectedItemInstances.has(`${item.menuItem.id}-${itemInstances[0].instanceIndex}`) ? 'Selected' : 'Select this item'}
                          </span>
                        </div>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Itemized Payment Breakdown */}
        <Card className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>{t('subtotal', language)}</span>
              <span>${yourSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{t('tax', language)}</span>
              <span>${yourService.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{t('tip', language)}</span>
              <span>${yourTip.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Amount to Pay */}
        <Card className="p-6 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <div className="space-y-2">
            <p className="opacity-90">{t('yourAmount', language)}</p>
            <p className="text-4xl">${yourAmount.toFixed(2)}</p>
          </div>
        </Card>

        {/* Payment Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
          <div className="max-w-2xl mx-auto space-y-2">
            <Button 
              onClick={handlePayment} 
              className="w-full" 
              size="lg"
              disabled={splitMode === 'items' && selectedItemInstances.size === 0}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              {t('payNow', language)}
            </Button>
            <p className="text-center text-gray-600">
              {t('payAtTerminal', language)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
