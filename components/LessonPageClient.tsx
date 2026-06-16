"use client";

import Link from "next/link";
import type { LessonGroup } from "@/lib/getLessons";
import type { Verse } from "@/lib/types";
import LessonDetail from "./LessonDetail";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { useT } from "@/lib/i18n/useT";
import { pick } from "@/lib/i18n/pick";

interface Props {
  lesson: LessonGroup;
  surahVerses: Verse[];
  prevLesson: LessonGroup | null;
  nextLesson: LessonGroup | null;
}

export default function LessonPageClient({ lesson, surahVerses, prevLesson, nextLesson }: Props) {
  const { locale } = useLanguage();
  const t = useT();

  return (
    <div>
      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-2">
        <nav className="text-sm text-dark/40 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">{t("nav.home")}</Link>
          <span>/</span>
          <Link href="/browse" className="hover:text-primary transition-colors">{t("nav.browse")}</Link>
          <span>/</span>
          <span className="text-dark/70 truncate max-w-xs">{lesson.surahName}</span>
        </nav>
      </div>

      <LessonDetail lesson={lesson} surahVerses={surahVerses} />

      {/* Prev / Next navigation */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-12 mt-4">
        <div className="grid grid-cols-2 gap-4">
          {prevLesson ? (
            <Link
              href={`/lesson/${prevLesson.surah}/${prevLesson.firstAyah}`}
              className="flex flex-col p-4 rounded-2xl border border-gold/20 hover:border-gold hover:bg-cream-dark transition-all"
            >
              <span className="text-xs text-dark/40 mb-1">← {t("nav.prev")}</span>
              <span className="text-sm font-semibold text-primary">{prevLesson.surahName}</span>
              <span className="text-xs text-dark/40 mt-1">
                {pick(locale, prevLesson.surahNameTranslation, prevLesson.surahNameTranslationId)}
              </span>
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Link
              href={`/lesson/${nextLesson.surah}/${nextLesson.firstAyah}`}
              className="flex flex-col p-4 rounded-2xl border border-gold/20 hover:border-gold hover:bg-cream-dark transition-all text-right"
            >
              <span className="text-xs text-dark/40 mb-1">{t("nav.next")} →</span>
              <span className="text-sm font-semibold text-primary">{nextLesson.surahName}</span>
              <span className="text-xs text-dark/40 mt-1">
                {pick(locale, nextLesson.surahNameTranslation, nextLesson.surahNameTranslationId)}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
