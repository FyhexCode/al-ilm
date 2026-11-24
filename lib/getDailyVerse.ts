import type { Verse } from "./types";

const MS_PER_DAY = 86_400_000;
// Prime stride: coprime with the verse count (564 = 2²·3·47), so consecutive days
// jump around the juz and every verse appears exactly once per cycle.
const STRIDE = 257;

export function getTodayISO(now: Date = new Date()): string {
  return now.toISOString().split("T")[0];
}

export function getDailyVerse(verses: Verse[], dateISO: string = getTodayISO()): Verse {
  const dayNumber = Math.floor(Date.parse(`${dateISO}T00:00:00Z`) / MS_PER_DAY);
  return verses[(dayNumber * STRIDE) % verses.length];
}
