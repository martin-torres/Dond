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
  | 'payment'
  | 'payment-complete';

export interface MenuItem {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  price: number;
  category: 'food' | 'drinks' | 'appetizers' | 'mains' | 'desserts';
  image: string;
  available: boolean;
  allergens?: string[];
}

export interface Table {
  id: string;
  number: number;
  seats: number;
  location: 'patio' | 'window' | 'balcony' | 'middle';
  available: boolean;
  reserved: boolean;
  x: number; // percentage position for visual layout
  y: number; // percentage position for visual layout
}

export interface Restaurant {
  id: string;
  name: string;
  description: Record<Language, string>;
  image: string;
  address: string;
  phone: string;
  waitTime: number; // minutes
  tables: Table[];
  menu: {
    food: MenuItem[];
    drinks: MenuItem[];
  };
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export interface Payment {
  userId: string;
  userName: string;
  amount: number;
  paidAt: Date;
  paymentMethod?: 'card' | 'cash' | 'digital';
}

export interface Bill {
  items: OrderItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  payments: Payment[];
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  preferredLanguage: Language;
}

export interface Session {
  id: string;
  restaurantId: string;
  tableId?: string;
  userId: string;
  orders: OrderItem[];
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}