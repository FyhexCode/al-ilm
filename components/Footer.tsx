"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/useT";

export default function Footer() {
  const t = useT();
  return (
    <footer className="bg-dark text-cream/60 text-center text-sm py-6">
      <nav className="flex justify-center gap-5 mb-3" aria-label="Footer">
        {/* Plain <a>: /random is a redirecting route handler, not a page to prefetch. */}
        <a href="/random" className="hover:text-cream transition-colors">{t("nav.random")}</a>
        <Link href="/saved" className="hover:text-cream transition-colors">{t("nav.saved")}</Link>
        <Link href="/search" className="hover:text-cream transition-colors">{t("nav.search")}</Link>
      </nav>
      <p>{t("footer.tagline")}</p>
    </footer>
  );
}
