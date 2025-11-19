import { useState, useEffect } from 'react';
import { AppStage, Language, OrderItem, Restaurant, Bill, Payment } from './types';
import { QRScanner } from './components/QRScanner';
import { RestaurantInfo } from './components/RestaurantInfo';
import { TableSelector } from './components/TableSelector';
import { WaitingScreen } from './components/WaitingScreen';
import { TableReadyScreen } from './components/TableReadyScreen';
import { MenuDisplay } from './components/MenuDisplay';
import { DiningScreen } from './components/DiningScreen';
import { BillPayment } from './components/BillPayment';
import { PaymentCompleteScreen } from './components/PaymentCompleteScreen';
import { ProximityWarning } from './components/ProximityWarning';
import { DemoInfoCard } from './components/DemoInfoCard';
import { mockRestaurants } from './data/mockRestaurants';
import { Button } from './components/ui/button';
import { Globe } from 'lucide-react';

export default function App() {
  // Detect phone language (simulated - in real app would use navigator.language)
  const [language, setLanguage] = useState<Language>('en');
  const [stage, setStage] = useState<AppStage>('qr-scan');
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [currentOrders, setCurrentOrders] = useState<OrderItem[]>([]);
  const [drinkOrders, setDrinkOrders] = useState<OrderItem[]>([]);
  const [proximityDistance, setProximityDistance] = useState(10); // meters from restaurant
  const [bill, setBill] = useState<Bill | null>(null);
  const [mockPayments, setMockPayments] = useState<Payment[]>([]);

  // Auto-detect language on mount (simulated)
  useEffect(() => {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('es')) setLanguage('es');
    else if (browserLang.startsWith('fr')) setLanguage('fr');
    else if (browserLang.startsWith('de')) setLanguage('de');
    else if (browserLang.startsWith('ja')) setLanguage('ja');
    else if (browserLang.startsWith('ar')) setLanguage('ar');
    else if (browserLang.startsWith('zh')) setLanguage('zh');
    else setLanguage('en');
  }, []);

  // Simulate proximity changes
  useEffect(() => {
    if (stage === 'waiting' && drinkOrders.length > 0) {
      // Simulate random proximity changes for demo
      const interval = setInterval(() => {
        setProximityDistance(prev => {
          const change = (Math.random() - 0.5) * 10;
          return Math.max(0, Math.min(100, prev + change));
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [stage, drinkOrders]);

  const handleQRScan = (restaurantId: string) => {
    const restaurant = mockRestaurants.find(r => r.id === restaurantId);
    if (restaurant) {
      setCurrentRestaurant(restaurant);
      setStage('restaurant-info');
    }
  };

  const handleTableSelection = (tableId: string | null) => {
    setSelectedTableId(tableId);
    setStage('waiting');
  };

  const handleOrderDrinks = () => {
    setStage('ordering-drinks');
  };

  const handleDrinkOrderPlaced = (items: OrderItem[]) => {
    setDrinkOrders(items);
    setCurrentOrders(prev => [...prev, ...items]);
    setStage('waiting');
  };

  const handleTableReady = () => {
    setStage('table-ready');
  };

  const handleProceedToTable = () => {
    // Proximity check is now handled by ProximityWarning component
    setStage('ordering-food');
  };

  const handleChargeAndReleaseTable = () => {
    const drinkTotal = drinkOrders.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
    alert(`Card charged $${drinkTotal.toFixed(2)} for drinks. Table has been released to next person on waitlist.`);
    // Reset to start - user lost their table
    setStage('qr-scan');
    setCurrentRestaurant(null);
    setSelectedTableId(null);
    setCurrentOrders([]);
    setDrinkOrders([]);
  };

  const handleFoodOrderPlaced = (items: OrderItem[]) => {
    setCurrentOrders(prev => [...prev, ...items]);
    setStage('dining');
  };

  const handleContinueOrdering = () => {
    setStage('ordering-food');
  };

  const handleRequestBill = () => {
    const subtotal = currentOrders.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
    const tax = subtotal * 0.1;
    const tip = subtotal * 0.15;
    
    setBill({
      items: currentOrders,
      subtotal,
      tax,
      tip,
      total: subtotal + tax + tip,
      payments: mockPayments,
    });
    setStage('payment');
  };

  const handlePaymentComplete = (paidAmount?: number, paidItems?: string[]) => {
    // Reset to initial state
    setStage('qr-scan');
    setCurrentRestaurant(null);
    setSelectedTableId(null);
    setCurrentOrders([]);
    setDrinkOrders([]);
    setBill(null);
    setMockPayments([]);
  };

  const selectedTable = currentRestaurant?.tables.find(t => t.id === selectedTableId);

  // Language selector (for demo purposes)
  const LanguageSelector = () => (
    <div className="fixed top-4 right-4 z-50">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm flex items-center gap-2"
      >
        <option value="en">🇬🇧 English</option>
        <option value="es">🇪🇸 Español</option>
        <option value="fr">🇫🇷 Français</option>
        <option value="de">🇩🇪 Deutsch</option>
        <option value="ja">🇯🇵 日本語</option>
        <option value="ar">🇸🇦 العربية</option>
        <option value="zh">🇨🇳 中文</option>
      </select>
    </div>
  );

  // Simulate other people paying at terminal
  const SimulateTerminalPayment = () => {
    if (stage !== 'payment' || !bill) return null;
    
    return (
      <div className="fixed bottom-24 right-4 z-50">
        <Button
          onClick={() => {
            const payment: Payment = {
              userId: `user-${mockPayments.length + 1}`,
              userName: `Customer ${mockPayments.length + 1}`,
              amount: 25,
              paidAt: new Date(),
            };
            setMockPayments(prev => [...prev, payment]);
            setBill(prev => prev ? { ...prev, payments: [...prev.payments, payment] } : null);
          }}
          variant="outline"
          size="sm"
        >
          Simulate Terminal Payment
        </Button>
      </div>
    );
  };

  // Distance simulator for demo
  const DistanceSimulator = () => {
    if (stage !== 'waiting' || drinkOrders.length === 0) return null;
    
    return (
      <div className="fixed bottom-24 left-4 z-50 bg-white p-3 rounded-lg shadow-lg border">
        <p className="text-xs mb-2">Demo: Distance Control</p>
        <input
          type="range"
          min="0"
          max="100"
          value={proximityDistance}
          onChange={(e) => setProximityDistance(Number(e.target.value))}
          className="w-32"
        />
        <p className="text-xs mt-1">{proximityDistance}m</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {stage === 'qr-scan' && <DemoInfoCard />}
      
      <LanguageSelector />
      <SimulateTerminalPayment />
      <DistanceSimulator />
      
      {stage === 'waiting' && drinkOrders.length > 0 && (
        <ProximityWarning 
          distance={proximityDistance} 
          language={language} 
          drinkTotal={drinkOrders.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)}
          onChargeAndRelease={handleChargeAndReleaseTable}
        />
      )}

      {stage === 'qr-scan' && (
        <QRScanner language={language} onScan={handleQRScan} />
      )}

      {stage === 'restaurant-info' && currentRestaurant && (
        <RestaurantInfo
          restaurant={currentRestaurant}
          language={language}
          onContinue={() => setStage('table-selection')}
        />
      )}

      {stage === 'table-selection' && currentRestaurant && (
        <TableSelector
          tables={currentRestaurant.tables}
          language={language}
          onSelectTable={handleTableSelection}
        />
      )}

      {stage === 'waiting' && currentRestaurant && (
        <WaitingScreen
          language={language}
          estimatedWaitTime={currentRestaurant.waitTime}
          onTableReady={handleTableReady}
          onOrderDrinks={handleOrderDrinks}
        />
      )}

      {stage === 'ordering-drinks' && currentRestaurant && (
        <MenuDisplay
          drinks={currentRestaurant.menu.drinks}
          food={currentRestaurant.menu.food}
          language={language}
          onPlaceOrder={handleDrinkOrderPlaced}
          isDrinksOnly={true}
        />
      )}

      {stage === 'table-ready' && selectedTable && (
        <TableReadyScreen
          language={language}
          tableNumber={selectedTable.number}
          onProceed={handleProceedToTable}
        />
      )}

      {stage === 'ordering-food' && currentRestaurant && (
        <MenuDisplay
          drinks={currentRestaurant.menu.drinks}
          food={currentRestaurant.menu.food}
          language={language}
          onPlaceOrder={handleFoodOrderPlaced}
          isDrinksOnly={false}
        />
      )}

      {stage === 'dining' && selectedTable && (
        <DiningScreen
          language={language}
          currentOrders={currentOrders}
          tableNumber={selectedTable.number}
          onContinueOrdering={handleContinueOrdering}
          onRequestBill={handleRequestBill}
        />
      )}

      {stage === 'payment' && bill && (
        <BillPayment
          bill={bill}
          language={language}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}