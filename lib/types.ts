export interface Verse {
  surah: number;
  surahName: string;
  surahNameTranslation: string;
  surahNameAr: string;
  ayah: number;
  arabic: string;
  transliteration: string;
  translation: string;
  juz: number;
  categories: string[];
  tafseer: string | null;
  tafseerSummary: string | null;
  tafseerGroup: string;
  tafseerGroupEnd: string;
  tafseerVerseCount: number;
  lessonTitle: string | null;
  application: string | null;
  // Indonesian translations (generated via Ollama). Optional — English is the fallback.
  surahNameTranslationId?: string;
  translationId?: string;
  tafseerId?: string | null;
  tafseerSummaryId?: string | null;
  lessonTitleId?: string | null;
  applicationId?: string | null;
}

export interface Category {
  slug: string;
  label: string;
  description: string;
  icon: string;
  // Indonesian translations (optional — English fallback).
  labelId?: string;
  descriptionId?: string;
}

export interface VerseCluster {
  ayahs: number[];
  keyTakeaway: string;
  lesson: string;
  // Indonesian translations (optional — English fallback).
  keyTakeawayId?: string;
  lessonId?: string;
}
