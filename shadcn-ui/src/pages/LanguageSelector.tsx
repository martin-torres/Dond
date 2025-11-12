import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { languages } from '@/data/mockData';
import { useLanguage } from '@/hooks/useLanguage';
import { Language } from '@/lib/translations';

export default function LanguageSelector() {
  const navigate = useNavigate();
  const { changeLanguage, t } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleLanguageSelect = (langCode: string) => {
    setSelectedLanguage(langCode);
  };

  const handleContinue = () => {
    changeLanguage(selectedLanguage as Language);
    navigate('/restaurants');
  };

  // Get the continue button text based on selected language
  const getContinueText = (langCode: string) => {
    const continueTexts: Record<string, string> = {
      en: 'Continue',
      es: 'Continuar',
      fr: 'Continuer',
      de: 'Weiter',
      it: 'Continua',
      ja: '続行',
      ko: '계속',
      zh: '继续'
    };
    return continueTexts[langCode] || 'Continue';
  };

  // Get the title text based on selected language
  const getTitleText = (langCode: string) => {
    const titleTexts: Record<string, string> = {
      en: 'Select Your Language',
      es: 'Selecciona tu idioma',
      fr: 'Sélectionnez votre langue',
      de: 'Wählen Sie Ihre Sprache',
      it: 'Seleziona la tua lingua',
      ja: '言語を選択してください',
      ko: '언어를 선택하세요',
      zh: '选择您的语言'
    };
    return titleTexts[langCode] || 'Select Your Language';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🍽️</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            {getTitleText(selectedLanguage)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-2">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant={selectedLanguage === lang.code ? "default" : "outline"}
                className={`justify-start h-12 text-left transition-all ${
                  selectedLanguage === lang.code 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'hover:bg-blue-50'
                }`}
                onClick={() => handleLanguageSelect(lang.code)}
              >
                <span className="text-xl mr-3">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
              </Button>
            ))}
          </div>
          
          <Button 
            onClick={handleContinue}
            className="w-full mt-6 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
            disabled={!selectedLanguage}
          >
            {getContinueText(selectedLanguage)}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}