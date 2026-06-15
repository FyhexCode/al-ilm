import type { Verse } from "./types";

export function getDailyVerse(verses: Verse[]): Verse {
  const dateStr = new Date().toISOString().split("T")[0];
  const seed = Array.from(dateStr).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return verses[seed % verses.length];
}
