"use client";

import { useT } from "@/lib/i18n/useT";

export default function JuzCountNote({ count }: { count: number }) {
  const t = useT();
  return (
    <div className="bg-primary-dark text-center py-8">
      <p className="text-cream/60 text-sm">
        <span className="text-gold font-bold text-lg">{count}</span> {t("home.versesLabel")}{" "}
        <span className="text-gold font-bold text-lg">{t("home.juzLabel")}</span> — {t("home.surahRange")}
      </p>
      <p className="text-cream/30 text-xs mt-1">{t("home.moreJuz")}</p>
    </div>
  );
}
