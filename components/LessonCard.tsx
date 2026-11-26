"use client";

import Link from "next/link";
import type { LessonSummary } from "@/lib/getLessons";
import { CATEGORIES } from "@/data/categories";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { useT } from "@/lib/i18n/useT";
import { useProgress } from "@/lib/progress";
import { localizeLessonSummary, localizeCategory } from "@/lib/i18n/pick";

interface LessonCardProps {
  lesson: LessonSummary;
}

export default function LessonCard({ lesson: rawLesson }: LessonCardProps) {
  const { locale } = useLanguage();
  const t = useT();
  const { isRead } = useProgress();
  const lesson = localizeLessonSummary(rawLesson, locale);
  const done = isRead(lesson.surah);

  const cats = CATEGORIES.filter((c) => lesson.categories.includes(c.slug)).map((c) =>
    localizeCategory(c, locale)
  );
  const range =
    lesson.firstAyah === lesson.lastAyah
      ? `${lesson.surah}:${lesson.firstAyah}`
      : `${lesson.surah}:${lesson.firstAyah}–${lesson.lastAyah}`;
  const verseWord = lesson.verseCount === 1 ? t("common.verse") : t("common.verses");

  return (
    <Link
      href={`/lesson/${lesson.surah}/${lesson.firstAyah}`}
      className="group block bg-dark border border-gold/25 rounded-2xl overflow-hidden hover:border-gold/60 hover:-translate-y-0.5 transition-all duration-200 shadow-md hover:shadow-lg"
    >
      {/* Arabic name — visual anchor */}
      <div className="px-5 pt-5 pb-1">
        <p className="text-gold-light text-2xl font-[family-name:var(--font-amiri)] text-right leading-none">
          {lesson.surahNameAr}
        </p>
      </div>

      <div className="mx-5 h-px bg-gold/10 my-3" />

      {/* Surah name */}
      <div className="px-5 pb-2">
        <h2 className="text-cream text-xl font-bold leading-snug group-hover:text-gold-light transition-colors">
          {lesson.surahName}
        </h2>
        <p className="text-cream/70 text-sm mt-0.5">{lesson.surahNameTranslation}</p>
      </div>

      {lesson.previewTakeaway && (
        <div className="px-5 pb-3">
          {/* Padding lives on the wrapper: line-clamp's overflow:hidden would otherwise show a 3rd line inside the padding. */}
          <p className="text-cream/70 text-sm leading-snug line-clamp-2">{lesson.previewTakeaway}</p>
        </div>
      )}

      {/* Range + verse count */}
      <div className="px-5 pb-4">
        <p className="text-gold-light font-mono text-xs">
          {range} · {lesson.verseCount} {verseWord}
          {done && <span className="ml-2 text-gold-light font-sans font-semibold">✓ {t("progress.read")}</span>}
        </p>
      </div>

      {/* Category chips */}
      {cats.length > 0 && (
        <div className="px-5 pb-5 flex flex-wrap gap-1.5">
          {cats.map((cat) => (
            <span
              key={cat.slug}
              className="text-xs bg-gold/10 text-gold-light px-2.5 py-0.5 rounded-full border border-gold/30"
            >
              {cat.label}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
