import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  isLightMode: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'bika_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {
      // Fallback
    }
    return 'dark'; // Dark tactical command default
  });

  const applyThemeToDOM = (t: ThemeMode) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;

    if (t === 'light') {
      root.classList.add('light-mode');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      body.classList.add('light-mode');
      body.setAttribute('data-theme', 'light');
    } else {
      root.classList.remove('light-mode');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      body.classList.remove('light-mode');
      body.setAttribute('data-theme', 'dark');
    }
  };

  useEffect(() => {
    applyThemeToDOM(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Unable to persist theme to localStorage', e);
    }
  }, [theme]);

  // Sync across multiple browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
        setThemeState(e.newValue);
        applyThemeToDOM(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, isLightMode: theme === 'light', setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    const isLight = typeof window !== 'undefined' && localStorage.getItem(THEME_STORAGE_KEY) === 'light';
    return {
      theme: isLight ? 'light' : 'dark',
      isLightMode: isLight,
      setTheme: (t: ThemeMode) => {
        try {
          localStorage.setItem(THEME_STORAGE_KEY, t);
        } catch (e) {}
      },
      toggleTheme: () => {}
    };
  }
  return context;
};
