import type { Verse } from "./types";
import { getAllVerses } from "./getAllVerses";
import { getClustersForSurah } from "./getVerseClusters";

export type SearchLocale = "en" | "id";

export interface SearchHit {
  surah: number;
  ayah: number;
  surahName: string;
  translation: string;
  takeaway: string;
  score: number;
}

interface IndexEntry {
  verse: Verse;
  takeaway: string;
  takeawayId: string;
  // Normalised haystacks with relevance weights.
  fields: { text: string; weight: number }[];
}

/** Lowercase, strip Latin accents and Arabic diacritics/tatweel, unify alef/ya/ta-marbuta. */
export function normalize(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ًͯ-ٰٟۖ-ۭـ]/g, "")
    .replace(/[آأإٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

let index: IndexEntry[] | null = null;

function buildIndex(): IndexEntry[] {
  return getAllVerses().map((verse) => {
    const cluster = getClustersForSurah(verse.surah).find((c) => c.ayahs.includes(verse.ayah));
    const takeaway = cluster?.keyTakeaway ?? "";
    const takeawayId = cluster?.keyTakeawayId ?? "";
    return {
      verse,
      takeaway,
      takeawayId,
      fields: [
        {
          text: normalize(
            `${verse.surahName} ${verse.surahNameTranslation} ${verse.surahNameTranslationId ?? ""}`
          ),
          weight: 5,
        },
        { text: normalize(`${takeaway} ${takeawayId}`), weight: 4 },
        { text: normalize(`${verse.translation} ${verse.translationId ?? ""}`), weight: 3 },
        { text: normalize(verse.transliteration), weight: 2 },
        { text: normalize(verse.arabic), weight: 2 },
      ],
    };
  });
}

/** Score one entry: every term must match some field; whole-phrase hits get a bonus. */
function scoreEntry(entry: IndexEntry, terms: string[], phrase: string): number {
  let score = 0;
  for (const term of terms) {
    let best = 0;
    for (const f of entry.fields) {
      if (f.text.includes(term)) best = Math.max(best, f.weight);
    }
    if (best === 0) return 0;
    score += best;
  }
  if (terms.length > 1) {
    const hit = entry.fields.find((f) => f.text.includes(phrase));
    if (hit) score += hit.weight * 2;
  }
  return score;
}

/** Slim verse summaries for ids like "78:1", in canonical surah/ayah order (used by Saved). */
export function getVerseSummaries(ids: string[], locale: SearchLocale): SearchHit[] {
  index ??= buildIndex();
  const wanted = new Set(ids);
  return index
    .filter((e) => wanted.has(`${e.verse.surah}:${e.verse.ayah}`))
    .map((e) => toHit(e, locale, 0));
}

function toHit(entry: IndexEntry, locale: SearchLocale, score: number): SearchHit {
  const v = entry.verse;
  return {
    surah: v.surah,
    ayah: v.ayah,
    surahName: v.surahName,
    translation: locale === "id" && v.translationId ? v.translationId : v.translation,
    takeaway: locale === "id" && entry.takeawayId ? entry.takeawayId : entry.takeaway,
    score,
  };
}

export function searchVerses(query: string, locale: SearchLocale, limit = 30): SearchHit[] {
  const phrase = normalize(query);
  if (phrase.length < 2) return [];
  const terms = phrase.split(" ");
  index ??= buildIndex();

  const hits: SearchHit[] = [];
  for (const entry of index) {
    const score = scoreEntry(entry, terms, phrase);
    if (score === 0) continue;
    hits.push(toHit(entry, locale, score));
  }

  return hits
    .sort((a, b) => b.score - a.score || a.surah - b.surah || a.ayah - b.ayah)
    .slice(0, limit);
}
