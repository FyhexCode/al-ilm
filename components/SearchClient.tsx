"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { useT } from "@/lib/i18n/useT";
import type { SearchHit } from "@/lib/search";

const DEBOUNCE_MS = 250;

export default function SearchClient() {
  const t = useT();
  const { locale } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";

  const [input, setInput] = useState(urlQuery);
  const [results, setResults] = useState<SearchHit[]>([]);
  const [searchedFor, setSearchedFor] = useState("");
  const query = input.trim();

  // Keep the URL shareable.
  useEffect(() => {
    const id = setTimeout(() => {
      if (query !== urlQuery) {
        router.replace(query ? `${pathname}?q=${encodeURIComponent(query)}` : pathname, {
          scroll: false,
        });
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [query, urlQuery, router, pathname]);

  // Debounced fetch; aborts the previous request when the query changes.
  useEffect(() => {
    if (query.length < 2) return;
    const controller = new AbortController();
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&locale=${locale}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = (await res.json()) as { results: SearchHit[] };
        setResults(data.results);
        setSearchedFor(query);
      } catch {
        // aborted or offline — keep previous results
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, [query, locale]);

  const active = query.length >= 2;
  const settled = active && searchedFor === query;

  return (
    <>
      <h1 className="text-3xl font-bold text-primary mb-6">{t("search.title")}</h1>
      <input
        type="search"
        autoFocus
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t("search.placeholder")}
        aria-label={t("search.title")}
        className="w-full rounded-full border border-gold/40 bg-cream-dark px-5 py-3 text-base text-dark placeholder:text-dark/40 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
      />

      <div aria-live="polite" className="mt-6">
        {!active && <p className="text-dark/50 text-sm">{t("search.hint")}</p>}
        {settled && results.length === 0 && (
          <p className="text-dark/50 text-sm">{t("search.noResults", { query })}</p>
        )}
        {settled && results.length > 0 && (
          <p className="text-dark/50 text-sm mb-4">{t("search.count", { count: results.length })}</p>
        )}
      </div>

      {active && (
        <ul className="space-y-3">
          {results.map((hit) => (
            <li key={`${hit.surah}:${hit.ayah}`}>
              <Link
                href={`/verse/${hit.surah}/${hit.ayah}`}
                className="block rounded-2xl border border-gold/25 p-4 hover:border-gold hover:bg-cream-dark transition-colors"
              >
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
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
