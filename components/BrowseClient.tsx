"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LessonCard from "./LessonCard";
import type { LessonGroup } from "@/lib/getLessons";
import type { Category } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { useT } from "@/lib/i18n/useT";
import { localizeCategory } from "@/lib/i18n/pick";

interface BrowseClientProps {
  lessons: LessonGroup[];
  categories: Category[];
}

const SORT_KEYS = ["order", "reverse", "longest", "shortest"] as const;
type SortKey = (typeof SORT_KEYS)[number];

const SORT_LABELS = {
  order: "browse.sort.order",
  reverse: "browse.sort.reverse",
  longest: "browse.sort.longest",
  shortest: "browse.sort.shortest",
} as const;

const SORTERS: Record<SortKey, (a: LessonGroup, b: LessonGroup) => number> = {
  order: (a, b) => a.surah - b.surah,
  reverse: (a, b) => b.surah - a.surah,
  longest: (a, b) => b.verses.length - a.verses.length || a.surah - b.surah,
  shortest: (a, b) => a.verses.length - b.verses.length || a.surah - b.surah,
};

export default function BrowseClient({ lessons, categories }: BrowseClientProps) {
  const { locale } = useLanguage();
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // URL is the source of truth so filters are shareable and survive back/refresh.
  const requested = searchParams.get("category");
  const active =
    requested && categories.some((c) => c.slug === requested) ? requested : "all";

  const requestedSort = searchParams.get("sort");
  const sort: SortKey = SORT_KEYS.find((k) => k === requestedSort) ?? "order";

  function navigate(category: string, nextSort: SortKey) {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (nextSort !== "order") params.set("sort", nextSort);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }
  const setActive = (slug: string) => navigate(slug, sort);

  const localizedCategories = useMemo(
    () => categories.map((c) => localizeCategory(c, locale)),
    [categories, locale]
  );

  const filtered = useMemo(() => {
    const list = active === "all" ? lessons : lessons.filter((l) => l.categories.includes(active));
    return [...list].sort(SORTERS[sort]);
  }, [lessons, active, sort]);

  const activeLabel = localizedCategories.find((c) => c.slug === active)?.label;
  const lessonWord = filtered.length === 1 ? t("common.lesson") : t("common.lessons");

  return (
    <>
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActive("all")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
            active === "all"
              ? "bg-gold text-dark shadow-md"
              : "bg-surface-2 text-heading border border-gold/30 hover:border-gold hover:bg-gold/10"
          }`}
        >
          {t("browse.allLessons")}
        </button>
        {localizedCategories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActive(cat.slug)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
              active === cat.slug
                ? "bg-gold text-dark shadow-md"
                : "bg-surface-2 text-heading border border-gold/30 hover:border-gold hover:bg-gold/10"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Result count + sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-6 mb-4">
      <p className="text-sm text-ink/50">
        {t("browse.showing")}{" "}
        <span className="font-semibold text-heading">{filtered.length}</span>{" "}
        {lessonWord}
        {active !== "all" && activeLabel && (
          <>
            {" "}{t("common.in")}{" "}
            <span className="font-semibold text-heading">{activeLabel}</span>
          </>
        )}
      </p>
        <label className="flex items-center gap-2 text-sm text-ink/50">
          {t("browse.sortBy")}
          <select
            value={sort}
            onChange={(e) => navigate(active, e.target.value as SortKey)}
            className="rounded-full border border-gold/30 bg-surface-2 text-heading px-3 py-1.5 text-sm cursor-pointer focus:outline-none focus:border-gold"
          >
            {SORT_KEYS.map((key) => (
              <option key={key} value={key}>
                {t(SORT_LABELS[key])}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-ink/50 text-sm py-12">{t("browse.empty")}</p>
      )}

      {/* Lesson grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </div>
    </>
  );
}
