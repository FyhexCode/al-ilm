"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "al-ilm-progress";
const MAX_DAYS = 400;

export interface Progress {
  /** Surah numbers marked as read. */
  read: number[];
  /** Local calendar days (YYYY-MM-DD) the reader visited, ascending. */
  days: string[];
}

const EMPTY: Progress = { read: [], days: [] };

let cache: Progress | null = null;
const listeners = new Set<() => void>();

/** Local (not UTC) calendar day, so a streak follows the reader's own midnight. */
export function localDay(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function shiftDay(day: string, delta: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return localDay(new Date(y, m - 1, d + delta));
}

/** Consecutive days ending today (or yesterday, so the streak survives until you next visit). */
export function computeStreak(days: string[], today: string = localDay()): number {
  const set = new Set(days);
  let cursor = set.has(today) ? today : shiftDay(today, -1);
  let streak = 0;
  while (set.has(cursor)) {
    streak++;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}

function read(): Progress {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<Progress> | null;
    const nums = Array.isArray(parsed?.read)
      ? parsed.read.filter((n): n is number => Number.isInteger(n))
      : [];
    const days = Array.isArray(parsed?.days)
      ? parsed.days.filter((d): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d))
      : [];
    return { read: nums, days };
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): Progress {
  return (cache ??= read());
}

function write(next: Progress) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage unavailable — keep in-memory state for this session
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

/** Log today as a visit (idempotent). Safe to call from effects. */
export function recordVisit() {
  const current = getSnapshot();
  const today = localDay();
  if (current.days.includes(today)) return;
  write({ ...current, days: [...current.days, today].slice(-MAX_DAYS) });
}

/** Surahs marked read + visit streak, persisted in localStorage and synced across tabs. */
export function useProgress() {
  const progress = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);

  const toggleRead = useCallback((surah: number) => {
    const current = getSnapshot();
    write({
      ...current,
      read: current.read.includes(surah)
        ? current.read.filter((s) => s !== surah)
        : [...current.read, surah],
    });
  }, []);

  return {
    readSurahs: progress.read,
    isRead: (surah: number) => progress.read.includes(surah),
    streak: computeStreak(progress.days),
    toggleRead,
  };
}
