"use client";

import Link from "next/link";
import type { Verse, VerseCluster } from "@/lib/types";
import ArabicText from "./ArabicText";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { useT } from "@/lib/i18n/useT";
import { localizeVerse, localizeCluster } from "@/lib/i18n/pick";

interface Props {
  verse: Verse;
  clusterVerses: Verse[];
  cluster: VerseCluster | null;
}

export default function DailyLesson({ verse: rawVerse, clusterVerses: rawClusterVerses, cluster: rawCluster }: Props) {
  const { locale } = useLanguage();
  const t = useT();

  const verse = localizeVerse(rawVerse, locale);
  const clusterVerses = rawClusterVerses.map((v) => localizeVerse(v, locale));
  const cluster = rawCluster ? localizeCluster(rawCluster, locale) : null;

  const today = new Date().toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const lessonText = cluster?.keyTakeaway ?? verse.lessonTitle ?? verse.translation.slice(0, 80);

  return (
    <>
      {/* Hero */}
      <section className="hero-pattern relative min-h-svh flex flex-col items-center justify-center px-6 text-center overflow-hidden">
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
              className="text-gold text-4xl sm:text-6xl font-[family-name:var(--font-amiri)] leading-[1.6] whitespace-nowrap"
              aria-label="Bismillah ir-Rahman ir-Rahim"
            >
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="gold-shimmer text-xs tracking-[0.2em] uppercase font-medium text-center">
              {t("daily.ofTheDay")}
            </p>
            <p className="text-cream/40 text-xs tracking-[0.1em] uppercase text-center">
              {today}
            </p>
          </div>

        </div>

        <div
          className="absolute left-1/2 -translate-x-1/2 select-none"
          style={{ bottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <span className="text-gold/40 text-2xl font-[family-name:var(--font-amiri)] motion-safe:animate-bounce" aria-hidden="true">۝</span>
        </div>
      </section>

      {/* Lesson title — scrolls normally then sticks below the navbar */}
      <div className="sticky top-16 z-10 bg-dark border-b border-gold/10 py-6 px-6">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold text-cream leading-tight text-center max-w-3xl mx-auto font-[family-name:var(--font-display)]">
          {lessonText}
        </h1>
      </div>

      {/* Detail sections */}
      <section className="bg-primary-dark py-20 px-6 overflow-hidden">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-cream text-2xl sm:text-3xl font-semibold mb-1 font-[family-name:var(--font-display)]">{verse.surahName}</p>
          <p className="text-cream/50 text-sm mb-4">{verse.surahNameTranslation}</p>
          <p className="text-gold font-mono text-sm tracking-wider mb-6">
            {verse.surah}:{verse.ayah}
          </p>
          <p className="text-gold/60 text-2xl font-[family-name:var(--font-amiri)] mb-16">
            {verse.surahNameAr}
          </p>

          <div className="h-px bg-gold/10 mb-16" />

          <div className="space-y-10">
            {clusterVerses.map((v, idx) => (
              <div key={v.ayah}>
                {clusterVerses.length > 1 && (
                  <p className="text-gold/40 font-mono text-xs mb-4">{v.surah}:{v.ayah}</p>
                )}
                <ArabicText text={v.arabic} size="xl" align="center" className="text-cream mb-8" />
                <div className="h-px bg-gold/20 mb-6" />
                <p className="text-cream/50 text-sm italic leading-relaxed">{v.transliteration}</p>
                {idx < clusterVerses.length - 1 && (
                  <div className="mt-10 h-px bg-gold/10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-24 bg-gradient-to-b from-dark to-cream" aria-hidden="true" />

      <section className="bg-cream py-20 px-6 overflow-hidden">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-dark/50 text-sm italic mb-2 font-[family-name:var(--font-display)]">{t("daily.translationDivider")}</p>
          <p className="text-8xl text-gold/20 font-[family-name:var(--font-display)] leading-none mb-2 select-none text-left" aria-hidden="true">&ldquo;</p>
          {clusterVerses.map((v, idx) => (
            <div key={v.ayah}>
              {clusterVerses.length > 1 && (
                <p className="text-dark/30 font-mono text-xs mb-2">{v.surah}:{v.ayah}</p>
              )}
              <blockquote className={`text-dark text-2xl sm:text-3xl font-[family-name:var(--font-display)] font-light italic leading-relaxed ${idx < clusterVerses.length - 1 ? "mb-6" : "mb-8"}`}>
                {v.translation}
              </blockquote>
            </div>
          ))}
          {verse.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {verse.categories.map((cat) => (
                <span
                  key={cat}
                  className="px-3 py-1 rounded-full border border-dark/20 text-dark/60 text-xs uppercase tracking-wider"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="h-24 bg-gradient-to-b from-cream to-primary-dark" aria-hidden="true" />

      <section className="bg-primary-dark py-20 px-6 overflow-hidden">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gold/50 text-sm italic mb-6 font-[family-name:var(--font-display)]">
            {t("daily.theLesson")}
          </p>
          <p className="text-cream/80 text-xl sm:text-2xl font-[family-name:var(--font-display)] font-light leading-relaxed">
            {cluster?.lesson ?? verse.lessonTitle ?? t("daily.applicationFallback")}
          </p>
        </div>
      </section>

      <section className="bg-dark py-20 px-6 overflow-hidden">
        <div className="max-w-xl mx-auto">
          <p className="text-gold/50 text-sm italic mb-6 font-[family-name:var(--font-display)] text-center">
            {t("daily.howToApply")}
          </p>
          <div className="border-l-2 border-gold/40 pl-6">
            <p className="text-cream/80 text-lg sm:text-xl font-[family-name:var(--font-display)] font-light leading-relaxed">
              {verse.application ?? t("daily.applicationFallback")}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-dark py-20 px-6 overflow-hidden">
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
              className="px-6 py-3 border border-gold/40 text-gold hover:bg-gold/10 rounded-full transition-colors text-center"
            >
              {t("daily.browseRelated")}
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
