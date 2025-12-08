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
    <div className="flex items-center justify-between w-full">
      <label htmlFor="language-select" className="text-sm font-medium text-base-05 flex items-center gap-2">
        <i className="fas fa-language" aria-hidden="true"></i>
        {t('language.switch')}
      </label>
      <select
        id="language-select"
        value={language}
        onChange={handleLanguageChange}
        className="bg-base-01 dark:bg-base-02 border border-base-02 dark:border-base-03 rounded-md px-3 py-1.5 text-sm text-base-05 focus:outline-none focus:ring-2 focus:ring-base-0D cursor-pointer"
        aria-label={t('language.switch')}
      >
        <option value="en">{supportedLanguages.en}</option>
        <option value="es">{supportedLanguages.es}</option>
      </select>
    </div>
  );
}

export default LanguageSwitcher;

