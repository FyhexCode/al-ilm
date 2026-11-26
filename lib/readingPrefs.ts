"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "al-ilm-reading";

export const ARABIC_SCALES = [1, 1.2, 1.4, 1.6] as const;

export type Theme = "auto" | "light" | "dark";

export interface ReadingPrefs {
  /** Index into ARABIC_SCALES. */
  arabicSize: number;
  showTransliteration: boolean;
  theme: Theme;
}

const DEFAULTS: ReadingPrefs = { arabicSize: 0, showTransliteration: true, theme: "auto" };

let cache: ReadingPrefs | null = null;
const listeners = new Set<() => void>();

function read(): ReadingPrefs {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<ReadingPrefs> | null;
    const size = parsed?.arabicSize;
    return {
      arabicSize:
        typeof size === "number" && Number.isInteger(size) && size >= 0 && size < ARABIC_SCALES.length
          ? size
          : DEFAULTS.arabicSize,
      showTransliteration:
        typeof parsed?.showTransliteration === "boolean"
          ? parsed.showTransliteration
          : DEFAULTS.showTransliteration,
      theme: parsed?.theme === "light" || parsed?.theme === "dark" ? parsed.theme : DEFAULTS.theme,
    };
  } catch {
    return DEFAULTS;
  }
}

function getSnapshot(): ReadingPrefs {
  return (cache ??= read());
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Reading comfort settings (Arabic size, transliteration), persisted in localStorage. */
export function useReadingPrefs() {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULTS);

  const update = useCallback((patch: Partial<ReadingPrefs>) => {
    cache = { ...getSnapshot(), ...patch };
    try {
      localStorage.setItem(KEY, JSON.stringify(cache));
    } catch {
      // storage unavailable — keep in-memory state for this session
    }
    listeners.forEach((l) => l());
  }, []);

  return { prefs, update };
}
