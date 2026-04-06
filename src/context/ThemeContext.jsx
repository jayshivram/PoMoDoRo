import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const THEMES = ['light', 'dark', 'amoled'];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('focusflow-theme');
    if (stored && THEMES.includes(stored)) return stored;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('focusflow-theme', theme);
    // update meta theme-color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      const colors = { light: '#f8f9fc', dark: '#0f0f14', amoled: '#000000' };
      meta.setAttribute('content', colors[theme]);
    }
  }, [theme]);

  const cycleTheme = () => {
    const idx = THEMES.indexOf(theme);
    setTheme(THEMES[(idx + 1) % THEMES.length]);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
