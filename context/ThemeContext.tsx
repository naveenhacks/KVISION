import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { AuthContext } from './AuthContext.tsx';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // Check local storage first
    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme) {
        setTheme(storedTheme);
    } else {
        // Fallback to user preference or default
        const userTheme = user?.preferences?.theme;
        setTheme(userTheme || 'dark');
    }
  }, [user]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    // In a real app with backend, we would update the user preference here.
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
