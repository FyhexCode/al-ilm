"use client";

import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import ReadingControls from "./ReadingControls";
import { useT } from "@/lib/i18n/useT";

export default function Navbar() {
  const t = useT();

  return (
    <header className="sticky top-0 z-50 bg-dark/95 backdrop-blur-sm border-b border-gold/20">
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div>
            <span className="font-bold text-cream text-lg leading-none block whitespace-nowrap">Al-Ilm</span>
            <span className="text-gold-light text-[10px] tracking-widest uppercase leading-none block">
              العِلم
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ReadingControls />
          {/* Hidden on mobile — logo already links home */}
          <Link
            href="/"
            className="hidden sm:block px-4 py-2 text-sm text-cream/70 hover:text-cream hover:bg-white/5 rounded-lg transition-colors"
          >
            {t("nav.home")}
          </Link>
          <Link
            href="/saved"
            aria-label={t("nav.saved")}
            className="p-2 text-cream/70 hover:text-cream hover:bg-white/5 rounded-lg transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </Link>
          <Link
            href="/search"
            aria-label={t("nav.search")}
            className="p-2 text-cream/70 hover:text-cream hover:bg-white/5 rounded-lg transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>
          <Link
            href="/browse"
            className="ml-1 sm:ml-2 px-3 sm:px-4 py-2 text-sm bg-gold hover:bg-gold-light text-dark font-semibold rounded-full transition-colors"
          >
            {t("nav.explore")}
          </Link>
        </div>
      </nav>
    </header>
  );
}
