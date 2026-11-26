"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "al-ilm-journal";
export const MAX_NOTE_CHARS = 2000;

type Notes = Record<string, string>;
const EMPTY: Notes = {};

let cache: Notes | null = null;
const listeners = new Set<() => void>();

function read(): Notes {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, string] => /^\d+:\d+$/.test(entry[0]) && typeof entry[1] === "string"
      )
    );
  } catch {
    return {};
  }
}

function getSnapshot(): Notes {
  return (cache ??= read());
}

function write(next: Notes) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage unavailable (private mode / quota) — the note stays in memory for this session
  }
  listeners.forEach((l) => l());
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

/** Private per-verse reflections ("surah:ayah" → text), stored only in this browser. */
export function useJournal() {
  const notes = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);

  const setNote = useCallback((id: string, text: string) => {
    const current = getSnapshot();
    const trimmedForLimit = text.slice(0, MAX_NOTE_CHARS);
    if (trimmedForLimit.trim() === "") {
      if (!(id in current)) return;
      const rest = { ...current };
      delete rest[id];
      write(rest);
    } else {
      write({ ...current, [id]: trimmedForLimit });
    }
  }, []);

  return { notes, setNote };
}
