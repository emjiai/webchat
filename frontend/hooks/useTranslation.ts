import { useState, useEffect } from 'react';
import { Language } from '@/types';
import { getTranslation, TranslationStrings } from '@/lib/i18n/translations';

export function useTranslation(initialLanguage: Language = 'en') {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [translations, setTranslations] = useState<TranslationStrings>(
    getTranslation(initialLanguage)
  );

  useEffect(() => {
    setTranslations(getTranslation(language));
  }, [language]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations;
    
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    return result;
  };

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', newLanguage);
    }
  };

  return {
    language,
    t,
    translations,
    changeLanguage,
  };
}