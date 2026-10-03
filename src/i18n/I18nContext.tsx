import React, { createContext, useContext, useEffect, useState } from 'react';
import enTranslations from './en.json';
import heTranslations from './he.json';

export type Language = 'en' | 'he';
export type Direction = 'ltr' | 'rtl';

interface I18nContextType {
  language: Language;
  direction: Direction;
  isRtl: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
}

const STORAGE_KEY = 'velvet_language_preference';

const translations: Record<Language, any> = {
  en: enTranslations,
  he: heTranslations,
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'he' || saved === 'en') return saved;
      // Default to browser language if hebrew, else english
      if (typeof navigator !== 'undefined' && navigator.language?.startsWith('he')) {
        return 'he';
      }
    } catch (e) {
      console.warn('Could not read language from localStorage:', e);
    }
    return 'en';
  });

  const direction: Direction = language === 'he' ? 'rtl' : 'ltr';
  const isRtl = direction === 'rtl';

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch (e) {
      console.warn('Could not save language to localStorage:', e);
    }

    if (typeof document !== 'undefined') {
      document.documentElement.dir = direction;
      document.documentElement.lang = language;
      if (isRtl) {
        document.documentElement.classList.add('rtl');
      } else {
        document.documentElement.classList.remove('rtl');
      }
    }
  }, [language, direction, isRtl]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'he' : 'en'));
  };

  const t = (key: string, variables?: Record<string, string | number>): string => {
    const keys = key.split('.');
    
    // Lookup in active language dictionary
    let value = translations[language];
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        value = undefined;
        break;
      }
    }

    // Fallback to English dictionary if missing in active language
    if (value === undefined || typeof value !== 'string') {
      let fallbackValue = translations.en;
      for (const k of keys) {
        if (fallbackValue && typeof fallbackValue === 'object' && k in fallbackValue) {
          fallbackValue = fallbackValue[k];
        } else {
          fallbackValue = undefined;
          break;
        }
      }
      value = fallbackValue;
    }

    if (typeof value !== 'string') {
      return key; // return key as fallback
    }

    // Replace template variables like {name}
    if (variables) {
      return Object.entries(variables).reduce((str, [varKey, varVal]) => {
        return str.replace(new RegExp(`\\{${varKey}\\}`, 'g'), String(varVal));
      }, value);
    }

    return value;
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        direction,
        isRtl,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
