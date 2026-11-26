"use client";

import { useT } from "@/lib/i18n/useT";

/** First tab stop: lets keyboard users jump past the navbar to the page content. */
export default function SkipLink() {
  const t = useT();
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:font-semibold focus:text-dark"
    >
      {t("nav.skip")}
    </a>
  );
}
