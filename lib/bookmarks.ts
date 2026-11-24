"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "al-ilm-bookmarks";
const EMPTY: string[] = [];

let cache: string[] | null = null;
const listeners = new Set<() => void>();

export const bookmarkId = (surah: number, ayah: number) => `${surah}:${ayah}`;

function read(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function getSnapshot(): string[] {
  return (cache ??= read());
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // Another tab changed the list.
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

function write(next: string[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage unavailable — keep in-memory state for this session
  }
  listeners.forEach((l) => l());
}

/** Bookmarked verse ids ("surah:ayah"), persisted in localStorage and synced across tabs. */
export function useBookmarks() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);

  const toggle = useCallback((id: string) => {
    const current = getSnapshot();
    write(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  }, []);

  return { ids, isSaved: (id: string) => ids.includes(id), toggle };
}
