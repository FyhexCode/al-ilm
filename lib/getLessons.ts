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
