"use client";

import Link from "next/link";
import type { LessonGroup } from "@/lib/getLessons";
import { CATEGORIES } from "@/data/categories";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { useT } from "@/lib/i18n/useT";
import { localizeLesson, localizeCategory } from "@/lib/i18n/pick";

interface LessonCardProps {
  lesson: LessonGroup;
}

export default function LessonCard({ lesson: rawLesson }: LessonCardProps) {
  const { locale } = useLanguage();
  const t = useT();
  const lesson = localizeLesson(rawLesson, locale);

  const cats = CATEGORIES.filter((c) => lesson.categories.includes(c.slug)).map((c) =>
    localizeCategory(c, locale)
  );
  const range =
    lesson.firstAyah === lesson.lastAyah
      ? `${lesson.surah}:${lesson.firstAyah}`
      : `${lesson.surah}:${lesson.firstAyah}–${lesson.lastAyah}`;
  const verseWord = lesson.verses.length === 1 ? t("common.verse") : t("common.verses");

  return (
    <Link
      href={`/lesson/${lesson.surah}/${lesson.firstAyah}`}
      className="group block bg-dark border border-gold/25 rounded-2xl overflow-hidden hover:border-gold/60 hover:-translate-y-0.5 transition-all duration-200 shadow-md hover:shadow-lg"
    >
      {/* Arabic name — visual anchor */}
      <div className="px-5 pt-5 pb-1">
        <p className="text-gold/70 text-2xl font-[family-name:var(--font-amiri)] text-right leading-none">
          {lesson.surahNameAr}
        </p>
      </div>

      <div className="mx-5 h-px bg-gold/10 my-3" />

      {/* Surah name */}
      <div className="px-5 pb-2">
        <h2 className="text-cream text-xl font-bold leading-snug group-hover:text-gold-light transition-colors">
          {lesson.surahName}
        </h2>
        <p className="text-cream/40 text-sm mt-0.5">{lesson.surahNameTranslation}</p>
      </div>

      {/* Range + verse count */}
      <div className="px-5 pb-4">
        <p className="text-gold/50 font-mono text-xs">
          {range} · {lesson.verses.length} {verseWord}
        </p>
      </div>

      {/* Category chips */}
      {cats.length > 0 && (
        <div className="px-5 pb-5 flex flex-wrap gap-1.5">
          {cats.map((cat) => (
            <span
              key={cat.slug}
              className="text-xs bg-gold/10 text-gold/80 px-2.5 py-0.5 rounded-full border border-gold/30"
            >
              {cat.label}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
