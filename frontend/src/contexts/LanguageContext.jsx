import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { tr } from '../i18n/translations';

const LANG_KEY = 'selected_lang';

export const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem(LANG_KEY) || 'en';
  });

  const setLang = useCallback((newLang) => {
    const validLang = newLang === 'ta' ? 'ta' : 'en';
    localStorage.setItem(LANG_KEY, validLang);
    setLangState(validLang);
  }, []);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === LANG_KEY && e.newValue && (e.newValue === 'en' || e.newValue === 'ta')) {
        setLangState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const t = useCallback((key) => tr(lang, key), [lang]);

  const value = { lang, setLang, t };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider');
  return ctx;
}

