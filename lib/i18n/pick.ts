import type { Locale } from "./types";
import type { Verse, Category, VerseCluster } from "@/lib/types";
import type { LessonGroup } from "@/lib/getLessons";

/** Pick the Indonesian value when present and non-empty, else fall back to English. */
export function pick(
  locale: Locale,
  en: string,
  id?: string | null
): string {
  if (locale === "id" && id != null && id !== "") return id;
  return en;
}

/** Same as pick but preserves null (for nullable content like tafseer). */
export function pickNullable(
  locale: Locale,
  en: string | null,
  id?: string | null
): string | null {
  if (locale === "id" && id != null && id !== "") return id;
  return en;
}

export function localizeVerse(verse: Verse, locale: Locale): Verse {
  if (locale === "en") return verse;
  return {
    ...verse,
    surahNameTranslation: pick(locale, verse.surahNameTranslation, verse.surahNameTranslationId),
    translation: pick(locale, verse.translation, verse.translationId),
    tafseer: pickNullable(locale, verse.tafseer, verse.tafseerId),
    tafseerSummary: pickNullable(locale, verse.tafseerSummary, verse.tafseerSummaryId),
    lessonTitle: pickNullable(locale, verse.lessonTitle, verse.lessonTitleId),
    application: pickNullable(locale, verse.application, verse.applicationId),
  };
}

export function localizeCategory(cat: Category, locale: Locale): Category {
  if (locale === "en") return cat;
  return {
    ...cat,
    label: pick(locale, cat.label, cat.labelId),
    description: pick(locale, cat.description, cat.descriptionId),
  };
}

export function localizeCluster(cluster: VerseCluster, locale: Locale): VerseCluster {
  if (locale === "en") return cluster;
  return {
    ...cluster,
    keyTakeaway: pick(locale, cluster.keyTakeaway, cluster.keyTakeawayId),
    lesson: pick(locale, cluster.lesson, cluster.lessonId),
  };
}

export function localizeLesson(lesson: LessonGroup, locale: Locale): LessonGroup {
  if (locale === "en") return lesson;
  return {
    ...lesson,
    surahNameTranslation: pick(locale, lesson.surahNameTranslation, lesson.surahNameTranslationId),
    application: pickNullable(locale, lesson.application, lesson.applicationId),
    verses: lesson.verses.map((v) => localizeVerse(v, locale)),
  };
}
