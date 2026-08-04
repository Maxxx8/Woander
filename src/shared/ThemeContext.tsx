import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';

export type ThemeMode = 'day' | 'night';
export type ThemePreference = 'day' | 'night' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => Promise<void>;
  toggle: () => Promise<void>;
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
  const { user } = useAuth();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [theme, setTheme] = useState<ThemeMode>('night');
  const [loaded, setLoaded] = useState(false);

  // Initial load: pick from local storage immediately so there's no flash
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
    const initialPref = stored ?? 'system';
    setPreferenceState(initialPref);
    const resolved = resolveTheme(initialPref);
    setTheme(resolved);
    applyTheme(resolved);
    setLoaded(true);
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

  // When user logs in, fetch their saved preference from the database
  useEffect(() => {
    if (!user || !loaded) return;
    (async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('theme_preference')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.theme_preference) {
        const dbPref = data.theme_preference as ThemePreference;
        setPreferenceState(dbPref);
        const resolved = resolveTheme(dbPref);
        setTheme(resolved);
        applyTheme(resolved);
      }
    })();
  }, [user, loaded]);

  const setPreference = useCallback(async (pref: ThemePreference) => {
    setPreferenceState(pref);
    localStorage.setItem(STORAGE_KEY, pref);
    const resolved = resolveTheme(pref);
    setTheme(resolved);
    applyTheme(resolved);

    if (user) {
      await supabase
        .from('user_profiles')
        .update({ theme_preference: pref, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
    }
  }, [user]);

  const toggle = useCallback(async () => {
    const newPref: ThemePreference = theme === 'night' ? 'day' : 'night';
    await setPreference(newPref);
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
