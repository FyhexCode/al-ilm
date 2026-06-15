"use client";

import Link from "next/link";
import type { Verse } from "@/lib/types";
import ArabicText from "./ArabicText";

interface Props {
  verse: Verse;
}

export default function DailyLesson({ verse }: Props) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const lessonText = verse.lessonTitle ?? verse.translation.slice(0, 80);

  return (
    <>
      {/* Hero */}
      <section className="hero-pattern relative min-h-svh flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark/40 via-dark/60 to-dark pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-8">
          <span className="text-gold text-7xl sm:text-8xl font-[family-name:var(--font-amiri)] leading-none" aria-label="Bismillah ir-Rahman ir-Rahim">
            ﷽
          </span>
          <div className="flex flex-col items-center gap-2">
            <p className="text-gold text-xs tracking-[0.2em] uppercase font-medium">
              Lesson of the Day
            </p>
            <p className="text-cream/40 text-xs tracking-widest uppercase">
              {today}
            </p>
          </div>
        </div>

        <div
          className="absolute left-1/2 -translate-x-1/2 text-cream/30 animate-bounce text-xl select-none"
          style={{ bottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}
        >
          ↓
        </div>
      </section>

      {/* Lesson title — scrolls normally then sticks below the navbar */}
      <div className="sticky top-16 z-10 bg-dark py-6 px-6">
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
          <p className="text-gold/60 text-2xl font-[family-name:var(--font-amiri)]">
            {verse.surahNameAr}
          </p>
        </div>
      </section>

      <section className="bg-primary-dark py-20 px-6 overflow-hidden">
        <div className="max-w-2xl mx-auto text-center">
          <ArabicText text={verse.arabic} size="xl" align="center" className="text-cream mb-8" />
          <div className="h-px bg-gold/20 mb-6" />
          <p className="text-cream/50 text-sm italic leading-relaxed">{verse.transliteration}</p>
        </div>
      </section>

      <div className="h-24 bg-gradient-to-b from-dark to-cream" aria-hidden="true" />

      <section className="bg-cream py-20 px-6 overflow-hidden">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-dark/50 text-sm italic mb-6 font-[family-name:var(--font-display)]">— Translation —</p>
          <blockquote className="text-dark text-xl sm:text-2xl font-light leading-relaxed mb-8">
            &ldquo;{verse.translation}&rdquo;
          </blockquote>
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
          <p className="text-gold/60 text-xs tracking-widest uppercase mb-6">
            How to apply this today
          </p>
          <p className="text-cream/80 text-lg sm:text-xl leading-relaxed">
            {verse.application ??
              "Reflect on this verse throughout your day and consider how its wisdom applies to your current circumstances."}
          </p>
        </div>
      </section>

      <section className="bg-dark py-20 px-6 overflow-hidden">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/verse/${verse.surah}/${verse.ayah}`}
            className="px-6 py-3 bg-gold hover:bg-gold-light text-dark font-semibold rounded-full transition-colors text-center"
          >
            Read Full Tafseer
          </Link>
          {verse.categories[0] && (
            <Link
              href={`/browse?category=${verse.categories[0]}`}
              className="px-6 py-3 border border-gold/40 text-gold hover:bg-gold/10 rounded-full transition-colors text-center"
            >
              Browse Related
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
