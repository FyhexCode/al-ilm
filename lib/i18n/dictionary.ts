import type { Locale } from "./types";

// UI chrome strings. Quran *content* (verses, tafseer, lessons) is translated
// separately via the Ollama script into the data `*Id` fields. These short,
// fixed UI labels are hand-translated for quality. Use {token} for interpolation.
const en = {
  "nav.home": "Home",
  "nav.explore": "Explore",
  "nav.browse": "Browse",
  "nav.prev": "Previous",
  "nav.next": "Next",

  "common.verse": "verse",
  "common.verses": "verses",
  "common.lesson": "lesson",
  "common.lessons": "lessons",
  "common.theme": "Theme",
  "common.themes": "Themes",
  "common.in": "in",

  "daily.ofTheDay": "Lesson of the Day",
  "daily.translationDivider": "— Translation —",
  "daily.theLesson": "The Lesson",
  "daily.howToApply": "How to apply this today",
  "daily.readTafseer": "Read Full Tafseer",
  "daily.browseRelated": "Browse Related",
  "daily.applicationFallback":
    "Reflect on this verse throughout your day and consider how its wisdom applies to your current circumstances.",

  "home.versesLabel": "verses from",
  "home.juzLabel": "Juz 30",
  "home.surahRange": "Surahs 78–114",
  "home.moreJuz": "More Juz coming soon",

  "categoryGrid.title": "Browse by Theme",
  "categoryGrid.subtitle": "Explore Quran verses organised by the wisdom they carry",
  "categoryGrid.allVerses": "All Verses",
  "categoryGrid.allVersesDesc": "Browse the complete Juz 30 collection",

  "browse.title": "Browse Lessons",
  "browse.subtitle": "Filter by theme and explore Juz 30 — {count} lessons across Surahs 78–114",
  "browse.loading": "Loading...",
  "browse.allLessons": "All Lessons",
  "browse.showing": "Showing",

  "tab.overview": "Overview",
  "tab.verses": "Verses",
  "tab.tafseer": "Tafseer",
  "tab.surah": "Surah",

  "lesson.lessonsInSurah": "Lessons in this surah",
  "lesson.tapToApply": "— tap to see how to apply it",
  "lesson.howToApply": "How to apply this today",
  "lesson.connected": "connected",
  "lesson.fullPage": "Full page →",
  "lesson.keyTakeaway": "Key Takeaway",
  "lesson.lessonLabel": "Lesson",
  "lesson.noTafseer": "No tafseer available for this surah.",
  "lesson.allVerses": "All verses",
  "lesson.surahWord": "Surah",
  "lesson.juzWord": "Juz",

  "tafseer.title": "Tafseer",
  "tafseer.source": "Ibn Kathir (Abridged)",
  "tafseer.lang": "English",
  "tafseer.about": "About This Verse",
  "tafseer.showLess": "Show less ↑",
  "tafseer.section": "section",
  "tafseer.sections": "sections",

  "share.share": "Share verse",
  "share.copied": "Link copied!",

  "verse.ayahWord": "Ayah",

  "footer.tagline": "Al-Ilm — Illuminated by the words of the Quran",
};

export type DictKey = keyof typeof en;

const id: Record<DictKey, string> = {
  "nav.home": "Beranda",
  "nav.explore": "Jelajahi",
  "nav.browse": "Jelajahi",
  "nav.prev": "Sebelumnya",
  "nav.next": "Berikutnya",

  "common.verse": "ayat",
  "common.verses": "ayat",
  "common.lesson": "pelajaran",
  "common.lessons": "pelajaran",
  "common.theme": "Tema",
  "common.themes": "Tema",
  "common.in": "dalam",

  "daily.ofTheDay": "Pelajaran Hari Ini",
  "daily.translationDivider": "— Terjemahan —",
  "daily.theLesson": "Pelajaran",
  "daily.howToApply": "Cara menerapkannya hari ini",
  "daily.readTafseer": "Baca Tafsir Lengkap",
  "daily.browseRelated": "Jelajahi Terkait",
  "daily.applicationFallback":
    "Renungkan ayat ini sepanjang hari Anda dan pertimbangkan bagaimana hikmahnya berlaku pada keadaan Anda saat ini.",

  "home.versesLabel": "ayat dari",
  "home.juzLabel": "Juz 30",
  "home.surahRange": "Surah 78–114",
  "home.moreJuz": "Juz lainnya segera hadir",

  "categoryGrid.title": "Jelajahi berdasarkan Tema",
  "categoryGrid.subtitle": "Jelajahi ayat-ayat Al-Quran yang disusun berdasarkan hikmah yang dikandungnya",
  "categoryGrid.allVerses": "Semua Ayat",
  "categoryGrid.allVersesDesc": "Jelajahi koleksi lengkap Juz 30",

  "browse.title": "Jelajahi Pelajaran",
  "browse.subtitle": "Saring berdasarkan tema dan jelajahi Juz 30 — {count} pelajaran di seluruh Surah 78–114",
  "browse.loading": "Memuat...",
  "browse.allLessons": "Semua Pelajaran",
  "browse.showing": "Menampilkan",

  "tab.overview": "Ikhtisar",
  "tab.verses": "Ayat",
  "tab.tafseer": "Tafsir",
  "tab.surah": "Surah",

  "lesson.lessonsInSurah": "Pelajaran dalam surah ini",
  "lesson.tapToApply": "— ketuk untuk melihat cara menerapkannya",
  "lesson.howToApply": "Cara menerapkannya hari ini",
  "lesson.connected": "terhubung",
  "lesson.fullPage": "Halaman penuh →",
  "lesson.keyTakeaway": "Inti Pelajaran",
  "lesson.lessonLabel": "Pelajaran",
  "lesson.noTafseer": "Tafsir tidak tersedia untuk surah ini.",
  "lesson.allVerses": "Semua ayat",
  "lesson.surahWord": "Surah",
  "lesson.juzWord": "Juz",

  "tafseer.title": "Tafsir",
  "tafseer.source": "Ibnu Katsir (Ringkasan)",
  "tafseer.lang": "Indonesia",
  "tafseer.about": "Tentang Ayat Ini",
  "tafseer.showLess": "Tampilkan lebih sedikit ↑",
  "tafseer.section": "bagian",
  "tafseer.sections": "bagian",

  "share.share": "Bagikan ayat",
  "share.copied": "Tautan disalin!",

  "verse.ayahWord": "Ayat",

  "footer.tagline": "Al-Ilm — Diterangi oleh firman Al-Quran",
};

export const dictionary: Record<Locale, Record<DictKey, string>> = { en, id };

export function translate(
  locale: Locale,
  key: DictKey,
  params?: Record<string, string | number>
): string {
  let str = dictionary[locale][key] ?? dictionary.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return str;
}
