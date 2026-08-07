import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'day' | 'night';
export type ThemePreference = 'day' | 'night' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'woander-theme-preference';

function getSystemTheme(): ThemeMode {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
  }
  return 'night';
}

function resolveTheme(pref: ThemePreference): ThemeMode {
  if (pref === 'system') return getSystemTheme();
  return pref;
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.setAttribute('data-theme', mode);
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [theme, setTheme] = useState<ThemeMode>('night');

  // Initial load: pick from local storage immediately so there's no flash
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
      const initialPref = stored ?? 'system';
      setPreferenceState(initialPref);
      const resolved = resolveTheme(initialPref);
      setTheme(resolved);
      applyTheme(resolved);
    } catch {
      // localStorage may be unavailable (private mode, etc.) — fall back to system
      const resolved = getSystemTheme();
      setTheme(resolved);
      applyTheme(resolved);
    }
  }, []);

  // Listen for system theme changes when preference is 'system'
  useEffect(() => {
    if (preference !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const resolved = getSystemTheme();
      setTheme(resolved);
      applyTheme(resolved);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [preference]);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    try {
      localStorage.setItem(STORAGE_KEY, pref);
    } catch {
      // Ignore storage errors — theme still applies for this session
    }
    const resolved = resolveTheme(pref);
    setTheme(resolved);
    applyTheme(resolved);
  }, []);

  const toggle = useCallback(() => {
    const newPref: ThemePreference = theme === 'night' ? 'day' : 'night';
    setPreference(newPref);
  }, [theme, setPreference]);

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
