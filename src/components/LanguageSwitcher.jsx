import React from 'react';
import { useI18n } from '../contexts/I18nContext';
import { useTranslation } from '../contexts/I18nContext';

function LanguageSwitcher() {
  const { language, changeLanguage, supportedLanguages } = useI18n();
  const t = useTranslation();

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    if (newLanguage === 'en' || newLanguage === 'es') {
      changeLanguage(newLanguage);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language-select" className="sr-only">
        {t('language.switch')}
      </label>
      <select
        id="language-select"
        value={language}
        onChange={handleLanguageChange}
        className="bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark cursor-pointer"
        aria-label={t('language.switch')}
      >
        <option value="en">{supportedLanguages.en}</option>
        <option value="es">{supportedLanguages.es}</option>
      </select>
    </div>
  );
}

export default LanguageSwitcher;

