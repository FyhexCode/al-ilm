"use client";

import Link from "next/link";
import type { Verse, VerseCluster } from "@/lib/types";
import ArabicText from "./ArabicText";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { useT } from "@/lib/i18n/useT";
import { localizeVerse, localizeCluster, localizeCategory } from "@/lib/i18n/pick";
import { CATEGORIES } from "@/data/categories";

interface Props {
  verse: Verse;
  clusterVerses: Verse[];
  cluster: VerseCluster | null;
  /** YYYY-MM-DD (UTC) the verse was picked for — keeps date label and verse in sync. */
  dateISO: string;
}

export default function DailyLesson({ verse: rawVerse, clusterVerses: rawClusterVerses, cluster: rawCluster, dateISO }: Props) {
  const { locale } = useLanguage();
  const t = useT();

  const verse = localizeVerse(rawVerse, locale);
  const clusterVerses = rawClusterVerses.map((v) => localizeVerse(v, locale));
  const cluster = rawCluster ? localizeCluster(rawCluster, locale) : null;

  const verseCategories = CATEGORIES.filter((c) => verse.categories.includes(c.slug)).map((c) =>
    localizeCategory(c, locale)
  );

  const today = new Date(`${dateISO}T00:00:00Z`).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const lessonText = cluster?.keyTakeaway ?? verse.lessonTitle ?? verse.translation.slice(0, 80);

  return (
    <>
      {/* Hero */}
      <section className="hero-pattern relative min-h-[85svh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark/40 via-dark/60 to-dark pointer-events-none" />

        {/* Tazhib corner ornaments — reference illuminated Quran manuscript tradition */}
        {(["top-5 left-5 sm:top-7 sm:left-7", "top-5 right-5 sm:top-7 sm:right-7", "bottom-5 left-5 sm:bottom-7 sm:left-7", "bottom-5 right-5 sm:bottom-7 sm:right-7"] as const).map((pos, i) => (
          <svg
            key={i}
            className={`absolute ${pos} pointer-events-none`}
            style={{
              opacity: 0.55,
              transform: `scaleX(${i % 2 === 1 ? -1 : 1}) scaleY(${i >= 2 ? -1 : 1})`,
            }}
            width="68"
            height="68"
            viewBox="0 0 68 68"
            aria-hidden="true"
          >
            <path d="M0,62 L0,7 Q0,0 7,0 L62,0" fill="none" stroke="#C9A347" strokeWidth="1.2"/>
            <path d="M0,48 L0,16" stroke="#C9A347" strokeWidth="0.5" opacity="0.45"/>
            <path d="M16,0 L48,0" stroke="#C9A347" strokeWidth="0.5" opacity="0.45"/>
            <g transform="translate(19,19)">
              <polygon points="0,-11 11,0 0,11 -11,0" fill="none" stroke="#C9A347" strokeWidth="1.1"/>
              <circle cx="0" cy="0" r="2.5" fill="#C9A347"/>
            </g>
          </svg>
        ))}

        <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center gap-8">
          <div className="relative w-full h-36 sm:h-44 flex items-center justify-center">
            <span
              className="text-gold-light text-4xl sm:text-6xl font-[family-name:var(--font-amiri)] leading-[1.6] whitespace-nowrap"
              aria-label="Bismillah ir-Rahman ir-Rahim"
            >
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="gold-shimmer text-xs tracking-[0.2em] uppercase font-medium text-center">
              {t("daily.ofTheDay")}
            </p>
            <p className="text-cream/70 text-xs tracking-[0.1em] uppercase text-center">
              {today}
            </p>
          </div>

        </div>

        <div
          className="absolute left-1/2 -translate-x-1/2 select-none"
          style={{ bottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <span className="text-gold-light text-2xl font-[family-name:var(--font-amiri)] motion-safe:animate-bounce" aria-hidden="true">۝</span>
        </div>
      </section>

      {/* Lesson title — scrolls normally then sticks below the navbar */}
      <div className="sticky top-16 z-10 bg-dark border-b border-gold/10 py-4 px-6 max-h-[25vh] overflow-y-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-cream leading-snug text-center max-w-3xl mx-auto font-[family-name:var(--font-display)]">
          {lessonText}
        </h1>
      </div>

      {/* Detail sections */}
      <section className="bg-primary-dark py-12 sm:py-16 px-6 overflow-hidden">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-cream text-2xl sm:text-3xl font-semibold mb-1 font-[family-name:var(--font-display)]">{verse.surahName}</p>
          <p className="text-cream/70 text-sm mb-4">{verse.surahNameTranslation}</p>
          <p className="text-gold-light font-mono text-sm tracking-wider mb-6">
            {verse.surah}:{verse.ayah}
          </p>
          <p className="text-gold-light text-2xl font-[family-name:var(--font-amiri)] mb-10">
            {verse.surahNameAr}
          </p>

          <div className="h-px bg-gold/10 mb-10" />

          <div className="space-y-10">
            {clusterVerses.map((v, idx) => (
              <div key={v.ayah}>
                {clusterVerses.length > 1 && (
                  <p className="text-gold-light font-mono text-xs mb-4">{v.surah}:{v.ayah}</p>
                )}
                <ArabicText text={v.arabic} size="xl" align="center" className="text-cream mb-8" />
                <div className="h-px bg-gold/20 mb-6" />
                <p className="translit text-cream/70 text-sm italic leading-relaxed">{v.transliteration}</p>
                {idx < clusterVerses.length - 1 && (
                  <div className="mt-10 h-px bg-gold/10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-14 bg-gradient-to-b from-dark to-surface" aria-hidden="true" />

      <section className="bg-surface py-12 sm:py-16 px-6 overflow-hidden">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-muted text-sm italic mb-2 font-[family-name:var(--font-display)]">{t("daily.translationDivider")}</p>
          <svg className="mb-2 h-12 w-12 text-gold/40 select-none" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9.4 5C5.9 5 3 7.9 3 11.4V19h7.4v-7.6H7c0-1.5 1.2-2.7 2.7-2.7H10V5zM20.4 5C16.9 5 14 7.9 14 11.4V19h7.4v-7.6H18c0-1.5 1.2-2.7 2.7-2.7H21V5z"/></svg>
          {clusterVerses.map((v, idx) => (
            <div key={v.ayah}>
              {clusterVerses.length > 1 && (
                <p className="text-muted font-mono text-xs mb-2">{v.surah}:{v.ayah}</p>
              )}
              <blockquote className={`text-ink text-2xl sm:text-3xl font-[family-name:var(--font-display)] font-light italic leading-relaxed ${idx < clusterVerses.length - 1 ? "mb-6" : "mb-8"}`}>
                {v.translation}
              </blockquote>
            </div>
          ))}
          {verseCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {verseCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/browse?category=${cat.slug}`}
                  className="px-3 py-1 rounded-full border border-dark/20 text-muted hover:border-gold hover:text-heading text-xs uppercase tracking-wider transition-colors"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="h-14 bg-gradient-to-b from-surface to-primary-dark" aria-hidden="true" />

      <section className="bg-primary-dark py-12 sm:py-16 px-6 overflow-hidden">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gold-light text-sm italic mb-6 font-[family-name:var(--font-display)]">
            {t("daily.theLesson")}
          </p>
          <p className="text-cream/80 text-xl sm:text-2xl font-[family-name:var(--font-display)] font-light leading-relaxed">
            {cluster?.lesson ?? verse.lessonTitle ?? t("daily.applicationFallback")}
          </p>
        </div>
      </section>

      <section className="bg-dark py-12 sm:py-16 px-6 overflow-hidden">
        <div className="max-w-xl mx-auto">
          <p className="text-gold-light text-sm italic mb-6 font-[family-name:var(--font-display)] text-center">
            {t("daily.howToApply")}
          </p>
          <div className="border-l-2 border-gold/40 pl-6">
            <p className="text-cream/80 text-lg sm:text-xl font-[family-name:var(--font-display)] font-light leading-relaxed">
              {verse.application ?? t("daily.applicationFallback")}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-dark py-12 sm:py-16 px-6 overflow-hidden">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/verse/${verse.surah}/${verse.ayah}`}
            className="px-6 py-3 bg-gold hover:bg-gold-light text-dark font-semibold rounded-full transition-colors text-center"
          >
            {t("daily.readTafseer")}
          </Link>
          {verse.categories[0] && (
            <Link
              href={`/browse?category=${verse.categories[0]}`}
              className="px-6 py-3 border border-gold/40 text-gold-light hover:bg-gold/10 rounded-full transition-colors text-center"
            >
              {t("daily.browseRelated")}
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
