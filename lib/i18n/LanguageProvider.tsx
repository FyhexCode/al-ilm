"use client";

import { createContext, useCallback, useEffect, useState } from "react";
import type { Locale } from "./types";
import { DEFAULT_LOCALE, STORAGE_KEY, isLocale } from "./types";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const LanguageContext = createContext<LanguageContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Server always renders the default locale; the saved choice is applied after
  // mount to avoid a hydration mismatch.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isLocale(stored) && stored !== DEFAULT_LOCALE) {
        setLocaleState(stored);
        document.documentElement.lang = stored;
      }
    } catch {
      // localStorage unavailable — keep default.
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore persistence failures
    }
    document.documentElement.lang = next;
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}
