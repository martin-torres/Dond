import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard, Users, Check } from 'lucide-react';
import { Restaurant, OrderItem } from '@/data/mockData';
import { useLanguage } from '@/hooks/useLanguage';

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [tipPercentage, setTipPercentage] = useState(18);
  const [customTip, setCustomTip] = useState('');
  const [splitCount, setSplitCount] = useState(1);
  const [paymentComplete, setPaymentComplete] = useState(false);

  useEffect(() => {
    const savedRestaurant = localStorage.getItem('selectedRestaurant');
    const savedOrder = localStorage.getItem('currentOrder');
    const savedTotal = localStorage.getItem('orderTotal');
    
    if (savedRestaurant) setRestaurant(JSON.parse(savedRestaurant));
    if (savedOrder) setOrder(JSON.parse(savedOrder));
    if (savedTotal) setOrderTotal(parseFloat(savedTotal));
  }, []);

  const tipAmount = customTip ? parseFloat(customTip) || 0 : (orderTotal * tipPercentage / 100);
  const totalWithTip = orderTotal + tipAmount;
  const perPersonAmount = totalWithTip / splitCount;

  const handleTipSelect = (percentage: number) => {
    setTipPercentage(percentage);
    setCustomTip('');
  };

  const handleCustomTipChange = (value: string) => {
    setCustomTip(value);
    setTipPercentage(0);
  };

  const handlePayment = () => {
    setPaymentComplete(true);
    // Clear order data
    localStorage.removeItem('currentOrder');
    localStorage.removeItem('orderTotal');
    
    setTimeout(() => {
      navigate('/restaurants');
    }, 3000);
  };

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for dining with us. Your payment has been processed.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to restaurants...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Restaurant not found</h2>
          <Button onClick={() => navigate('/restaurants')}>
            Back to Restaurants
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(`/menu/${restaurant.id}`)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              {t('payment')}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {order.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.quantity}x Item</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between font-semibold">
              <span>Subtotal</span>
              <span>${orderTotal.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Tip Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('addTip')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[15, 18, 20, 25].map((percentage) => (
                <Button
                  key={percentage}
                  variant={tipPercentage === percentage ? "default" : "outline"}
                  onClick={() => handleTipSelect(percentage)}
                  className="h-12"
                >
                  {percentage}%
                </Button>
              ))}
            </div>
            <div>
              <Label htmlFor="customTip" className="text-sm font-medium">
                Custom Amount
              </Label>
              <Input
                id="customTip"
                type="number"
                placeholder="0.00"
                value={customTip}
                onChange={(e) => handleCustomTipChange(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex justify-between text-sm mt-3 text-gray-600">
              <span>Tip Amount</span>
              <span>${tipAmount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Split Bill */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t('splitBill')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Label htmlFor="splitCount" className="text-sm font-medium">
                Number of people:
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                  disabled={splitCount <= 1}
                >
                  -
                </Button>
                <span className="w-8 text-center font-semibold">{splitCount}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSplitCount(splitCount + 1)}
                >
                  +
                </Button>
              </div>
            </div>
            {splitCount > 1 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Each person pays: <span className="font-bold">${perPersonAmount.toFixed(2)}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total */}
        <Card className="border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold">Total</span>
              <span className="text-2xl font-bold text-blue-600">
                ${totalWithTip.toFixed(2)}
              </span>
            </div>
            {splitCount > 1 && (
              <p className="text-sm text-gray-600 mb-4">
                ${perPersonAmount.toFixed(2)} per person
              </p>
            )}
            <Button onClick={handlePayment} className="w-full h-12 text-lg">
              <CreditCard className="w-5 h-5 mr-2" />
              {t('payNow')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}