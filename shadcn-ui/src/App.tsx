import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageSelector } from './components/LanguageSelector';
import { useLanguage } from './hooks/useLanguage';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import LanguagePage from './pages/LanguagePage';
import RestaurantList from './pages/RestaurantList';
import RestaurantDetails from './pages/RestaurantDetails';
import ReservationPage from './pages/ReservationPage';
import MenuPage from './pages/MenuPage';
import WaitlistPage from './pages/WaitlistPage';
import PaymentPage from './pages/PaymentPage';

function AppContent() {
  const { language, changeLanguage, isDropdownOpen, toggleDropdown, closeDropdown } = useLanguage();
  const location = useLocation();
  const isLanguagePage = location.pathname === '/';

  // Close dropdown when clicking outside or navigating
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.language-selector')) {
        closeDropdown();
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isDropdownOpen, closeDropdown]);

  useEffect(() => {
    closeDropdown();
  }, [location.pathname, closeDropdown]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Language Selector - Fixed in top right corner, hidden on language selection page */}
      {!isLanguagePage && (
        <div className="fixed top-4 right-4 z-50 language-selector">
          <LanguageSelector
            currentLanguage={language}
            onLanguageChange={changeLanguage}
            isDropdownOpen={isDropdownOpen}
            onToggleDropdown={toggleDropdown}
          />
        </div>
      )}

      <Routes>
        <Route path="/" element={<LanguagePage onLanguageSelect={changeLanguage} />} />
        <Route path="/restaurants" element={<RestaurantList language={language} />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails language={language} />} />
        <Route path="/reservation/:id" element={<ReservationPage language={language} />} />
        <Route path="/menu/:id" element={<MenuPage language={language} />} />
        <Route path="/waitlist/:id" element={<WaitlistPage language={language} />} />
        <Route path="/payment" element={<PaymentPage language={language} />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}

export default App;