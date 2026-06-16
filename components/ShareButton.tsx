"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/useT";

export default function ShareButton({ surah, ayah }: { surah: number; ayah: number }) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const url = `${window.location.origin}/verse/${surah}/${ayah}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gold/40 text-sm text-gold hover:bg-gold/10 hover:border-gold transition-all duration-200"
    >
      {copied ? (
        <>{t("share.copied")}</>
      ) : (
        <>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          {t("share.share")}
        </>
      )}
    </button>
  );
}
