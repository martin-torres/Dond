import { useState } from 'react';
import { CreditCard, Smartphone, Shield, Check } from 'lucide-react';
import { Language } from '../types/restaurant';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface PaymentMethodSetupProps {
  language: Language;
  onPaymentMethodAdded: () => void;
}

export function PaymentMethodSetup({ language, onPaymentMethodAdded }: PaymentMethodSetupProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const getText = (key: string) => {
    const texts = {
      en: {
        title: 'Add Payment Method',
        subtitle: 'Secure your drinks order with a payment method',
        applePay: 'Apple Pay',
        googlePay: 'Google Pay',
        creditCard: 'Credit/Debit Card',
        secure: 'Your payment info is encrypted and secure',
        addMethod: 'Add Payment Method',
        processing: 'Processing...',
        success: 'Payment method added successfully!'
      },
      es: {
        title: 'Agregar Método de Pago',
        subtitle: 'Asegura tu orden de bebidas con un método de pago',
        applePay: 'Apple Pay',
        googlePay: 'Google Pay',
        creditCard: 'Tarjeta de Crédito/Débito',
        secure: 'Tu información de pago está encriptada y segura',
        addMethod: 'Agregar Método de Pago',
        processing: 'Procesando...',
        success: '¡Método de pago agregado exitosamente!'
      }
    };
    return texts[language as keyof typeof texts]?.[key as keyof typeof texts['en']] || texts.en[key as keyof typeof texts['en']];
  };

  const handleAddPayment = async () => {
    if (!selectedMethod) return;
    
    setIsProcessing(true);
    
    // Simulate payment method setup
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    onPaymentMethodAdded();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-3">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="text-center pt-4 pb-2">
          <h1 className="text-xl font-bold text-gray-900 mb-1">{getText('title')}</h1>
          <p className="text-sm text-gray-600 px-2">{getText('subtitle')}</p>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          {/* Apple Pay */}
          <Card 
            className={`p-4 cursor-pointer transition-all ${
              selectedMethod === 'apple' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedMethod('apple')}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 ${
                selectedMethod === 'apple' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}>
                {selectedMethod === 'apple' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />}
              </div>
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">🍎</span>
              </div>
              <span className="font-medium text-gray-900">{getText('applePay')}</span>
            </div>
          </Card>

          {/* Google Pay */}
          <Card 
            className={`p-4 cursor-pointer transition-all ${
              selectedMethod === 'google' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedMethod('google')}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 ${
                selectedMethod === 'google' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}>
                {selectedMethod === 'google' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />}
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-gray-900">{getText('googlePay')}</span>
            </div>
          </Card>

          {/* Credit Card */}
          <Card 
            className={`p-4 cursor-pointer transition-all ${
              selectedMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedMethod('card')}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 ${
                selectedMethod === 'card' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}>
                {selectedMethod === 'card' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />}
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-gray-900">{getText('creditCard')}</span>
            </div>
          </Card>
        </div>

        {/* Security Notice */}
        <Card className="p-3 bg-green-50 border-green-200">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-600" />
            <p className="text-xs text-green-800">{getText('secure')}</p>
          </div>
        </Card>

        {/* Add Button */}
        <div className="pt-2">
          <Button
            onClick={handleAddPayment}
            disabled={!selectedMethod || isProcessing}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {getText('processing')}
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                {getText('addMethod')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}