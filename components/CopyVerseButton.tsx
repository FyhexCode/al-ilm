"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/useT";

interface Props {
  arabic: string;
  translation: string;
  reference: string;
}

/** Copies the verse (Arabic + translation + reference) as plain text. */
export default function CopyVerseButton({ arabic, translation, reference }: Props) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = `${arabic}\n\n"${translation}"\n\n— ${reference}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked (insecure context / permissions) — nothing to confirm
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gold/40 text-sm text-gold hover:bg-gold/10 hover:border-gold transition-all duration-200 cursor-pointer"
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
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
      <span aria-live="polite">{copied ? t("copy.copied") : t("copy.copy")}</span>
    </button>
  );
}
