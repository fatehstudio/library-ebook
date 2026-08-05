'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'oled-dark' | 'sepia';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('oled-dark');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('kb-theme') as Theme;
    if (savedTheme === 'oled-dark' || savedTheme === 'sepia') {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme('oled-dark');
    }
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    root.classList.remove('theme-oled-dark', 'theme-sepia');
    if (t === 'oled-dark') {
      root.classList.add('theme-oled-dark');
    } else if (t === 'sepia') {
      root.classList.add('theme-sepia');
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('kb-theme', newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'oled-dark' ? 'sepia' : 'oled-dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
