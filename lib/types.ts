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
}

export interface Category {
  slug: string;
  label: string;
  description: string;
  icon: string;
}
