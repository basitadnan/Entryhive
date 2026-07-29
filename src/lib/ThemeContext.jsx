import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ theme: 'light', setTheme: () => {}, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('entryhive-theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;

    // Add a brief transition class for smooth theme switching
    root.classList.add('theme-transition');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('entryhive-theme', theme);

    // Remove transition class after animation completes to avoid interfering with other transitions
    const timeout = setTimeout(() => root.classList.remove('theme-transition'), 400);
    return () => clearTimeout(timeout);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
