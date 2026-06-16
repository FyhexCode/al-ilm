"use client";

import { useT } from "@/lib/i18n/useT";

export default function BrowseHeader({ count }: { count: number }) {
  const t = useT();
  return (
    <div className="mb-10">
      <h1 className="text-4xl font-bold text-primary mb-2">{t("browse.title")}</h1>
      <div className="w-16 h-1 bg-gold rounded-full mb-4" />
      <p className="text-dark/60">{t("browse.subtitle", { count })}</p>
    </div>
  );
}
