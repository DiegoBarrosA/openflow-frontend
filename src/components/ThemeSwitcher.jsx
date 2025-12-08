import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../contexts/I18nContext';

function ThemeSwitcher({ inMenu = false }) {
  const { theme, toggleTheme, isDark } = useTheme();
  const t = useTranslation();

  if (inMenu) {
    return (
      <button
        onClick={toggleTheme}
        className="w-full flex items-center justify-between p-2 rounded-md text-base-05 hover:bg-base-01 dark:hover:bg-base-02 focus:outline-none focus:ring-2 focus:ring-base-0D transition-colors"
        aria-label={t('theme.toggleTheme')}
        title={t('theme.toggleTheme')}
      >
        <span className="text-sm font-medium flex items-center gap-2">
          <i className="fas fa-palette" aria-hidden="true"></i>
          {t('theme.toggleTheme')}
        </span>
        {isDark() ? (
          <i className="fas fa-sun text-lg" aria-hidden="true"></i>
        ) : (
          <i className="fas fa-moon text-lg" aria-hidden="true"></i>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md text-base-05 hover:bg-base-01 dark:hover:bg-base-02 focus:outline-none focus:ring-2 focus:ring-base-0D transition-colors"
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

