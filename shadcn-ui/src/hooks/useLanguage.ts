import { useState, useEffect } from 'react';

export const useLanguage = () => {
  const [language, setLanguage] = useState<string>(() => {
    const saved = localStorage.getItem('dinein-language');
    return saved || 'en';
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('dinein-language', language);
  }, [language]);

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  return {
    language,
    changeLanguage,
    isDropdownOpen,
    toggleDropdown,
    closeDropdown
  };
};