import { useState, useEffect } from 'react';
import { Language, getTranslation, TranslationKey } from '@/lib/translations';

export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('selectedLanguage') as Language;
      if (savedLanguage && ['en', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh'].includes(savedLanguage)) {
        setCurrentLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language from localStorage:', error);
      setCurrentLanguage('en');
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    try {
      setCurrentLanguage(lang);
      localStorage.setItem('selectedLanguage', lang);
    } catch (error) {
      console.error('Error saving language to localStorage:', error);
    }
  };

  const t = (key: TranslationKey): string => {
    try {
      return getTranslation(currentLanguage, key);
    } catch (error) {
      console.error('Translation error:', error);
      return key;
    }
  };

  return {
    currentLanguage,
    changeLanguage,
    t
  };
};