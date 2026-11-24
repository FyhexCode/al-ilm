"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useBookmarks } from "@/lib/bookmarks";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { useT } from "@/lib/i18n/useT";
import type { SearchHit } from "@/lib/search";

export default function SavedClient() {
  const t = useT();
  const { locale } = useLanguage();
  const { ids, toggle } = useBookmarks();
  const [verses, setVerses] = useState<SearchHit[]>([]);
  const idsKey = ids.join(",");

  useEffect(() => {
    if (!idsKey) return;
    const controller = new AbortController();
    fetch(`/api/verses?ids=${encodeURIComponent(idsKey)}&locale=${locale}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { results: SearchHit[] } | null) => data && setVerses(data.results))
      .catch(() => {
        // aborted or offline — keep what we have
      });
    return () => controller.abort();
  }, [idsKey, locale]);

  // Drop removed bookmarks immediately; the refetch only supplies text for new ones.
  const visible = verses.filter((v) => ids.includes(`${v.surah}:${v.ayah}`));

  return (
    <>
      <h1 className="text-3xl font-bold text-primary mb-6">{t("saved.title")}</h1>

      {ids.length === 0 && (
        <div className="text-center py-16">
          <p className="text-dark/50 text-sm mb-4">{t("saved.empty")}</p>
          <Link
            href="/browse"
            className="inline-block px-5 py-2.5 bg-gold hover:bg-gold-light text-dark font-semibold rounded-full transition-colors text-sm"
          >
            {t("nav.explore")}
          </Link>
        </div>
      )}

      <ul className="space-y-3">
        {visible.map((hit) => (
          <li
            key={`${hit.surah}:${hit.ayah}`}
            className="flex items-start gap-3 rounded-2xl border border-gold/25 p-4 hover:border-gold transition-colors"
          >
            <Link href={`/verse/${hit.surah}/${hit.ayah}`} className="flex-1 min-w-0">
              <span className="text-gold font-mono text-xs">
                {hit.surahName} {hit.surah}:{hit.ayah}
              </span>
              {hit.takeaway && (
                <span className="block text-primary text-sm font-medium mt-1">{hit.takeaway}</span>
              )}
              <span className="block text-dark/70 text-sm leading-relaxed mt-1 line-clamp-3">
                {hit.translation}
              </span>
            </Link>
            <button
              onClick={() => toggle(`${hit.surah}:${hit.ayah}`)}
              aria-label={t("saved.remove")}
              className="shrink-0 text-dark/40 hover:text-dark text-lg leading-none px-2 cursor-pointer"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
