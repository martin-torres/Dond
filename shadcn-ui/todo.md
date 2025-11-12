# Restaurant Dining App - Development Plan

## Core Features to Implement:
1. **Language Selection Screen** - Initial screen with language picker
2. **Location & Restaurant Discovery** - Find restaurants nearby or by location
3. **Restaurant Details** - Wait times, table layout, availability
4. **Reservation System** - Book tables with interactive layout
5. **Bar Tab Feature** - Order drinks while waiting
6. **Menu Ordering** - Multi-language menu with ordering
7. **Payment & Split Bill** - Payment processing with tip and bill splitting

## Files to Create/Modify:

### Core App Structure
- `src/App.tsx` - Main app with routing (MODIFY)
- `src/pages/Index.tsx` - Landing page redirect (MODIFY)
- `index.html` - Update title and meta (MODIFY)

### New Pages
- `src/pages/LanguageSelector.tsx` - Language selection screen
- `src/pages/RestaurantList.tsx` - Restaurant discovery and list
- `src/pages/RestaurantDetails.tsx` - Restaurant info, wait times, layout
- `src/pages/Reservation.tsx` - Table booking interface
- `src/pages/BarTab.tsx` - Pre-seating drink orders
- `src/pages/Menu.tsx` - Restaurant menu with ordering
- `src/pages/Payment.tsx` - Bill splitting and payment

### Components
- `src/components/RestaurantCard.tsx` - Restaurant list item
- `src/components/TableLayout.tsx` - Interactive table map
- `src/components/MenuCategory.tsx` - Menu section component
- `src/components/OrderSummary.tsx` - Current order display
- `src/components/LocationPicker.tsx` - Location selection
- `src/components/LanguagePicker.tsx` - Language selection component

### Data & Utils
- `src/data/mockData.ts` - Sample restaurants, menus, translations
- `src/hooks/useLocation.ts` - Location services hook
- `src/hooks/useLanguage.ts` - Language management hook
- `src/lib/translations.ts` - Translation utilities

## Implementation Priority:
1. Language selector and basic routing
2. Restaurant list with mock data
3. Restaurant details and table layout
4. Basic menu ordering
5. Payment and bill splitting features
6. Bar tab functionality
7. Polish and responsive design

## Tech Stack:
- React + TypeScript
- Shadcn/UI components
- React Router for navigation
- Local storage for state management
- Mock data for restaurants and menus