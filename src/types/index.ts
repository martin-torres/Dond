export interface Restaurant {
  id: string;
  slug?: string; // Optional for hybrid slug + UUID support
  name: string;
  address: string;
  hours: {
    open: string;
    close: string;
  };
  waitTime: number; // in minutes
  distance: number; // in meters
  promos?: Promo[]; // Optional for database-only restaurants
  events?: Event[]; // Optional for database-only restaurants
  tables?: Table[]; // Optional for database-only restaurants
  menu?: {
    food: MenuItem[];
    drinks: MenuItem[];
  }; // Optional for database-only restaurants
  createdAt?: string;
  updatedAt?: string;
}

export interface Promo {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  discount: number; // percentage
  imageUrl?: string; // optional image for visual appeal
  menuItemId?: string; // optional menu item to jump to
  menuCategory?: 'food' | 'drinks';
}

export interface Event {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  imageUrl?: string;
  date: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface Table {
  id: string;
  number: number;
  label?: string; // Display label like "Table 21" or custom name
  seats: number;
  location: 'patio' | 'window' | 'balcony' | 'middle' | 'secondFloor';
  // REMOVED: available - now derived from orders + payment status (canonical)
  reserved?: boolean; // indicates if table is reserved but not yet occupied
  x: number; // position for visual layout
  y: number;
}

export interface MenuItem {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  price: number;
  category: string;
  image: string;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  orderedBy?: string; // user ID for bill splitting
}

export interface Bill {
  items: OrderItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  payments: Payment[];
  // CANONICAL: Payment completeness from order_payment_status view
  orderPaymentStatus?: {
    orderId: string;
    totalDue: number;
    totalPaid: number;
    isPaymentComplete: boolean;
    remainingDue: number;
  }[];
}

export interface Payment {
  userId: string;
  userName: string;
  amount: number;
  paidAt: Date;
  items?: string[]; // item IDs if splitting by items
}

export type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ar' | 'zh';

export type AppStage = 
  | 'qr-scan'
  | 'restaurant-info'
  | 'table-selection'
  | 'waiting'
  | 'chef-preview'
  | 'menu-preview'
  | 'order-summary'
  | 'order-submit'
  | 'ordering-drinks'
  | 'table-ready'
  | 'ordering-food'
  | 'dining'
  | 'payment';

export interface UserSession {
  userId: string;
  userName: string;
  restaurantId: string;
  tableId: string | null;
  language: Language;
  proximityToRestaurant: number; // in meters
  stage: AppStage;
}
