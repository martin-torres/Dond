export type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ar' | 'zh';

export type AppStage = 
  | 'qr-scan' 
  | 'restaurant-info' 
  | 'table-selection' 
  | 'waiting' 
  | 'ordering-drinks'
  | 'table-ready'
  | 'ordering-desserts'
  | 'ordering-food' 
  | 'dining' 
  | 'payment'
  | 'payment-complete';

export interface MultiLangText {
  [key: string]: string;
}

export interface MenuItem {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  price: number;
  category: string;
  image: string;
}

export interface Table {
  id: string;
  number: number;
  seats: number;
  location: 'patio' | 'window' | 'balcony' | 'middle';
  available: boolean;
  reserved?: boolean;
  x: number;
  y: number;
}

export interface Promotion {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  discount: number;
  imageUrl?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  hours: {
    open: string;
    close: string;
  };
  waitTime: number;
  distance: number;
  promos: Promotion[];
  tables: Table[];
  menu: {
    drinks: MenuItem[];
    food: MenuItem[];
  };
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Payment {
  userId: string;
  userName: string;
  amount: number;
  paidAt: Date;
}

export interface Bill {
  items: OrderItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  payments: Payment[];
}