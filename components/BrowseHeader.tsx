"use client";

import { useProgress } from "@/lib/progress";
import { useT } from "@/lib/i18n/useT";

export default function BrowseHeader({ count }: { count: number }) {
  const t = useT();
  const { readSurahs, streak } = useProgress();
  const readCount = Math.min(readSurahs.length, count);
  const percent = count > 0 ? Math.round((readCount / count) * 100) : 0;

  return (
    <div className="mb-10">
      <h1 className="text-4xl font-bold text-heading mb-2">{t("browse.title")}</h1>
      <div className="w-16 h-1 bg-gold rounded-full mb-4" />
      <p className="text-ink/60">{t("browse.subtitle", { count })}</p>

      <div className="mt-6 max-w-md">
        <div className="flex items-center justify-between text-sm text-ink/60 mb-2">
          <span>{t("progress.summary", { read: readCount, total: count })}</span>
          {streak > 0 && <span className="text-gold-dark font-medium">🔥 {t("progress.streak", { count: streak })}</span>}
        </div>
        <div
          className="h-2 rounded-full bg-gold/15 overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={count}
          aria-valuenow={readCount}
          aria-label={t("progress.summary", { read: readCount, total: count })}
        >
          <div className="h-full bg-gold transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}
