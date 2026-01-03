import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CreditCard, Users, Check } from 'lucide-react';
import { useTranslation } from '../lib/translations';

interface PaymentPageProps {
  language: string;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ language }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tipPercentage, setTipPercentage] = useState(18);
  const [splitCount, setSplitCount] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const t = useTranslation(language);

  const { cart = [], restaurant, total = 0 } = location.state || {};

  const tipAmount = (total * tipPercentage) / 100;
  const finalTotal = total + tipAmount;
  const splitAmount = finalTotal / splitCount;

  const formatPrice = (price: number) => {
    if (restaurant?.id === '1') {
      return `$${price.toFixed(2)} MXN`;
    }
    return `$${price.toFixed(2)}`;
  };

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      setTimeout(() => {
        navigate('/restaurants');
      }, 3000);
    }, 2000);
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.success}!</h2>
          <p className="text-gray-600 mb-4">
            {t.payBill} - {restaurant?.name}
          </p>
          <p className="text-sm text-gray-500">
            {t.loading}
          </p>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md mx-4">
          <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{t.loading}</h2>
          <p className="text-gray-600">Processing payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-4 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="ml-3">
          <h1 className="text-xl font-semibold text-gray-800">{t.payBill}</h1>
          <p className="text-sm text-gray-600">{restaurant?.name}</p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{t.orderTotal}</h2>
          
          <div className="space-y-2 mb-4">
            {cart.map((item: unknown, index: number) => (
              <div key={index} className="flex justify-between items-center py-1">
                <span className="text-gray-600">{item.name}</span>
                <span className="font-medium">{formatPrice(item.price)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>{t.subtotal}:</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Tip Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.addTip}</h3>
          
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[15, 18, 20, 25].map((percentage) => (
              <button
                key={percentage}
                onClick={() => setTipPercentage(percentage)}
                className={`p-3 rounded-lg border-2 text-center transition-colors ${
                  tipPercentage === percentage
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {percentage}%
              </button>
            ))}
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{t.tip} ({tipPercentage}%):</span>
            <span className="font-medium">{formatPrice(tipAmount)}</span>
          </div>
        </div>

        {/* Split Bill */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            {t.splitBill}
          </h3>
          
          <div className="flex items-center justify-center space-x-4 mb-4">
            <button
              onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
              className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-medium"
            >
              -
            </button>
            <span className="text-xl font-semibold text-gray-800 min-w-[80px] text-center">
              {splitCount} {splitCount === 1 ? t.person : t.people}
            </span>
            <button
              onClick={() => setSplitCount(splitCount + 1)}
              className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-medium"
            >
              +
            </button>
          </div>
          
          {splitCount > 1 && (
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-blue-800 font-medium">
                {formatPrice(splitAmount)} per person
              </p>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center text-xl font-bold mb-6">
            <span>{t.total}:</span>
            <span className="text-green-600">{formatPrice(finalTotal)}</span>
          </div>
          
          <button
            onClick={handlePayment}
            className="w-full bg-green-600 text-white py-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <CreditCard className="w-5 h-5" />
            <span>{t.payBill}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;