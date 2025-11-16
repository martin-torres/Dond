import { useState } from 'react';
import { CreditCard, Users, Receipt, Check, ArrowLeft } from 'lucide-react';
import { Bill, Language, OrderItem } from '../types/restaurant';
import { t } from '../utils/translations';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';

interface BillPaymentProps {
  bill: Bill;
  language: Language;
  onPaymentComplete: (paidAmount?: number, paidItems?: string[]) => void;
}

interface IndividualOrderItem {
  id: string;
  menuItem: OrderItem['menuItem'];
  unitPrice: number;
  selected: boolean;
  paidBy?: string;
}

export function BillPayment({ bill, language, onPaymentComplete }: BillPaymentProps) {
  const [paymentMode, setPaymentMode] = useState<'full' | 'split-even' | 'split-items'>('full');
  const [splitCount, setSplitCount] = useState(2);
  const [showItemSelection, setShowItemSelection] = useState(false);
  const [individualItems, setIndividualItems] = useState<IndividualOrderItem[]>(() => {
    // Create individual items array from order items
    const items: IndividualOrderItem[] = [];
    bill.items.forEach((orderItem) => {
      for (let i = 0; i < orderItem.quantity; i++) {
        items.push({
          id: `${orderItem.menuItem.id}-${i}`,
          menuItem: orderItem.menuItem,
          unitPrice: orderItem.menuItem.price,
          selected: false,
        });
      }
    });
    return items;
  });
  
  const [currentPayerName, setCurrentPayerName] = useState('');
  const [paymentHistory, setPaymentHistory] = useState<Array<{
    payerName: string;
    amount: number;
    items: string[];
  }>>([]);

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const remainingTotal = bill.total - paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
  const unpaidItems = individualItems.filter(item => !item.paidBy);

  const handleItemSelection = (itemId: string, selected: boolean) => {
    setIndividualItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, selected } : item
      )
    );
  };

  const calculateSelectedAmount = () => {
    const selectedItems = individualItems.filter(item => item.selected && !item.paidBy);
    const subtotal = selectedItems.reduce((sum, item) => sum + item.unitPrice, 0);
    
    // Calculate proportional tax and tip
    const taxRate = bill.tax / bill.subtotal;
    const tipRate = bill.tip / bill.subtotal;
    
    const tax = subtotal * taxRate;
    const tip = subtotal * tipRate;
    
    return {
      subtotal,
      tax,
      tip,
      total: subtotal + tax + tip,
      items: selectedItems
    };
  };

  const handlePaySelectedItems = () => {
    if (!currentPayerName.trim()) {
      alert(language === 'es' ? 'Por favor ingresa un nombre' : 'Please enter a name');
      return;
    }

    const calculation = calculateSelectedAmount();
    if (calculation.items.length === 0) {
      alert(language === 'es' ? 'Por favor selecciona al menos un artículo' : 'Please select at least one item');
      return;
    }

    // Mark items as paid
    setIndividualItems(prev => 
      prev.map(item => 
        item.selected && !item.paidBy 
          ? { ...item, selected: false, paidBy: currentPayerName }
          : item
      )
    );

    // Add to payment history
    setPaymentHistory(prev => [...prev, {
      payerName: currentPayerName,
      amount: calculation.total,
      items: calculation.items.map(item => `${item.menuItem.name[language]} ($${item.unitPrice})`)
    }]);

    setCurrentPayerName('');

    // Check if all items are paid
    const allItemsPaid = individualItems.every(item => item.paidBy || item.selected);
    if (allItemsPaid) {
      setTimeout(() => onPaymentComplete(), 1000);
    }
  };

  const handleSplitEvenly = () => {
    const amountPerPerson = remainingTotal / splitCount;
    onPaymentComplete(amountPerPerson);
  };

  const handlePayFull = () => {
    onPaymentComplete(remainingTotal);
  };

  if (showItemSelection) {
    const calculation = calculateSelectedAmount();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowItemSelection(false)}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'es' ? 'Seleccionar Artículos' : 'Select Items'}
            </h1>
          </div>

          {/* Payment History */}
          {paymentHistory.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                {language === 'es' ? 'Pagos Realizados' : 'Completed Payments'}
              </h3>
              {paymentHistory.map((payment, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{payment.payerName}</p>
                    <p className="text-xs text-gray-600">
                      {payment.items.length} {language === 'es' ? 'artículos' : 'items'}
                    </p>
                  </div>
                  <span className="font-bold text-green-600">{formatPrice(payment.amount)}</span>
                </div>
              ))}
            </Card>
          )}

          {/* Remaining Items */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">
              {language === 'es' ? 'Artículos Restantes' : 'Remaining Items'} ({unpaidItems.length})
            </h3>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {unpaidItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Checkbox
                    checked={item.selected}
                    onCheckedChange={(checked) => handleItemSelection(item.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.menuItem.name[language]}</p>
                    <p className="text-xs text-gray-600">{formatPrice(item.unitPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Current Selection Summary */}
          {calculation.items.length > 0 && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">
                {language === 'es' ? 'Selección Actual' : 'Current Selection'}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{language === 'es' ? 'Subtotal' : 'Subtotal'}:</span>
                  <span>{formatPrice(calculation.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'es' ? 'Servicio' : 'Service'}:</span>
                  <span>{formatPrice(calculation.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'es' ? 'Propina' : 'Tip'}:</span>
                  <span>{formatPrice(calculation.tip)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>{language === 'es' ? 'Total' : 'Total'}:</span>
                  <span>{formatPrice(calculation.total)}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Payer Input */}
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'es' ? 'Nombre del Pagador' : 'Payer Name'}
                </label>
                <input
                  type="text"
                  value={currentPayerName}
                  onChange={(e) => setCurrentPayerName(e.target.value)}
                  placeholder={language === 'es' ? 'Ingresa tu nombre' : 'Enter your name'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <Button
                onClick={handlePaySelectedItems}
                disabled={calculation.items.length === 0 || !currentPayerName.trim()}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                size="lg"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Pagar Selección' : 'Pay Selection'} 
                {calculation.items.length > 0 && ` (${formatPrice(calculation.total)})`}
              </Button>
            </div>
          </Card>

          {/* Remaining Total */}
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">
              {language === 'es' ? 'Total Restante' : 'Remaining Total'}: {formatPrice(remainingTotal)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Bill Summary */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{t('bill', language)}</h1>
          </div>

          {/* Items */}
          <div className="space-y-3 mb-6">
            {bill.items.map((item) => (
              <div key={item.menuItem.id} className="flex justify-between items-center py-2 border-b border-gray-200">
                <div>
                  <p className="font-medium">{item.menuItem.name[language]}</p>
                  <p className="text-sm text-gray-600">
                    {formatPrice(item.menuItem.price)} × {item.quantity}
                  </p>
                </div>
                <span className="font-semibold">{formatPrice(item.menuItem.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-2 border-t border-gray-200 pt-4">
            <div className="flex justify-between">
              <span>{t('subtotal', language)}:</span>
              <span>{formatPrice(bill.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('tax', language)} (10%):</span>
              <span>{formatPrice(bill.tax)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('tip', language)} (15%):</span>
              <span>{formatPrice(bill.tip)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
              <span>{t('total', language)}:</span>
              <span>{formatPrice(bill.total)}</span>
            </div>
          </div>

          {/* Payments made */}
          {bill.payments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">{t('paid', language)}:</h3>
              {bill.payments.map((payment) => (
                <div key={payment.userId} className="flex justify-between text-sm text-gray-600">
                  <span>{payment.userName}</span>
                  <span>-{formatPrice(payment.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-green-600 border-t border-gray-200 pt-2 mt-2">
                <span>{t('remaining', language)}:</span>
                <span>{formatPrice(remainingTotal)}</span>
              </div>
            </div>
          )}
        </Card>

        {/* Payment Options */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('splitBill', language)}</h2>
          
          <div className="space-y-4">
            {/* Pay Full Amount */}
            <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              paymentMode === 'full' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`} onClick={() => setPaymentMode('full')}>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  paymentMode === 'full' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {paymentMode === 'full' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />}
                </div>
                <div>
                  <h3 className="font-medium">{t('payFull', language)}</h3>
                  <p className="text-sm text-gray-600">{formatPrice(remainingTotal)}</p>
                </div>
              </div>
            </div>

            {/* Split Evenly */}
            <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              paymentMode === 'split-even' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`} onClick={() => setPaymentMode('split-even')}>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  paymentMode === 'split-even' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {paymentMode === 'split-even' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{t('splitEvenly', language)}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <select 
                      value={splitCount} 
                      onChange={(e) => setSplitCount(Number(e.target.value))}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {[2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>{num} {language === 'es' ? 'personas' : 'people'}</option>
                      ))}
                    </select>
                    <span className="text-sm text-gray-600">
                      = {formatPrice(remainingTotal / splitCount)} {language === 'es' ? 'cada uno' : 'each'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Split by Items */}
            <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              paymentMode === 'split-items' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`} onClick={() => setPaymentMode('split-items')}>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  paymentMode === 'split-items' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {paymentMode === 'split-items' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />}
                </div>
                <div>
                  <h3 className="font-medium">{t('splitByItems', language)}</h3>
                  <p className="text-sm text-gray-600">{t('selectYourItems', language)}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {paymentMode === 'full' && (
            <Button 
              onClick={handlePayFull}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white" 
              size="lg"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {t('payNow', language)} ({formatPrice(remainingTotal)})
            </Button>
          )}

          {paymentMode === 'split-even' && (
            <Button 
              onClick={handleSplitEvenly}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" 
              size="lg"
            >
              <Users className="w-4 h-4 mr-2" />
              {t('payNow', language)} ({formatPrice(remainingTotal / splitCount)})
            </Button>
          )}

          {paymentMode === 'split-items' && (
            <Button 
              onClick={() => setShowItemSelection(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white" 
              size="lg"
            >
              <Receipt className="w-4 h-4 mr-2" />
              {language === 'es' ? 'Seleccionar Artículos' : 'Select Items'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}