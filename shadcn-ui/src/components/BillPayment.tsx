import { useState } from 'react';
import { CreditCard, Users, Receipt, Check, ArrowLeft } from 'lucide-react';
import { Bill, Language } from '../types/restaurant';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';

interface BillPaymentProps {
  bill: Bill;
  language: Language;
  onPaymentComplete: () => void;
}

export function BillPayment({ bill, language, onPaymentComplete }: BillPaymentProps) {
  const [splitMode, setSplitMode] = useState<'full' | 'even' | 'items' | null>(null);
  const [tipPercentage, setTipPercentage] = useState(15);
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = bill.items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const tipAmount = subtotal * (tipPercentage / 100);
  const total = subtotal + tax + tipAmount;

  const alreadyPaid = bill.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = total - alreadyPaid;

  let yourAmount = remaining;
  if (splitMode === 'even') {
    yourAmount = remaining / numberOfPeople;
  }

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    onPaymentComplete();
  };

  if (splitMode === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('bill', language)}</h1>
          </div>

          {/* Bill Summary */}
          <Card className="p-6">
            <div className="space-y-3">
              {bill.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-700">
                    {item.quantity}x {item.menuItem.name[language]}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(item.menuItem.price * item.quantity)}
                  </span>
                </div>
              ))}
              
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>{t('subtotal', language)}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t('tax', language)}</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t('tip', language)} ({tipPercentage}%)</span>
                  <span>{formatPrice(tipAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                  <span>{t('total', language)}</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {alreadyPaid > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between text-green-700">
                    <span>{t('paid', language)}</span>
                    <span>{formatPrice(alreadyPaid)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-green-900">
                    <span>{t('remaining', language)}</span>
                    <span>{formatPrice(remaining)}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Tip Slider */}
          <Card className="p-6">
            <label className="block text-lg font-medium text-gray-900 mb-3">
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
            <div className="flex justify-between text-sm text-gray-600">
              <span>10%</span>
              <span>30%</span>
            </div>
          </Card>

          {/* Payment already made by others */}
          {bill.payments.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('paid', language)}</h3>
              <div className="space-y-2">
                {bill.payments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">{payment.userName}</span>
                    </div>
                    <span className="font-medium text-green-700">{formatPrice(payment.amount)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Split Options */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('splitBill', language)}</h2>
            <div className="space-y-3">
              <Button
                onClick={() => setSplitMode('full')}
                variant="outline"
                className="w-full justify-start h-16 text-left"
                size="lg"
              >
                <CreditCard className="w-6 h-6 mr-3" />
                <div>
                  <div className="font-medium">{t('payFull', language)}</div>
                  <div className="text-sm text-gray-500">{formatPrice(remaining)}</div>
                </div>
              </Button>
              
              <Button
                onClick={() => setSplitMode('even')}
                variant="outline"
                className="w-full justify-start h-16 text-left"
                size="lg"
              >
                <Users className="w-6 h-6 mr-3" />
                <div>
                  <div className="font-medium">{t('splitEvenly', language)}</div>
                  <div className="text-sm text-gray-500">Between multiple people</div>
                </div>
              </Button>
              
              <Button
                onClick={() => setSplitMode('items')}
                variant="outline"
                className="w-full justify-start h-16 text-left"
                size="lg"
              >
                <Receipt className="w-6 h-6 mr-3" />
                <div>
                  <div className="font-medium">{t('splitByItems', language)}</div>
                  <div className="text-sm text-gray-500">Pay for specific items</div>
                </div>
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
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t('back', language)}
          </Button>
          <h1 className="text-xl font-bold text-gray-900">
            {splitMode === 'full' ? t('payFull', language) :
             splitMode === 'even' ? t('splitEvenly', language) :
             t('splitByItems', language)}
          </h1>
        </div>

        {/* Split Even - Number of People */}
        {splitMode === 'even' && (
          <Card className="p-6">
            <label className="block text-lg font-medium text-gray-900 mb-3">
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
            <div className="flex justify-between text-sm text-gray-600">
              <span>2</span>
              <span>10</span>
            </div>
          </Card>
        )}

        {/* Payment Breakdown */}
        <Card className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>{t('subtotal', language)}</span>
              <span>{formatPrice(splitMode === 'even' ? subtotal / numberOfPeople : subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{t('tax', language)}</span>
              <span>{formatPrice(splitMode === 'even' ? tax / numberOfPeople : tax)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{t('tip', language)}</span>
              <span>{formatPrice(splitMode === 'even' ? tipAmount / numberOfPeople : tipAmount)}</span>
            </div>
          </div>
        </Card>

        {/* Amount to Pay */}
        <Card className="p-6 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <div className="space-y-2">
            <p className="text-blue-100">{t('yourAmount', language)}</p>
            <p className="text-4xl font-bold">{formatPrice(yourAmount)}</p>
          </div>
        </Card>

        {/* Payment Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
          <div className="max-w-2xl mx-auto space-y-2">
            <Button 
              onClick={handlePayment} 
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white" 
              size="lg"
              disabled={isProcessing}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              {isProcessing ? 'Processing...' : t('payNow', language)}
            </Button>
            <p className="text-center text-sm text-gray-600">
              {t('payAtTerminal', language)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}