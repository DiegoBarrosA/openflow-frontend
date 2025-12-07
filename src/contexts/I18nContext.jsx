import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const I18nContext = createContext(null);

const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Español',
};

const DEFAULT_LANGUAGE = 'en';
const STORAGE_KEY = 'openflow-language';

/**
 * Get browser language preference.
 * @returns {string} Language code (en or es)
 */
function getBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  if (langCode === 'es') {
    return 'es';
  }
  
  return DEFAULT_LANGUAGE;
}

/**
 * Get initial language from localStorage or browser preference.
 * @returns {string} Language code
 */
function getInitialLanguage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && (stored === 'en' || stored === 'es')) {
    return stored;
  }
  
  return getBrowserLanguage();
}

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [translations, setTranslations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      try {
        const translationModule = await import(`../locales/${language}.json`);
        setTranslations(translationModule.default);
      } catch (error) {
        console.error(`Failed to load translations for ${language}:`, error);
        // Fallback to English if translation file is missing
        if (language !== DEFAULT_LANGUAGE) {
          const fallbackModule = await import(`../locales/${DEFAULT_LANGUAGE}.json`);
          setTranslations(fallbackModule.default);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

  /**
   * Change language and persist to localStorage.
   * @param {string} langCode - Language code (en or es)
   */
  const changeLanguage = useCallback((langCode) => {
    if (langCode === 'en' || langCode === 'es') {
      setLanguage(langCode);
      localStorage.setItem(STORAGE_KEY, langCode);
    }
  }, []);

  /**
   * Get translation for a key.
   * @param {string} key - Translation key (supports dot notation, e.g., 'common.login')
   * @param {object} params - Optional parameters for interpolation
   * @returns {string} Translated string or key if not found
   */
  const t = useCallback((key, params = {}) => {
    if (!translations) {
      return key;
    }

    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Simple parameter interpolation
    let result = value;
    Object.keys(params).forEach((paramKey) => {
      result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), params[paramKey]);
    });

    return result;
  }, [translations]);

  const value = {
    language,
    changeLanguage,
    t,
    isLoading,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Hook to access i18n context.
 * @returns {object} I18n context value
 */
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

/**
 * Hook for translations (shorthand for useI18n().t).
 * @returns {function} Translation function
 */
export function useTranslation() {
  const { t } = useI18n();
  return t;
}

export default I18nContext;

