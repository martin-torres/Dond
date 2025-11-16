export interface Restaurant {
  id: string;
  name: string;
  address: string;
  hours: {
    open: string;
    close: string;
  };
  waitTime: number; // in minutes
  distance: number; // in meters
  promos: Promo[];
  tables: Table[];
  menu: {
    food: MenuItem[];
    drinks: MenuItem[];
  };
}

export interface Promo {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  discount: number; // percentage
  imageUrl?: string; // optional image for visual appeal
}

export interface Table {
  id: string;
  number: number;
  seats: number;
  location: 'patio' | 'window' | 'balcony' | 'middle';
  available: boolean;
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