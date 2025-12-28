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
import { OrderSummaryScreen } from './components/OrderSummaryScreen';
import { ChefPreviewScreen } from './components/ChefPreviewScreen';
import { BillPayment } from './components/BillPayment';
import { PaymentCompleteScreen } from './components/PaymentCompleteScreen';
import { ProximityWarning } from './components/ProximityWarning';
import { FloorPlanTestPage } from './components/FloorPlanTestPage';
import CreatorDashboard from './staff/CreatorDashboard';
import { supabase } from './lib/supabaseClient';
import { fetchRestaurantMenuItems } from './api/restaurantMenuApi';
import { fetchRestaurantTables } from './api/restaurantTablesApi';
import { fetchRestaurantPromos, fetchRestaurantEvents } from './api/promosEventsApi';
import { Button } from './components/ui/button';
import { Globe } from 'lucide-react';
import { MenuPreview } from './components/MenuPreview';
import { translateRestaurantMenu } from './utils/liveTranslations';
import { useStaffData } from './staff/StaffDataProvider';
import { createPaymentRecord, updatePaymentStatus } from './api/paymentsApi';
import { resolveRestaurantId, getRestaurant } from './api/restaurantsApi';

export default function App() {
  const SUPPORTED_LANGS: Language[] = ['en', 'es', 'fr', 'de', 'ja', 'ar', 'zh'];
  const normalizeLang = (value: string): Language =>
    SUPPORTED_LANGS.includes(value as Language) ? (value as Language) : 'es';

  const staff = useStaffData();

  // Check if we're on the test page
  const isTestPage = typeof window !== 'undefined' && window.location.pathname === '/test-floor-plan';

  // Check if we're accessing the admin dashboard
  const isAdminDashboard = typeof window !== 'undefined' &&
    (window.location.search.includes('admin=true') ||
     window.location.pathname === '/admin');

  // Detect phone language (simulated - in real app would use navigator.language)
  const [language, setLanguage] = useState<Language>('es');
  const [stage, setStage] = useState<AppStage>('qr-scan');
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [currentOrders, setCurrentOrders] = useState<OrderItem[]>([]);
  const [drinkOrders, setDrinkOrders] = useState<OrderItem[]>([]);
  const [proximityDistance, setProximityDistance] = useState(10); // meters from restaurant
  const [bill, setBill] = useState<Bill | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [waitSeconds, setWaitSeconds] = useState<number | null>(null);
  const [menuFocusItemId, setMenuFocusItemId] = useState<string | null>(null);
  const [interactiveMenuFocusId, setInteractiveMenuFocusId] = useState<string | null>(null);
  const [interactiveMenuInitialTab, setInteractiveMenuInitialTab] = useState<'food' | 'drinks'>('food');
  const [chefPreviewCategory, setChefPreviewCategory] = useState<'food' | 'drinks' | null>(null);
  const [menuReturnStage, setMenuReturnStage] = useState<AppStage | null>(null);
  const [pendingChefPreviewItems, setPendingChefPreviewItems] = useState<OrderItem[] | null>(null);
  const [pendingTableOrder, setPendingTableOrder] = useState<OrderItem[] | null>(null);
  const [deliveredItemIds, setDeliveredItemIds] = useState<Set<string>>(new Set());

  // Auto-detect language on mount (simulated)
  useEffect(() => {
    const browserLang = navigator.language.toLowerCase();
    let nextLang: Language = 'es';
    if (browserLang.startsWith('es')) nextLang = 'es';
    else if (browserLang.startsWith('fr')) nextLang = 'fr';
    else if (browserLang.startsWith('de')) nextLang = 'de';
    else if (browserLang.startsWith('ja')) nextLang = 'ja';
    else if (browserLang.startsWith('ar')) nextLang = 'ar';
    else if (browserLang.startsWith('zh')) nextLang = 'zh';
    setLanguage(normalizeLang(nextLang));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const translateCurrent = async () => {
      if (!currentRestaurant) return;
      const translated = await translateRestaurantMenu(currentRestaurant, language);
      if (cancelled) return;
      if (translated !== currentRestaurant) {
        setCurrentRestaurant(translated);
      }
    };
    translateCurrent();
    return () => {
      cancelled = true;
    };
  }, [currentRestaurant?.id, language]);

  // Listen for delivered items from Supabase so order lists reflect restaurant updates in real time.
  useEffect(() => {
    if (!selectedTableId || !currentRestaurant) return;
    const channel = supabase
      .channel('order-items-delivered')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'order_items',
          filter: `table_id=eq.${selectedTableId}`,
        },
        (payload) => {
          const status = (payload.new as any)?.status;
          const menuItemId = (payload.new as any)?.menu_item_id;
          if (status === 'delivered' && menuItemId) {
            setDeliveredItemIds((prev) => {
              const next = new Set(prev);
              next.add(menuItemId);
              return next;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTableId, currentRestaurant]);

  const appendOrders = (items: OrderItem[]) => {
    if (!items.length) return;
    setCurrentOrders((prev) => {
      const existingIds = new Set(prev.map((item) => item.menuItem.id));
      setDeliveredItemIds((deliveredPrev) => {
        const next = new Set(deliveredPrev);
        items.forEach((item) => {
          if (existingIds.has(item.menuItem.id)) {
            next.add(item.menuItem.id);
          }
        });
        return next;
      });
      return [...prev, ...items];
    });
  };
  
  const submitItemsToSupabase = async (items: OrderItem[], tableId: string) => {
    if (!currentRestaurant || items.length === 0) return;

    const tableNumber =
      currentRestaurant.tables!.find((t) => t.id === tableId)?.number ?? null;

    try {
      await staff.addCustomerOrder({
        items,
        meta: {
          restaurant: currentRestaurant,
          tableId,
          tableNumber,
          language,
        },
      });
      console.log('✅ Sent order to Supabase', { tableId, count: items.length });
    } catch (err) {
      console.error('❌ Failed to send order to Supabase', err);
    }
  };

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

  const fillLanguageRecord = (value: any): Record<Language, string> => {
    const base: Record<string, string> =
      value && typeof value === 'object' ? value : { en: String(value ?? '') };

    const pick = (lang: Language) => {
      const direct = base[lang];
      if (typeof direct === 'string' && direct.trim()) return direct;

      const en = base.en;
      if (typeof en === 'string' && en.trim()) return en;

      const firstKey = Object.keys(base)[0];
      if (firstKey && typeof base[firstKey] === 'string') return base[firstKey];

      return '';
    };

    return {
      en: pick('en'),
      es: pick('es'),
      fr: pick('fr'),
      de: pick('de'),
      ja: pick('ja'),
      ar: pick('ar'),
      zh: pick('zh'),
    };
  };

  // Ensures DB "location" string becomes one of your allowed UI values.
  const normalizeTableLocation = (
    value: any
  ): NonNullable<Restaurant['tables']>[number]['location'] => {
    const v = String(value ?? '').trim();
    if (
      v === 'patio' ||
      v === 'window' ||
      v === 'balcony' ||
      v === 'middle' ||
      v === 'secondFloor'
    )
      return v;
    return 'middle';
  };

  const handleQRScan = async (restaurantId: string) => {
    // Resolve restaurant identifier (slug) to UUID for database queries
    const resolvedRestaurantId = await resolveRestaurantId(restaurantId);
    if (!resolvedRestaurantId) {
      alert('Restaurant not found in database');
      return;
    }

    // Load menu, tables, promos, and events from Supabase using UUID
    const [menuRows, tableRows, promoRows, eventRows] = await Promise.all([
      fetchRestaurantMenuItems(resolvedRestaurantId),
      fetchRestaurantTables(resolvedRestaurantId),
      fetchRestaurantPromos(resolvedRestaurantId),
      fetchRestaurantEvents(resolvedRestaurantId),
    ]);

    if (menuRows.length === 0 && tableRows.length === 0) {
      alert('Restaurant not found or no data available in database');
      return;
    }

    // Only show tables that are visible to customers
    const tablesFromDb = tableRows
      .filter((t) => t.visible_to_customers === true)
      .map((t) => ({
        id: String(t.id),
        number: Number(t.table_number ?? 0),
        seats: Number(t.seats ?? 0),
        location: normalizeTableLocation(t.location),
        available: Boolean(t.available ?? true),
        reserved: false,
        x: Number(t.x ?? 0),
        y: Number(t.y ?? 0),
      }));

    // Convert DB menu rows into your UI MenuItem type
    const menuItemsFromDb: MenuItem[] = menuRows.map((r) => ({
      id: String(r.id),
      name: fillLanguageRecord(r.name),
      description: fillLanguageRecord(r.description ?? {}),
      price: Number(r.price ?? 0),
      category: String(r.category ?? ''),
      image: String(r.image_url ?? ''),
    }));

    // Split menu by kind
    const menuFood = menuRows
      .filter((r) => r.kind === 'food')
      .map((r) => menuItemsFromDb.find((i) => i.id === String(r.id))!)
      .filter(Boolean);

    const menuDrinks = menuRows
      .filter((r) => r.kind === 'drink')
      .map((r) => menuItemsFromDb.find((i) => i.id === String(r.id))!)
      .filter(Boolean);

    // Convert DB promo rows to UI Promo type
    const promosFromDb = promoRows.map((p) => ({
      id: String(p.id),
      title: fillLanguageRecord(p.title),
      description: fillLanguageRecord(p.description ?? {}),
      discount: Number(p.discount_percent ?? 0),
      discountType: (p.discount_percent > 0 ? 'percentage' : 'fixed') as 'percentage' | 'fixed',
      imageUrl: String(p.image_url ?? ''),
      menuItemId: p.menu_item_id ? String(p.menu_item_id) : undefined,
      menuCategory: (p.menu_category === 'food' || p.menu_category === 'drinks') ? p.menu_category as 'food' | 'drinks' : undefined,
      isActive: Boolean(p.is_active ?? true),
      startDate: p.start_date || new Date().toISOString().split('T')[0],
      endDate: p.end_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
    }));

    // Convert DB event rows to UI Event type
    const eventsFromDb = eventRows.map((e) => ({
      id: String(e.id),
      title: fillLanguageRecord(e.title),
      description: fillLanguageRecord(e.description ?? {}),
      imageUrl: String(e.image_url ?? ''),
      date: e.event_date,
      startTime: e.start_time,
      endTime: e.end_time,
      isActive: Boolean(e.is_active ?? true),
    }));

    // Get restaurant basic info from database
    const restaurantInfo = await getRestaurant(restaurantId);

    // Process name and address through fillLanguageRecord like other fields
    const localizedName = fillLanguageRecord(restaurantInfo?.name);
    const localizedAddress = fillLanguageRecord(restaurantInfo?.address);

    // Create complete restaurant object from DB data
    const dbName = localizedName[language] || localizedName['es'] || 'Restaurant';
    const dbAddress = localizedAddress[language] || localizedAddress['es'] || 'Address not available';
    const isFromDatabase = !!restaurantInfo;

    setCurrentRestaurant({
      id: resolvedRestaurantId,
      name: dbName,
      address: dbAddress,
      hours: restaurantInfo?.hours || { open: '9:00 AM', close: '10:00 PM' },
      waitTime: restaurantInfo?.waitTime || 30,
      distance: restaurantInfo?.distance || 0,
      promos: promosFromDb,
      events: eventsFromDb, // Add events to restaurant object
      tables: tablesFromDb,
      menu: {
        food: menuFood,
        drinks: menuDrinks,
      },
    });

    // Log what data came from database vs fallbacks
    console.log('🍽️ Restaurant data loaded:', {
      fromDatabase: !!restaurantInfo,
      name: dbName,
      address: dbAddress,
      waitTime: restaurantInfo?.waitTime,
      distance: restaurantInfo?.distance
    });

    // Reset flow state (same behavior as before)
    setStage('restaurant-info');
    setSelectedTableId(null);
    setWaitSeconds(30);
    setMenuFocusItemId(null);
    setInteractiveMenuFocusId(null);
    setMenuReturnStage(null);
    setInteractiveMenuInitialTab('food');
    setChefPreviewCategory(null);
    setPendingTableOrder(null);
    setDeliveredItemIds(new Set());
  };

  const handleTableSelection = (tableId: string | null) => {
    setSelectedTableId(tableId);
    if (tableId && currentRestaurant) {
      const table = currentRestaurant.tables!.find(t => t.id === tableId);
      if (table) {
        setWaitSeconds(currentRestaurant.waitTime);
      }
    } else {
      setWaitSeconds(currentRestaurant ? currentRestaurant.waitTime : null);
    }
    const stagedItems: OrderItem[] = [];
    if (pendingChefPreviewItems && pendingChefPreviewItems.length > 0) {
      stagedItems.push(...pendingChefPreviewItems);
      setPendingChefPreviewItems(null);
    }
    if (pendingTableOrder && pendingTableOrder.length > 0) {
      stagedItems.push(...pendingTableOrder);
      setPendingTableOrder(null);
    }
    if (stagedItems.length > 0) {
      appendOrders(stagedItems);
      if (tableId) {
        void submitItemsToSupabase(stagedItems, tableId);
      }
    }
    setStage('waiting');
  };

  const handleOrderDrinks = () => {
    setStage('ordering-drinks');
  };

  const handleDrinkOrderPlaced = (items: OrderItem[]) => {
    console.log('🍹 handleDrinkOrderPlaced fired', items);
    setDrinkOrders(items);
    appendOrders(items);

    if (selectedTableId && items.length > 0) {
      void submitItemsToSupabase(items, selectedTableId);
    }

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
      ...currentRestaurant.menu!.drinks,
      ...currentRestaurant.menu!.food,
    ];

    const menuItem = allMenuItems.find((item) => item.id === menuItemId);
    if (!menuItem) return;

    const newOrderItem: OrderItem = {
      menuItem,
      quantity: 1,
    };

    appendOrders([newOrderItem]);

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
    setInteractiveMenuInitialTab('food');
    setChefPreviewCategory(null);
    setPendingTableOrder(null);
    setDeliveredItemIds(new Set());
  };

  const handleFoodOrderPlaced = (items: OrderItem[]) => {
    console.log('🍽️ handleFoodOrderPlaced fired', items);
    const nextStage = 'order-summary';

    if (!selectedTableId && items.length > 0) {
      setPendingTableOrder(items);
      setStage('table-selection');
      return;
    }

    appendOrders(items);

    if (selectedTableId && items.length > 0) {
      void submitItemsToSupabase(items, selectedTableId);
    }

    setInteractiveMenuFocusId(null);
    setMenuReturnStage(null);
    setStage(nextStage);
  };

  const handleContinueOrdering = (returnStage?: AppStage | null) => {
    handleOpenInteractiveMenu(undefined, returnStage ?? null);
  };

  const handleViewDining = () => {
    if (currentOrders.length > 0) {
      setStage('dining');
    } else {
      setStage('waiting');
    }
  };

  const handleFinalizeOrder = () => {
    console.log('➡️ handleFinalizeOrder fired; going to order-submit');
    setStage('order-submit');
  };

  const handleSubmitOrder = async () => {
    console.log('🧾 handleSubmitOrder START', {
      hasRestaurant: !!currentRestaurant,
      selectedTableId,
      currentOrdersLen: currentOrders.length,
      stage,
    });

    // If we are missing basic info, just go back to the summary for now
    if (!currentRestaurant || currentOrders.length === 0) {
      console.log('🛑 handleSubmitOrder early-exit (missing restaurant or empty orders)');
      setStage('order-summary');
      return;
    }

    const tableNumber =
      selectedTableId
        ? currentRestaurant.tables!.find((t) => t.id === selectedTableId)?.number ?? null
        : null;

    try {
      console.log('📤 calling staff.addCustomerOrder');
      await staff.addCustomerOrder({
        items: currentOrders,
        meta: {
          restaurant: currentRestaurant,
          tableId: selectedTableId ?? null,
          tableNumber,
          language,
        },
      });
      console.log('✅ staff.addCustomerOrder done');
    } catch (err) {
      console.error('❌ Unexpected error saving order to Supabase:', err);
    } finally {
      // No matter what happens, show the order summary screen
      setStage('order-summary');
    }
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

  const handleChefPreviewReserve = (items: OrderItem[]) => {
    if (!items.length) return;
    setPendingChefPreviewItems(items);
    setChefPreviewCategory(null);
    setStage('table-selection');
  };

  const handleRequestBill = () => {
    const subtotal = currentOrders.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
    const tax = subtotal * 0.089999;
    const tip = subtotal * 0.15;
    setDeliveredItemIds((prev) => {
      const next = new Set(prev);
      currentOrders.forEach((item) => next.add(item.menuItem.id));
      return next;
    });
    
    setBill({
      items: currentOrders,
      subtotal,
      tax,
      tip,
      total: subtotal + tax + tip,
      payments: payments,
    });
    setStage('payment');
  };

  const handlePaymentComplete = (paidAmount?: number, paidItems?: string[]) => {
    const orderReference = selectedTableId ?? 'local-order';
    if (paidAmount !== undefined) {
      // Stubbed payment recording to keep flow integration-friendly.
      createPaymentRecord({
        orderId: orderReference,
        amount: paidAmount,
        currency: 'USD',
        metadata: {
          items: (paidItems ?? []).join(','),
          restaurantId: currentRestaurant?.id ?? 'unknown',
        },
      }).then((record) => updatePaymentStatus(record.id, 'PAID'));
    }
    // Reset to initial state
    setStage('qr-scan');
    setCurrentRestaurant(null);
    setSelectedTableId(null);
    setCurrentOrders([]);
    setDrinkOrders([]);
    setBill(null);
    setPayments([]);
    setMenuFocusItemId(null);
    setInteractiveMenuFocusId(null);
    setMenuReturnStage(null);
    setInteractiveMenuInitialTab('food');
    setChefPreviewCategory(null);
    setPendingTableOrder(null);
    setDeliveredItemIds(new Set());
  };

  const selectedTable = currentRestaurant?.tables!.find(t => t.id === selectedTableId);
  const promoFocus = currentRestaurant?.promos!.find((promo) => promo.menuItemId);
  const promoFocusItemId = promoFocus?.menuItemId;
  const promoFocusTab: 'food' | 'drinks' = promoFocus?.menuCategory === 'drinks' ? 'drinks' : 'food';

  // Language selector (for demo purposes)
  const LanguageSelector = () => (
    <div className="fixed top-4 right-4 z-50">
      <select
        value={language}
        onChange={(e) => setLanguage(normalizeLang(e.target.value))}
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

  // Removed SimulateTerminalPayment - no more mock payments

  // Render test page if on test route
  if (isTestPage) {
    return <FloorPlanTestPage />;
  }

  return (
    <div className="min-h-screen">
      <LanguageSelector />
      
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
          onReserveTable={handleChefPreviewReserve}
          onBrowseFullMenu={(initialTab) =>
            handleOpenInteractiveMenu(undefined, 'chef-preview', initialTab ?? 'food')
          }
          onSelectTable={() => setStage('table-selection')}
        />
      )}

      {stage === 'table-selection' && currentRestaurant && (
        <TableSelector
          tables={currentRestaurant.tables!}
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
          distance={drinkOrders.length > 0 ? proximityDistance : undefined}
          onDistanceChange={
            drinkOrders.length > 0 ? (distance) => setProximityDistance(distance) : undefined
          }
          onBack={() => setStage('table-selection')}
        />
      )}

      {stage === 'ordering-drinks' && currentRestaurant && (
        <MenuDisplay
          drinks={currentRestaurant.menu!.drinks}
          food={currentRestaurant.menu!.food}
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
          drinks={currentRestaurant.menu!.drinks}
          food={currentRestaurant.menu!.food}
          language={language}
          onPlaceOrder={handleFoodOrderPlaced}
          isDrinksOnly={false}
          focusItemId={interactiveMenuFocusId ?? undefined}
          initialTab={interactiveMenuInitialTab}
          onNext={
            !selectedTableId
              ? () => setStage('table-selection')
              : () => handleFoodOrderPlaced([])
          }
          onBack={() => {
            setInteractiveMenuFocusId(null);
            if (menuReturnStage) {
              setStage(menuReturnStage);
              setMenuReturnStage(null);
              return;
            }
            setStage('restaurant-info');
          }}
          showSeatPrompt={!selectedTableId}
          onChooseSeat={() => setStage('table-selection')}
        />
      )}

      {stage === 'dining' && currentRestaurant && (
        <DiningScreen
          language={language}
          currentOrders={currentOrders}
          tableNumber={selectedTable?.number}
          deliveredIds={deliveredItemIds}
          onContinueOrdering={() => handleContinueOrdering('dining')}
          onFinalizeOrder={handleFinalizeOrder}
          onOpenPromoMenu={() => handleOpenInteractiveMenu(promoFocusItemId, 'dining', promoFocusTab)}
        />
      )}

      {stage === 'order-submit' && (
        <OrderSubmissionScreen
          language={language}
          onContinue={handleSubmitOrder}
        />
      )}
      {stage === 'order-summary' && currentRestaurant && (
        <OrderSummaryScreen
          language={language}
          tableNumber={selectedTable?.number}
          items={currentOrders}
          deliveredIds={deliveredItemIds}
          onContinueOrdering={() => handleContinueOrdering('order-summary')}
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

      {/* Admin Dashboard */}
      {isAdminDashboard && <CreatorDashboard />}
    </div>
  );
}
