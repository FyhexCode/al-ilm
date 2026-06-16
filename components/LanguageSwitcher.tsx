"use client";

import { useLanguage } from "@/lib/i18n/useLanguage";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/types";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className="flex items-center rounded-full border border-gold/30 bg-white/5 p-0.5"
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((loc) => {
        const active = locale === loc;
        return (
          <button
            key={loc}
            onClick={() => setLocale(loc)}
            aria-pressed={active}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
              active
                ? "bg-gold text-dark"
                : "text-cream/60 hover:text-cream"
            }`}
          >
            {LOCALE_LABELS[loc]}
          </button>
        );
      })}
    </div>
  );
}
