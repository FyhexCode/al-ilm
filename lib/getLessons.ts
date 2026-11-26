import type { Verse } from "./types";
import { getAllVerses } from "./getAllVerses";
import { getClustersForSurah } from "./getVerseClusters";

export interface LessonGroup {
  id: string;
  surah: number;
  surahName: string;
  surahNameTranslation: string;
  surahNameTranslationId?: string;
  surahNameAr: string;
  application: string | null;
  applicationId?: string | null;
  /** First cluster key takeaway — shown as a preview on lesson cards. */
  previewTakeaway?: string;
  previewTakeawayId?: string;
  categories: string[];
  firstAyah: number;
  lastAyah: number;
  verses: Verse[];
}

/** What a lesson *card* needs — no verse bodies, so Browse stays small. */
export interface LessonSummary {
  id: string;
  surah: number;
  surahName: string;
  surahNameTranslation: string;
  surahNameTranslationId?: string;
  surahNameAr: string;
  categories: string[];
  firstAyah: number;
  lastAyah: number;
  verseCount: number;
  previewTakeaway?: string;
  previewTakeawayId?: string;
}

export function getLessonSummaries(): LessonSummary[] {
  return getLessons().map((l) => ({
    id: l.id,
    surah: l.surah,
    surahName: l.surahName,
    surahNameTranslation: l.surahNameTranslation,
    surahNameTranslationId: l.surahNameTranslationId,
    surahNameAr: l.surahNameAr,
    categories: l.categories,
    firstAyah: l.firstAyah,
    lastAyah: l.lastAyah,
    verseCount: l.verses.length,
    previewTakeaway: l.previewTakeaway,
    previewTakeawayId: l.previewTakeawayId,
  }));
}

/**
 * Every verse in a group carries the same (very long) tafseer text. The lesson page shows it once,
 * from the first verse, so strip it from the rest before the lesson is sent to the browser.
 */
export function slimLessonForClient(lesson: LessonGroup): LessonGroup {
  return {
    ...lesson,
    verses: lesson.verses.map((v, i) =>
      i === 0
        ? v
        : { ...v, tafseer: null, tafseerSummary: null, tafseerId: null, tafseerSummaryId: null }
    ),
  };
}

export function getLessons(): LessonGroup[] {
  const verses = getAllVerses();
  const groupMap = new Map<string, LessonGroup>();

  for (const verse of verses) {
    const key = verse.tafseerGroup; // e.g. "78:1" — one per surah in this dataset

    if (groupMap.has(key)) {
      const group = groupMap.get(key)!;
      group.verses.push(verse);
      group.lastAyah = verse.ayah;
      for (const cat of verse.categories) {
        if (!group.categories.includes(cat)) group.categories.push(cat);
      }
      if (!group.application && verse.application) {
        group.application = verse.application;
        group.applicationId = verse.applicationId ?? null;
      }
    } else {
      const firstCluster = getClustersForSurah(verse.surah).find((c) => c.keyTakeaway);
      groupMap.set(key, {
        id: `${verse.surah}-${verse.ayah}`,
        surah: verse.surah,
        surahName: verse.surahName,
        surahNameTranslation: verse.surahNameTranslation,
        surahNameTranslationId: verse.surahNameTranslationId,
        surahNameAr: verse.surahNameAr,
        application: verse.application,
        applicationId: verse.applicationId ?? null,
        previewTakeaway: firstCluster?.keyTakeaway,
        previewTakeawayId: firstCluster?.keyTakeawayId,
        categories: [...verse.categories],
        firstAyah: verse.ayah,
        lastAyah: verse.ayah,
        verses: [verse],
      });
    }
  }

  return [...groupMap.values()];
}
