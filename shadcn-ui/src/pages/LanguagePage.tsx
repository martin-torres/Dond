import React from 'react';
import { useNavigate } from 'react-router-dom';
import { languages, useTranslation } from '../lib/translations';

interface LanguagePageProps {
  onLanguageSelect: (language: string) => void;
}

const LanguagePage: React.FC<LanguagePageProps> = ({ onLanguageSelect }) => {
  const navigate = useNavigate();
  const t = useTranslation('en'); // Default to English for initial page

  const handleLanguageSelect = (languageCode: string) => {
    onLanguageSelect(languageCode);
    navigate('/restaurants');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t.welcome}</h1>
          <p className="text-gray-600">{t.chooseLanguage}</p>
        </div>
        
        <div className="space-y-3">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              className="w-full flex items-center space-x-4 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
            >
              <span className="text-2xl">{language.flag}</span>
              <span className="text-lg font-medium text-gray-800 group-hover:text-blue-600">
                {language.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguagePage;