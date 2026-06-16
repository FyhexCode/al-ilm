"use client";

import { useState } from "react";
import Link from "next/link";
import type { LessonGroup } from "@/lib/getLessons";
import type { Verse } from "@/lib/types";
import ArabicText from "./ArabicText";
import TafseerSection from "./TafseerSection";
import { CATEGORIES } from "@/data/categories";
import { buildClusterList } from "@/lib/getVerseClusters";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { useT } from "@/lib/i18n/useT";
import { localizeLesson, localizeCluster, localizeCategory, localizeVerse } from "@/lib/i18n/pick";

interface Props {
  lesson: LessonGroup;
  surahVerses: Verse[];
}

const TABS = ["Overview", "Verses", "Tafseer", "Surah"] as const;
type Tab = (typeof TABS)[number];
const TAB_KEYS = {
  Overview: "tab.overview",
  Verses: "tab.verses",
  Tafseer: "tab.tafseer",
  Surah: "tab.surah",
} as const;

export default function LessonDetail({ lesson: rawLesson, surahVerses: rawSurahVerses }: Props) {
  const { locale } = useLanguage();
  const t = useT();
  const [tab, setTab] = useState<Tab>("Overview");

  const lesson = localizeLesson(rawLesson, locale);
  const surahVerses = rawSurahVerses.map((v) => localizeVerse(v, locale));

  const lessonCats = CATEGORIES.filter((c) => lesson.categories.includes(c.slug));
  const tafseerVerse = lesson.verses.find((v) => v.tafseer !== null) ?? null;

  return (
    <div>
      {/* Sticky tab bar */}
      <div className="sticky top-16 z-20 bg-cream border-b border-gold/20">
        <div className="max-w-3xl mx-auto px-4 flex gap-0" role="tablist">
          {TABS.map((tabId) => (
            <button
              key={tabId}
              role="tab"
              aria-selected={tab === tabId}
              onClick={() => setTab(tabId)}
              className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px cursor-pointer ${
                tab === tabId
                  ? "border-gold text-primary"
                  : "border-transparent text-dark/50 hover:text-primary hover:border-gold/40"
              }`}
            >
              {t(TAB_KEYS[tabId])}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10" role="tabpanel">
        {tab === "Overview" && (
          <OverviewTab lesson={lesson} cats={lessonCats} />
        )}
        {tab === "Verses" && <VersesTab lesson={lesson} />}
        {tab === "Tafseer" && <TafseerTab verse={tafseerVerse} />}
        {tab === "Surah" && (
          <SurahTab lesson={lesson} surahVerses={surahVerses} />
        )}
      </div>
    </div>
  );
}

/* ── Overview ──────────────────────────────────────────────── */

function OverviewTab({
  lesson,
  cats,
}: {
  lesson: LessonGroup;
  cats: ReturnType<typeof CATEGORIES.filter>;
}) {
  const { locale } = useLanguage();
  const t = useT();
  const [openCluster, setOpenCluster] = useState<string | null>(null);

  const range =
    lesson.firstAyah === lesson.lastAyah
      ? `${lesson.surah}:${lesson.firstAyah}`
      : `${lesson.surah}:${lesson.firstAyah}–${lesson.lastAyah}`;

  const clusters = buildClusterList(
    lesson.surah,
    lesson.verses.map((v) => v.ayah)
  )
    .filter((c) => c.keyTakeaway)
    .map((c) => localizeCluster(c, locale));

  return (
    <div className="space-y-10">
      {/* Hero block */}
      <div className="bg-dark rounded-3xl hero-pattern overflow-hidden">
        <div className="relative z-10 p-8 sm:p-12 text-center">
          <p className="text-cream/20 text-4xl font-[family-name:var(--font-amiri)] mb-4">
            {lesson.surahNameAr}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-cream leading-tight mb-2">
            {lesson.surahName}
          </h1>
          <p className="text-cream/50 text-base mb-4">{lesson.surahNameTranslation}</p>
          <p className="gold-shimmer text-xs tracking-[0.2em] uppercase font-medium">{range}</p>
        </div>
      </div>

      {/* Cluster-based lessons — clickable to reveal lesson text */}
      {clusters.length > 0 && (
        <div>
          <p className="text-dark/40 text-xs tracking-widest uppercase mb-4">
            {t("lesson.lessonsInSurah")}
            <span className="ml-2 normal-case text-dark/30">{t("lesson.tapToApply")}</span>
          </p>
          <div className="rounded-2xl border border-gold/20 overflow-hidden divide-y divide-gold/10">
            {clusters.map((cluster) => {
              const key = cluster.ayahs.join("-");
              const isOpen = openCluster === key;
              const rangeLabel =
                cluster.ayahs.length > 1
                  ? `${lesson.surah}:${cluster.ayahs[0]}–${cluster.ayahs[cluster.ayahs.length - 1]}`
                  : `${lesson.surah}:${cluster.ayahs[0]}`;
              return (
                <div key={key}>
                  <button
                    onClick={() => setOpenCluster(isOpen ? null : key)}
                    aria-expanded={isOpen}
                    className="w-full flex items-start gap-3 px-5 py-3.5 text-left hover:bg-gold/5 transition-colors cursor-pointer"
                  >
                    <span className="text-gold font-mono text-xs shrink-0 mt-0.5 w-16">
                      {rangeLabel}
                    </span>
                    <p className={`text-sm flex-1 ${isOpen ? "text-primary font-medium" : "text-dark/80"}`}>
                      {cluster.keyTakeaway}
                    </p>
                    <span className="text-dark/30 text-xs shrink-0 mt-0.5">
                      {isOpen ? "▲" : "▼"}
                    </span>
                  </button>

                  {isOpen && cluster.lesson && (
                    <div className="px-5 pb-4 pt-1 bg-primary/5 border-t border-gold/10">
                      <p className="text-gold/60 text-xs tracking-widest uppercase mb-2">
                        {t("lesson.howToApply")}
                      </p>
                      <p className="text-dark/70 text-sm leading-relaxed">{cluster.lesson}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories */}
      {cats.length > 0 && (
        <div>
          <p className="text-dark/40 text-xs tracking-widest uppercase mb-3">{t("common.themes")}</p>
          <div className="flex flex-wrap gap-2">
            {cats.map((raw) => {
              const cat = localizeCategory(raw, locale);
              return (
                <Link
                  key={cat.slug}
                  href={`/browse?category=${cat.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-gold/15 text-gold-dark hover:bg-gold/25 transition-colors border border-gold/30"
                >
                  {cat.icon} {cat.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-cream-dark rounded-xl p-4 text-center border border-gold/15">
          <p className="text-2xl font-bold text-primary">{lesson.verses.length}</p>
          <p className="text-dark/50 text-xs mt-1">
            {lesson.verses.length === 1 ? t("common.verse") : t("common.verses")}
          </p>
        </div>
        <div className="bg-cream-dark rounded-xl p-4 text-center border border-gold/15">
          <p className="text-2xl font-bold text-primary">{cats.length}</p>
          <p className="text-dark/50 text-xs mt-1">
            {cats.length === 1 ? t("common.theme") : t("common.themes")}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Verses ────────────────────────────────────────────────── */

function VersesTab({ lesson }: { lesson: LessonGroup }) {
  const { locale } = useLanguage();
  const t = useT();
  const verseMap = new Map(lesson.verses.map((v) => [v.ayah, v]));
  const clusters = buildClusterList(
    lesson.surah,
    lesson.verses.map((v) => v.ayah)
  ).map((c) => localizeCluster(c, locale));

  return (
    <div className="space-y-6">
      <p className="text-dark/40 text-xs tracking-widest uppercase">
        {lesson.verses.length} {lesson.verses.length === 1 ? t("common.verse") : t("common.verses")} {t("common.in")} {lesson.surahName}
      </p>

      {clusters.map((cluster) => {
        const clusterVerses = cluster.ayahs.map((a) => verseMap.get(a)).filter(Boolean) as Verse[];
        const isGroup = cluster.ayahs.length > 1;
        const rangeLabel = isGroup
          ? `${lesson.surah}:${cluster.ayahs[0]}–${cluster.ayahs[cluster.ayahs.length - 1]}`
          : `${lesson.surah}:${cluster.ayahs[0]}`;

        return (
          <div
            key={cluster.ayahs.join("-")}
            className={`rounded-2xl border overflow-hidden ${
              isGroup ? "border-gold/30 bg-cream" : "border-gold/20 bg-cream"
            }`}
          >
            {/* Cluster header */}
            <div className="px-5 py-3 flex items-center justify-between bg-primary/5 border-b border-gold/15">
              <div className="flex items-center gap-2">
                <span className="text-gold font-mono text-xs font-semibold">{rangeLabel}</span>
                {isGroup && (
                  <span className="text-gold/50 text-xs bg-gold/10 px-2 py-0.5 rounded-full">
                    {t("lesson.connected")}
                  </span>
                )}
              </div>
              <Link
                href={`/verse/${lesson.surah}/${cluster.ayahs[0]}`}
                className="text-xs text-primary/50 hover:text-primary transition-colors"
              >
                {t("lesson.fullPage")}
              </Link>
            </div>

            {/* Verses in cluster */}
            {clusterVerses.map((verse, idx) => (
              <div key={verse.ayah}>
                {isGroup && (
                  <p className="text-gold/40 font-mono text-xs px-5 pt-4 pb-1">
                    {verse.surah}:{verse.ayah}
                  </p>
                )}
                <div className="px-5 py-4 bg-dark/3">
                  <ArabicText text={verse.arabic} size="md" align="right" className="text-dark/90" />
                </div>
                <div className="px-5 pt-2 pb-1">
                  <p className="text-xs italic text-primary/50 text-right">{verse.transliteration}</p>
                </div>
                <div className={`px-5 pb-4 pt-2 ${idx < clusterVerses.length - 1 ? "border-b border-gold/10" : ""}`}>
                  <p className="text-dark/80 text-sm leading-relaxed">
                    &ldquo;{verse.translation}&rdquo;
                  </p>
                </div>
              </div>
            ))}

            {/* Key takeaway + lesson */}
            {cluster.keyTakeaway && (
              <div className="px-5 py-4 border-t border-gold/15 bg-gold/5">
                <p className="text-gold text-xs uppercase tracking-wider mb-1.5">{t("lesson.keyTakeaway")}</p>
                <p className="text-primary text-sm font-medium leading-snug mb-3">
                  {cluster.keyTakeaway}
                </p>
                {cluster.lesson && (
                  <>
                    <p className="text-gold/60 text-xs uppercase tracking-wider mb-1.5">{t("lesson.lessonLabel")}</p>
                    <p className="text-dark/70 text-sm leading-relaxed">{cluster.lesson}</p>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Tafseer ───────────────────────────────────────────────── */

function TafseerTab({ verse }: { verse: Verse | null }) {
  const t = useT();
  if (!verse) {
    return (
      <div className="text-center py-16">
        <p className="text-dark/30 text-4xl mb-4">📖</p>
        <p className="text-dark/50 text-sm">{t("lesson.noTafseer")}</p>
      </div>
    );
  }

  return (
    <TafseerSection
      tafseer={verse.tafseer!}
      tafseerSummary={verse.tafseerSummary}
      groupStart={verse.tafseerGroup}
      groupEnd={verse.tafseerGroupEnd}
      verseCount={verse.tafseerVerseCount}
      surahName={verse.surahName}
    />
  );
}

/* ── Surah ─────────────────────────────────────────────────── */

function SurahTab({
  lesson,
  surahVerses,
}: {
  lesson: LessonGroup;
  surahVerses: Verse[];
}) {
  const t = useT();
  const lessonAyahs = new Set(lesson.verses.map((v) => v.ayah));
  const first = surahVerses[0];
  if (!first) return null;

  return (
    <div className="space-y-8">
      {/* Surah intro */}
      <div className="bg-dark rounded-2xl p-7 text-center">
        <p className="text-cream/25 text-4xl font-[family-name:var(--font-amiri)] mb-3">
          {first.surahNameAr}
        </p>
        <p className="text-cream text-xl font-bold mb-1">{first.surahName}</p>
        <p className="text-cream/50 text-sm mb-4">{first.surahNameTranslation}</p>
        <div className="flex justify-center gap-6 text-xs text-cream/30">
          <span>{t("lesson.surahWord")} {first.surah}</span>
          <span>·</span>
          <span>{surahVerses.length} {t("common.verses")}</span>
          <span>·</span>
          <span>{t("lesson.juzWord")} {first.juz}</span>
        </div>
      </div>

      {/* Verse list */}
      <div>
        <p className="text-dark/40 text-xs tracking-widest uppercase mb-3">{t("lesson.allVerses")}</p>
        <div className="space-y-0.5">
          {surahVerses.map((verse) => {
            const isInLesson = lessonAyahs.has(verse.ayah);
            return (
              <Link
                key={verse.ayah}
                href={`/verse/${verse.surah}/${verse.ayah}`}
                className={`flex items-start gap-4 px-4 py-3 rounded-xl transition-colors hover:bg-cream-dark ${
                  isInLesson ? "border-l-2 border-gold bg-gold/5" : "border-l-2 border-transparent"
                }`}
              >
                <span
                  className={`font-mono text-xs shrink-0 mt-0.5 ${
                    isInLesson ? "text-gold font-semibold" : "text-dark/30"
                  }`}
                >
                  {verse.ayah}
                </span>
                <p
                  className={`text-sm leading-relaxed line-clamp-2 ${
                    isInLesson ? "text-dark/80 font-medium" : "text-dark/50"
                  }`}
                >
                  {verse.translation}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
