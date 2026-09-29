'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'mala-link-language';

const LanguageContext = createContext({
  lang: 'en',
  toggleLang: () => {},
});

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  // Whether the initial read from localStorage has finished. This has to be
  // state, not a ref — the save-effect below reads it from its own render's
  // closure, and only a state value (not a ref mutated mid-effect) reliably
  // reflects "has this render's data caught up yet?".
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Load the saved language once, when the app starts.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'ny') {
        setLang(saved);
      }
    } catch {
      // localStorage unavailable (private browsing, storage disabled, etc.)
      // — just keep the 'en' default already in state.
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 2. Persist the language whenever it changes — but only once step 1 has
  //    finished. Without the isLoaded check, this effect also fires on the
  //    very first mount with the initial 'en' value, overwriting whatever
  //    was saved before step 1 gets a chance to read it.
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore — nothing useful to do if storage isn't available.
    }
  }, [lang, isLoaded]);

  // Keep <html lang="..."> in sync too — free accessibility/SEO win, and
  // lets browser features (spellcheck, screen readers, translate prompts)
  // pick up the right language automatically.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => {
    setLang((current) => (current === 'en' ? 'ny' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);