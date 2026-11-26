"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useJournal } from "@/lib/journal";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { useT } from "@/lib/i18n/useT";
import type { SearchHit } from "@/lib/search";

export default function JournalClient() {
  const t = useT();
  const { locale } = useLanguage();
  const { notes, setNote } = useJournal();
  const [verses, setVerses] = useState<SearchHit[]>([]);
  const idsKey = Object.keys(notes).join(",");

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

  // Verse order (the API already sorts); drop entries whose note was just deleted.
  const entries = verses.filter((v) => notes[`${v.surah}:${v.ayah}`] !== undefined);

  function exportNotes() {
    const text = entries
      .map((v) => `${v.surahName} ${v.surah}:${v.ayah}\n${notes[`${v.surah}:${v.ayah}`]}`)
      .join("\n\n---\n\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "al-ilm-journal.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h1 className="text-3xl font-bold text-heading">{t("journal.title")}</h1>
        {entries.length > 0 && (
          <button
            onClick={exportNotes}
            className="px-4 py-2 rounded-full border border-gold/40 text-sm text-gold-ink hover:bg-gold/10 hover:border-gold transition-colors cursor-pointer"
          >
            {t("journal.export")}
          </button>
        )}
      </div>
      <p className="text-muted text-sm mb-6">{t("journal.privacy")}</p>

      {idsKey === "" && (
        <div className="text-center py-16">
          <p className="text-muted text-sm mb-4">{t("journal.empty")}</p>
          <Link
            href="/browse"
            className="inline-block px-5 py-2.5 bg-gold hover:bg-gold-light text-dark font-semibold rounded-full transition-colors text-sm"
          >
            {t("nav.explore")}
          </Link>
        </div>
      )}

      <ul className="space-y-3">
        {entries.map((hit) => {
          const id = `${hit.surah}:${hit.ayah}`;
          return (
            <li key={id} className="rounded-2xl border border-gold/25 p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <Link
                  href={`/verse/${hit.surah}/${hit.ayah}`}
                  className="text-gold-ink font-mono text-xs hover:underline"
                >
                  {hit.surahName} {hit.surah}:{hit.ayah}
                </Link>
                <button
                  onClick={() => setNote(id, "")}
                  aria-label={t("journal.remove")}
                  className="shrink-0 text-muted hover:text-ink text-lg leading-none px-1 cursor-pointer"
                >
                  ×
                </button>
              </div>
              <p className="text-muted text-xs italic line-clamp-2 mb-2">{hit.translation}</p>
              <p className="text-ink text-sm leading-relaxed whitespace-pre-wrap">{notes[id]}</p>
            </li>
          );
        })}
      </ul>
    </>
  );
}
