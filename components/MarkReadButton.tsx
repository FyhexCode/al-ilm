"use client";

import { useProgress } from "@/lib/progress";
import { useT } from "@/lib/i18n/useT";

export default function MarkReadButton({ surah }: { surah: number }) {
  const t = useT();
  const { isRead, toggleRead } = useProgress();
  const done = isRead(surah);

  return (
    <button
      onClick={() => toggleRead(surah)}
      aria-pressed={done}
      className={`w-full rounded-2xl border px-5 py-4 text-sm font-semibold transition-colors cursor-pointer ${
        done
          ? "bg-primary text-cream border-primary hover:bg-primary-light"
          : "bg-surface-2 text-heading border-gold/30 hover:border-gold hover:bg-gold/10"
      }`}
    >
      {done ? `✓ ${t("progress.markedRead")}` : t("progress.markRead")}
    </button>
  );
}
