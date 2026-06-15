import type { Verse } from "./types";
import { getAllVerses } from "./getAllVerses";

export interface LessonGroup {
  id: string;
  surah: number;
  surahName: string;
  surahNameTranslation: string;
  surahNameAr: string;
  application: string | null;
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
      }
    } else {
      groupMap.set(key, {
        id: `${verse.surah}-${verse.ayah}`,
        surah: verse.surah,
        surahName: verse.surahName,
        surahNameTranslation: verse.surahNameTranslation,
        surahNameAr: verse.surahNameAr,
        application: verse.application,
        categories: [...verse.categories],
        firstAyah: verse.ayah,
        lastAyah: verse.ayah,
        verses: [verse],
      });
    }
  }

  return [...groupMap.values()];
}
