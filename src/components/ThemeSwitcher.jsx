import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../contexts/I18nContext';

function ThemeSwitcher() {
  const { theme, toggleTheme, isDark } = useTheme();
  const t = useTranslation();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark transition-colors"
      aria-label={t('theme.toggleTheme')}
      title={t('theme.toggleTheme')}
    >
      {isDark() ? (
        <i className="fas fa-sun text-xl" aria-hidden="true"></i>
      ) : (
        <i className="fas fa-moon text-xl" aria-hidden="true"></i>
      )}
    </button>
  );
}

export default ThemeSwitcher;

