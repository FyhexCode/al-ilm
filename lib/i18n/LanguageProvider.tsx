"use client";

import { createContext, useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
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

// The saved locale lives in localStorage; React reads it through an external store.
// The server snapshot is always the default locale, so hydration never mismatches.
let cached: Locale | null = null;
const listeners = new Set<() => void>();

function readLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isLocale(stored) ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE; // localStorage unavailable
  }
}

function getSnapshot(): Locale {
  return (cached ??= readLocale());
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // Another tab changed the language.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cached = null;
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_LOCALE);

  // Keep <html lang> in step with the active language (screen readers, hyphenation).
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    cached = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore persistence failures — the choice still applies for this session
    }
    listeners.forEach((l) => l());
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
