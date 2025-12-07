import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

const STORAGE_KEY = 'openflow-theme';

/**
 * Get initial theme from localStorage or system preference.
 * @returns {string} Theme (light or dark)
 */
function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === THEMES.LIGHT || stored === THEMES.DARK) {
    return stored;
  }

  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return THEMES.DARK;
  }

  return THEMES.LIGHT;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // Apply theme class to document root
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === THEMES.DARK) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  /**
   * Toggle between light and dark theme.
   */
  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
      localStorage.setItem(STORAGE_KEY, newTheme);
      return newTheme;
    });
  }, []);

  /**
   * Set theme explicitly.
   * @param {string} newTheme - Theme to set (light or dark)
   */
  const setThemeExplicit = useCallback((newTheme) => {
    if (newTheme === THEMES.LIGHT || newTheme === THEMES.DARK) {
      setTheme(newTheme);
      localStorage.setItem(STORAGE_KEY, newTheme);
    }
  }, []);

  /**
   * Check if current theme is dark.
   * @returns {boolean} True if dark theme
   */
  const isDark = useCallback(() => {
    return theme === THEMES.DARK;
  }, [theme]);

  /**
   * Check if current theme is light.
   * @returns {boolean} True if light theme
   */
  const isLight = useCallback(() => {
    return theme === THEMES.LIGHT;
  }, [theme]);

  const value = {
    theme,
    toggleTheme,
    setTheme: setThemeExplicit,
    isDark,
    isLight,
    themes: THEMES,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context.
 * @returns {object} Theme context value
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;

