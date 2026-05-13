import translations from '@/translations/index,js';
import { useLanguage } from '@/context/LanguageContext';

export function useTranslation() {
  const { lang, toggleLang } = useLanguage();

  // t('nav.dashboard') → returns the right language string
  const t = (key) => {
    const entry = translations[key];
    if (!entry) {
      // Key missing — show the key itself so you notice it
      console.warn(`[i18n] Missing key: "${key}"`);
      return key;
    }
    return entry[lang] || entry['en'];
  };

  return { t, lang, toggleLang };
}