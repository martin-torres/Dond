import { useState, useEffect } from 'react';
import { AppStage, Language, OrderItem, Restaurant, Bill, Payment, MenuItem } from './types';
import { QRScanner } from './components/QRScanner';
import { RestaurantInfo } from './components/RestaurantInfo';
import { TableSelector } from './components/TableSelector';
import { WaitingScreen } from './components/WaitingScreen';
import { TableReadyScreen } from './components/TableReadyScreen';
import { MenuDisplay } from './components/MenuDisplay';
import { DiningScreen } from './components/DiningScreen';
import { OrderSubmissionScreen } from './components/OrderSubmissionScreen';
import { PostOrderOptionsScreen } from './components/PostOrderOptionsScreen';
import { ChefPreviewScreen } from './components/ChefPreviewScreen';
import { BillPayment } from './components/BillPayment';
import { PaymentCompleteScreen } from './components/PaymentCompleteScreen';
import { ProximityWarning } from './components/ProximityWarning';
import { mockRestaurants } from './data/mockRestaurants';
import { Button } from './components/ui/button';
import { Globe } from 'lucide-react';
import { OrderConfirmationScreen } from './components/OrderConfirmationScreen';
import { MenuPreview } from './components/MenuPreview';

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
  const [waitSeconds, setWaitSeconds] = useState<number | null>(null);
  const [menuFocusItemId, setMenuFocusItemId] = useState<string | null>(null);
  const [interactiveMenuFocusId, setInteractiveMenuFocusId] = useState<string | null>(null);
  const [interactiveMenuInitialTab, setInteractiveMenuInitialTab] = useState<'food' | 'drinks'>('food');
  const [chefPreviewCategory, setChefPreviewCategory] = useState<'food' | 'drinks' | null>(null);
  const [menuReturnStage, setMenuReturnStage] = useState<AppStage | null>(null);
  const [confirmationReturnStage, setConfirmationReturnStage] = useState<AppStage | null>(null);

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

  useEffect(() => {
    if (stage !== 'order-confirmation') return;

    const timeout = setTimeout(() => {
      if (currentOrders.length > 0) {
        setStage('dining');
      } else {
        setStage('waiting');
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [stage, currentOrders.length]);

  const handleQRScan = (restaurantId: string) => {
    const restaurant = mockRestaurants.find(r => r.id === restaurantId);
    if (restaurant) {
      setCurrentRestaurant(restaurant);
      setStage('restaurant-info');
      setSelectedTableId(null);
      setWaitSeconds(restaurant.waitTime);
      setMenuFocusItemId(null);
      setInteractiveMenuFocusId(null);
      setMenuReturnStage(null);
      setConfirmationReturnStage(null);
      setInteractiveMenuInitialTab('food');
      setChefPreviewCategory(null);
    }
  };

  const handleTableSelection = (tableId: string | null) => {
    setSelectedTableId(tableId);
    if (tableId && currentRestaurant) {
      const table = currentRestaurant.tables.find(t => t.id === tableId);
      if (table) {
        setWaitSeconds(currentRestaurant.waitTime);
      }
    } else {
      setWaitSeconds(currentRestaurant ? currentRestaurant.waitTime : null);
    }
    setStage('waiting');
  };

  const handleOrderDrinks = () => {
    setStage('ordering-drinks');
  };

  const handleDrinkOrderPlaced = (items: OrderItem[]) => {
    setDrinkOrders(items);
    setCurrentOrders(prev => [...prev, ...items]);
    setWaitSeconds(prev => {
      const base = prev ?? currentRestaurant?.waitTime ?? 0;
      if (base <= 1) return 1;
      return Math.max(Math.ceil(base / 2), 1);
    });
    setStage('waiting');
  };
  const handlePromoOrder = (menuItemId: string) => {
    if (!currentRestaurant) return;

    // Find the menu item in drinks or food
    const allMenuItems = [
      ...currentRestaurant.menu.drinks,
      ...currentRestaurant.menu.food,
    ];

    const menuItem = allMenuItems.find((item) => item.id === menuItemId);
    if (!menuItem) return;

    const newOrderItem: OrderItem = {
      menuItem,
      quantity: 1,
    };

    // Add to current orders
    const updatedOrders = [...currentOrders, newOrderItem];
    setCurrentOrders(updatedOrders);

    // Promo pre-orders are held until the guest is seated
    // and the main flow will handle billing later.
  };

  const handleTableReady = () => {
    setStage('table-ready');
  };

  const handleProceedToTable = () => {
    handleOpenInteractiveMenu(undefined, null);
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
    setMenuFocusItemId(null);
    setInteractiveMenuFocusId(null);
    setMenuReturnStage(null);
    setConfirmationReturnStage(null);
    setInteractiveMenuInitialTab('food');
    setChefPreviewCategory(null);
  };

  const handleFoodOrderPlaced = (items: OrderItem[]) => {
    setConfirmationReturnStage(menuReturnStage);
    setMenuReturnStage(null);
    setCurrentOrders((prev) => [...prev, ...items]);
    setInteractiveMenuFocusId(null);
    setStage('order-confirmation');
  };

  const handleContinueOrdering = (returnStage?: AppStage | null) => {
    const targetReturn = returnStage ?? confirmationReturnStage;
    handleOpenInteractiveMenu(undefined, targetReturn ?? null);
    setConfirmationReturnStage(null);
  };

  const handleViewDining = () => {
    if (currentOrders.length > 0) {
      setStage('dining');
    } else {
      setStage('waiting');
    }
  };

  const handleFinalizeOrder = () => {
    setStage('order-submit');
  };

  const handleOpenMenuPreview = (menuItemId?: string) => {
    setMenuFocusItemId(menuItemId ?? null);
    setStage('menu-preview');
  };

  const handleOpenInteractiveMenu = (
    menuItemId?: string,
    returnStage?: AppStage | null,
    initialTab: 'food' | 'drinks' = 'food'
  ) => {
    setInteractiveMenuFocusId(menuItemId ?? null);
    setMenuReturnStage(returnStage ?? null);
    setInteractiveMenuInitialTab(initialTab);
    setStage('ordering-food');
  };

  const handleOpenChefPreview = (category?: 'food' | 'drinks') => {
    setChefPreviewCategory(category ?? null);
    setStage('chef-preview');
  };

  const handleChefQuickAdd = (menuItemId: string, category: 'food' | 'drinks') => {
    if (!currentRestaurant) return;
    const sourceItems =
      category === 'drinks' ? currentRestaurant.menu.drinks : currentRestaurant.menu.food;
    const menuItem = sourceItems.find((item) => item.id === menuItemId);
    if (!menuItem) return;
    const quickItem: OrderItem = {
      menuItem,
      quantity: 1,
    };
    setMenuReturnStage('chef-preview');
    handleFoodOrderPlaced([quickItem]);
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
    setMenuFocusItemId(null);
    setInteractiveMenuFocusId(null);
    setMenuReturnStage(null);
    setConfirmationReturnStage(null);
    setInteractiveMenuInitialTab('food');
    setChefPreviewCategory(null);
  };

  const selectedTable = currentRestaurant?.tables.find(t => t.id === selectedTableId);
  const promoFocus = currentRestaurant?.promos.find((promo) => promo.menuItemId);
  const promoFocusItemId = promoFocus?.menuItemId;
  const promoFocusTab: 'food' | 'drinks' = promoFocus?.menuCategory === 'drinks' ? 'drinks' : 'food';

  // Language selector (for demo purposes)
  const LanguageSelector = () => (
    <div className="fixed top-4 right-4 z-50">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm flex items-center gap-2"
      >
        <option value="en">🇬🇧 English (DEV TEST)</option>
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
        <p className="text-xs mb-2">Distance Demo — DEV MODE</p>
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
          onOrderFromPromo={handlePromoOrder}
          onViewMenu={handleOpenMenuPreview}
          onViewInteractiveMenu={(menuItemId, initialTab) =>
            handleOpenInteractiveMenu(menuItemId, 'restaurant-info', initialTab)
          }
          onViewChefPreview={handleOpenChefPreview}
        />
      )}
      {stage === 'menu-preview' && currentRestaurant && (
        <MenuPreview
          restaurant={currentRestaurant}
          language={language}
          focusItemId={menuFocusItemId ?? undefined}
          onClose={() => {
            setStage('restaurant-info');
            setMenuFocusItemId(null);
          }}
        />
      )}
      {stage === 'chef-preview' && currentRestaurant && (
        <ChefPreviewScreen
          restaurant={currentRestaurant}
          language={language}
          focusCategory={chefPreviewCategory ?? undefined}
          onClose={() => {
            setStage('restaurant-info');
            setChefPreviewCategory(null);
          }}
          onSelectItem={(itemId, tab) =>
            handleChefQuickAdd(itemId, tab)
          }
          onBrowseFullMenu={() => handleOpenInteractiveMenu(undefined, 'chef-preview')}
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
          estimatedWaitTime={waitSeconds ?? currentRestaurant.waitTime}
          onTableReady={handleTableReady}
          onOrderDrinks={handleOrderDrinks}
          onTimeUpdate={(seconds) => setWaitSeconds(seconds)}
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
      {stage === 'order-confirmation' && (
        <OrderConfirmationScreen
          language={language}
          onContinueOrdering={() => handleContinueOrdering(confirmationReturnStage)}
          onViewCurrentOrders={handleViewDining}
        />
      )}

      {stage === 'ordering-food' && currentRestaurant && (
        <MenuDisplay
          drinks={currentRestaurant.menu.drinks}
          food={currentRestaurant.menu.food}
          language={language}
          onPlaceOrder={handleFoodOrderPlaced}
          isDrinksOnly={false}
          focusItemId={interactiveMenuFocusId ?? undefined}
          initialTab={interactiveMenuInitialTab}
          onBack={() => {
            setInteractiveMenuFocusId(null);
            if (menuReturnStage) {
              setStage(menuReturnStage);
              setMenuReturnStage(null);
              return;
            }
            setStage('restaurant-info');
          }}
        />
      )}

      {stage === 'dining' && currentRestaurant && (
        <DiningScreen
          language={language}
          currentOrders={currentOrders}
          tableNumber={selectedTable?.number}
          onContinueOrdering={() => handleContinueOrdering('dining')}
          onFinalizeOrder={handleFinalizeOrder}
          onOpenPromoMenu={() => handleOpenInteractiveMenu(promoFocusItemId, 'dining', promoFocusTab)}
        />
      )}

      {stage === 'order-submit' && (
        <OrderSubmissionScreen
          language={language}
          onContinue={() => setStage('post-order-options')}
        />
      )}

      {stage === 'post-order-options' && (
        <PostOrderOptionsScreen
          language={language}
          onGoToMenu={() => {
            handleOpenInteractiveMenu(promoFocusItemId, 'post-order-options', promoFocusTab);
          }}
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
