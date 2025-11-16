export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  waitTime: number;
  image: string;
  address: string;
  phone: string;
  hours: string;
  description: string;
  isOpen: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'appetizers' | 'mainCourses' | 'desserts' | 'beverages';
  image?: string;
}

export interface Table {
  id: string;
  capacity: number;
  isAvailable: boolean;
  location: string;
}

export const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Rupestre Bar Culinario',
    cuisine: 'Contemporary Mexican',
    rating: 4.8,
    waitTime: 25,
    image: '/api/placeholder/400/300',
    address: 'Av. Paseo de la Reforma 222, Juárez, 06600 Ciudad de México, CDMX, Mexico',
    phone: '+52 55 5207 8064',
    hours: 'Mon-Thu: 1:00 PM - 12:00 AM, Fri-Sat: 1:00 PM - 2:00 AM, Sun: 1:00 PM - 11:00 PM',
    description: 'Rupestre Bar Culinario offers an innovative culinary experience that blends traditional Mexican flavors with contemporary techniques. Located in the heart of Mexico City, our restaurant features a sophisticated atmosphere with cave-inspired design elements, creating a unique dining environment that celebrates Mexico\'s rich culinary heritage.',
    isOpen: true
  },
  {
    id: '2',
    name: 'The Garden Bistro',
    cuisine: 'Mediterranean',
    rating: 4.5,
    waitTime: 15,
    image: '/api/placeholder/400/300',
    address: '123 Oak Street, Downtown',
    phone: '+1 (555) 123-4567',
    hours: 'Mon-Sun: 11:00 AM - 10:00 PM',
    description: 'Fresh Mediterranean cuisine in a beautiful garden setting.',
    isOpen: true
  },
  {
    id: '3',
    name: 'Sakura Sushi',
    cuisine: 'Japanese',
    rating: 4.7,
    waitTime: 30,
    image: '/api/placeholder/400/300',
    address: '456 Pine Avenue, Midtown',
    phone: '+1 (555) 987-6543',
    hours: 'Tue-Sun: 5:00 PM - 11:00 PM',
    description: 'Authentic Japanese sushi and cuisine prepared by master chefs.',
    isOpen: true
  },
  {
    id: '4',
    name: 'Bella Italia',
    cuisine: 'Italian',
    rating: 4.3,
    waitTime: 20,
    image: '/api/placeholder/400/300',
    address: '789 Maple Drive, Little Italy',
    phone: '+1 (555) 456-7890',
    hours: 'Mon-Sun: 12:00 PM - 11:00 PM',
    description: 'Traditional Italian dishes made with imported ingredients.',
    isOpen: false
  }
];

export const mockMenuItems: Record<string, MenuItem[]> = {
  '1': [ // Rupestre Bar Culinario Menu
    {
      id: '1-1',
      name: 'Tuna Tostada Rupestre',
      description: 'Fresh tuna sashimi on crispy corn tostada with avocado mousse, chipotle mayo, and microgreens',
      price: 285,
      category: 'appetizers',
      image: '/api/placeholder/300/200'
    },
    {
      id: '1-2',
      name: 'Octopus Carpaccio',
      description: 'Thinly sliced octopus with citrus vinaigrette, capers, and red onion',
      price: 320,
      category: 'appetizers',
      image: '/api/placeholder/300/200'
    },
    {
      id: '1-3',
      name: 'Bone Marrow Tacos',
      description: 'Roasted bone marrow in corn tortillas with salsa verde and pickled onions',
      price: 245,
      category: 'appetizers',
      image: '/api/placeholder/300/200'
    },
    {
      id: '1-4',
      name: 'Duck Carnitas',
      description: 'Slow-cooked duck leg confit with mole negro, corn tortillas, and seasonal vegetables',
      price: 485,
      category: 'mainCourses',
      image: '/api/placeholder/300/200'
    },
    {
      id: '1-5',
      name: 'Ribeye Steak Rupestre',
      description: 'Grilled ribeye with chimichurri, roasted vegetables, and potato gratin',
      price: 650,
      category: 'mainCourses',
      image: '/api/placeholder/300/200'
    },
    {
      id: '1-6',
      name: 'Sea Bass Veracruzana',
      description: 'Pan-seared sea bass with tomato, olives, capers, and jalapeños',
      price: 420,
      category: 'mainCourses',
      image: '/api/placeholder/300/200'
    },
    {
      id: '1-7',
      name: 'Chocolate Lava Cake',
      description: 'Warm chocolate cake with liquid center, vanilla ice cream, and berry coulis',
      price: 165,
      category: 'desserts',
      image: '/api/placeholder/300/200'
    },
    {
      id: '1-8',
      name: 'Tres Leches Cake',
      description: 'Traditional Mexican three-milk cake with cinnamon and fresh berries',
      price: 145,
      category: 'desserts',
      image: '/api/placeholder/300/200'
    },
    {
      id: '1-9',
      name: 'Mezcal Old Fashioned',
      description: 'Premium mezcal with agave nectar, orange bitters, and smoked salt rim',
      price: 185,
      category: 'beverages',
      image: '/api/placeholder/300/200'
    },
    {
      id: '1-10',
      name: 'Rupestre Margarita',
      description: 'House special margarita with premium tequila, lime, and tajín rim',
      price: 165,
      category: 'beverages',
      image: '/api/placeholder/300/200'
    },
    {
      id: '1-11',
      name: 'Craft Beer Selection',
      description: 'Rotating selection of Mexican craft beers',
      price: 85,
      category: 'beverages',
      image: '/api/placeholder/300/200'
    }
  ],
  '2': [
    {
      id: '2-1',
      name: 'Mediterranean Mezze Platter',
      description: 'Hummus, olives, feta, and pita bread',
      price: 18,
      category: 'appetizers',
      image: '/api/placeholder/300/200'
    },
    {
      id: '2-2',
      name: 'Grilled Lamb Chops',
      description: 'Herb-crusted lamb with roasted vegetables',
      price: 32,
      category: 'mainCourses',
      image: '/api/placeholder/300/200'
    },
    {
      id: '2-3',
      name: 'Baklava',
      description: 'Traditional honey and nut pastry',
      price: 8,
      category: 'desserts',
      image: '/api/placeholder/300/200'
    },
    {
      id: '2-4',
      name: 'Greek Wine',
      description: 'Selection of Greek wines',
      price: 12,
      category: 'beverages',
      image: '/api/placeholder/300/200'
    }
  ],
  '3': [
    {
      id: '3-1',
      name: 'Sashimi Platter',
      description: 'Fresh assorted sashimi',
      price: 28,
      category: 'appetizers',
      image: '/api/placeholder/300/200'
    },
    {
      id: '3-2',
      name: 'Wagyu Beef Teriyaki',
      description: 'Premium wagyu with teriyaki glaze',
      price: 45,
      category: 'mainCourses',
      image: '/api/placeholder/300/200'
    },
    {
      id: '3-3',
      name: 'Mochi Ice Cream',
      description: 'Assorted flavors of mochi ice cream',
      price: 10,
      category: 'desserts',
      image: '/api/placeholder/300/200'
    },
    {
      id: '3-4',
      name: 'Sake Flight',
      description: 'Three premium sake varieties',
      price: 18,
      category: 'beverages',
      image: '/api/placeholder/300/200'
    }
  ],
  '4': [
    {
      id: '4-1',
      name: 'Bruschetta',
      description: 'Toasted bread with tomatoes and basil',
      price: 12,
      category: 'appetizers',
      image: '/api/placeholder/300/200'
    },
    {
      id: '4-2',
      name: 'Osso Buco',
      description: 'Braised veal shanks with risotto',
      price: 38,
      category: 'mainCourses',
      image: '/api/placeholder/300/200'
    },
    {
      id: '4-3',
      name: 'Tiramisu',
      description: 'Classic Italian dessert',
      price: 9,
      category: 'desserts',
      image: '/api/placeholder/300/200'
    },
    {
      id: '4-4',
      name: 'Chianti Classico',
      description: 'Premium Italian red wine',
      price: 15,
      category: 'beverages',
      image: '/api/placeholder/300/200'
    }
  ]
};

export const mockTables: Record<string, Table[]> = {
  '1': [
    { id: 't1-1', capacity: 2, isAvailable: true, location: 'Window' },
    { id: 't1-2', capacity: 4, isAvailable: true, location: 'Center' },
    { id: 't1-3', capacity: 6, isAvailable: false, location: 'Private' },
    { id: 't1-4', capacity: 2, isAvailable: true, location: 'Bar' },
    { id: 't1-5', capacity: 4, isAvailable: true, location: 'Patio' },
    { id: 't1-6', capacity: 8, isAvailable: true, location: 'Private Room' }
  ],
  '2': [
    { id: 't2-1', capacity: 2, isAvailable: true, location: 'Garden' },
    { id: 't2-2', capacity: 4, isAvailable: false, location: 'Terrace' },
    { id: 't2-3', capacity: 6, isAvailable: true, location: 'Indoor' }
  ],
  '3': [
    { id: 't3-1', capacity: 2, isAvailable: true, location: 'Sushi Bar' },
    { id: 't3-2', capacity: 4, isAvailable: true, location: 'Traditional' },
    { id: 't3-3', capacity: 6, isAvailable: false, location: 'Private' }
  ],
  '4': [
    { id: 't4-1', capacity: 2, isAvailable: true, location: 'Window' },
    { id: 't4-2', capacity: 4, isAvailable: true, location: 'Center' },
    { id: 't4-3', capacity: 6, isAvailable: true, location: 'Booth' }
  ]
};