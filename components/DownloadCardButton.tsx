"use client";

import { useLanguage } from "@/lib/i18n/useLanguage";
import { useT } from "@/lib/i18n/useT";

/** Downloads the server-rendered verse card (PNG) in the reader's language. */
export default function DownloadCardButton({ surah, ayah }: { surah: number; ayah: number }) {
  const t = useT();
  const { locale } = useLanguage();

  return (
    <a
      href={`/og/${surah}/${ayah}?lang=${locale}`}
      download={`al-ilm-${surah}-${ayah}.png`}
      className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gold/40 text-sm text-gold hover:bg-gold/10 hover:border-gold transition-all duration-200"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {t("card.download")}
    </a>
  );
}
