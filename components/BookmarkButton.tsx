"use client";

import { bookmarkId, useBookmarks } from "@/lib/bookmarks";
import { useT } from "@/lib/i18n/useT";

export default function BookmarkButton({ surah, ayah }: { surah: number; ayah: number }) {
  const t = useT();
  const { isSaved, toggle } = useBookmarks();
  const id = bookmarkId(surah, ayah);
  const saved = isSaved(id);

  return (
    <button
      onClick={() => toggle(id)}
      aria-pressed={saved}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm transition-all duration-200 cursor-pointer ${
        saved
          ? "bg-gold text-dark border-gold"
          : "border-gold/40 text-gold-ink hover:bg-gold/10 hover:border-gold"
      }`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {saved ? t("saved.saved") : t("saved.save")}
    </button>
  );
}
