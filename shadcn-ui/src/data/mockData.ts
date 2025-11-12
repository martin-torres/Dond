export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  priceRange: string;
  distance: number;
  waitTime: number;
  image: string;
  address: string;
  phone: string;
  tables: Table[];
  menu: MenuCategory[];
}

export interface Table {
  id: string;
  number: number;
  seats: number;
  x: number;
  y: number;
  width: number;
  height: number;
  isAvailable: boolean;
  reservedAt?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  allergens?: string[];
  spicyLevel?: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed';
  tableNumber?: number;
  isBarOrder?: boolean;
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
  price: number;
}

export const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Bella Vista Italian',
    cuisine: 'Italian',
    rating: 4.5,
    priceRange: '$$',
    distance: 0.3,
    waitTime: 15,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
    address: '123 Main St, Downtown',
    phone: '(555) 123-4567',
    tables: [
      { id: 't1', number: 1, seats: 2, x: 50, y: 50, width: 60, height: 60, isAvailable: true },
      { id: 't2', number: 2, seats: 4, x: 150, y: 50, width: 80, height: 80, isAvailable: false, reservedAt: '7:30 PM' },
      { id: 't3', number: 3, seats: 6, x: 50, y: 150, width: 100, height: 80, isAvailable: true },
      { id: 't4', number: 4, seats: 2, x: 200, y: 150, width: 60, height: 60, isAvailable: true },
    ],
    menu: [
      {
        id: 'appetizers',
        name: 'Appetizers',
        items: [
          {
            id: 'bruschetta',
            name: 'Bruschetta',
            description: 'Toasted bread with tomatoes, basil, and garlic',
            price: 12.99,
            image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=300'
          },
          {
            id: 'calamari',
            name: 'Fried Calamari',
            description: 'Crispy squid rings with marinara sauce',
            price: 15.99
          }
        ]
      },
      {
        id: 'mains',
        name: 'Main Courses',
        items: [
          {
            id: 'margherita',
            name: 'Margherita Pizza',
            description: 'Fresh mozzarella, tomato sauce, and basil',
            price: 18.99,
            image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300'
          },
          {
            id: 'carbonara',
            name: 'Spaghetti Carbonara',
            description: 'Pasta with eggs, cheese, pancetta, and black pepper',
            price: 22.99
          }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Sakura Sushi',
    cuisine: 'Japanese',
    rating: 4.8,
    priceRange: '$$$',
    distance: 0.7,
    waitTime: 25,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
    address: '456 Oak Ave, Midtown',
    phone: '(555) 987-6543',
    tables: [
      { id: 't1', number: 1, seats: 2, x: 40, y: 40, width: 60, height: 60, isAvailable: true },
      { id: 't2', number: 2, seats: 2, x: 140, y: 40, width: 60, height: 60, isAvailable: true },
      { id: 't3', number: 3, seats: 4, x: 40, y: 120, width: 80, height: 80, isAvailable: false, reservedAt: '8:00 PM' },
      { id: 't4', number: 4, seats: 6, x: 160, y: 120, width: 100, height: 80, isAvailable: true },
    ],
    menu: [
      {
        id: 'sushi',
        name: 'Sushi & Sashimi',
        items: [
          {
            id: 'salmon-roll',
            name: 'Salmon Roll',
            description: 'Fresh salmon with avocado and cucumber',
            price: 14.99,
            image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300'
          },
          {
            id: 'tuna-sashimi',
            name: 'Tuna Sashimi',
            description: 'Fresh tuna slices, 6 pieces',
            price: 18.99
          }
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'The Steakhouse',
    cuisine: 'American',
    rating: 4.3,
    priceRange: '$$$$',
    distance: 1.2,
    waitTime: 45,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
    address: '789 Elm St, Uptown',
    phone: '(555) 456-7890',
    tables: [
      { id: 't1', number: 1, seats: 2, x: 60, y: 60, width: 60, height: 60, isAvailable: false, reservedAt: '7:00 PM' },
      { id: 't2', number: 2, seats: 4, x: 160, y: 60, width: 80, height: 80, isAvailable: true },
      { id: 't3', number: 3, seats: 8, x: 60, y: 160, width: 120, height: 100, isAvailable: true },
    ],
    menu: [
      {
        id: 'steaks',
        name: 'Premium Steaks',
        items: [
          {
            id: 'ribeye',
            name: 'Ribeye Steak',
            description: '12oz prime ribeye with garlic butter',
            price: 45.99,
            image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300'
          },
          {
            id: 'filet',
            name: 'Filet Mignon',
            description: '8oz tender filet with herb crust',
            price: 52.99
          }
        ]
      }
    ]
  }
];

export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
];