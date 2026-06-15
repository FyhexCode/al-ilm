import type { Verse } from "./types";

export function getVersesByCategory(verses: Verse[], categorySlug: string): Verse[] {
  if (!categorySlug || categorySlug === "all") return verses;
  return verses.filter((v) => v.categories.includes(categorySlug));
}
