"use client";

import { useEffect, useRef, useState } from "react";
import { ARABIC_SCALES, useReadingPrefs, type Theme } from "@/lib/readingPrefs";
import { useT } from "@/lib/i18n/useT";

const THEMES: Theme[] = ["auto", "light", "dark"];

/** Navbar "Aa" menu: Arabic text size + transliteration toggle. Also applies the prefs to <html>. */
export default function ReadingControls() {
  const t = useT();
  const { prefs, update } = useReadingPrefs();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Expose prefs to CSS (see globals.css: --arabic-scale, [data-translit]).
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--arabic-scale", String(ARABIC_SCALES[prefs.arabicSize]));
    root.dataset.translit = prefs.showTransliteration ? "on" : "off";
    if (prefs.theme === "auto") delete root.dataset.theme;
    else root.dataset.theme = prefs.theme;
  }, [prefs]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus(); // hand focus back so keyboard users do not lose their place
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onBlur={(e) => {
        // Tabbing out of the menu closes it.
        if (open && !rootRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={t("reading.title")}
        className="px-2 py-2 text-sm font-semibold text-cream/70 hover:text-cream hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
      >
        Aa
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-gold/30 bg-dark p-4 shadow-xl z-50">
          <p className="text-cream/70 text-xs uppercase tracking-widest mb-2">{t("reading.arabicSize")}</p>
          <div className="flex gap-1.5 mb-4" role="group" aria-label={t("reading.arabicSize")}>
            {ARABIC_SCALES.map((_, i) => (
              <button
                key={i}
                onClick={() => update({ arabicSize: i })}
                aria-pressed={prefs.arabicSize === i}
                aria-label={`${t("reading.arabicSize")} ${i + 1}`}
                className={`flex-1 rounded-lg py-1.5 font-[family-name:var(--font-amiri)] cursor-pointer transition-colors ${
                  prefs.arabicSize === i
                    ? "bg-gold text-dark"
                    : "bg-white/5 text-cream/70 hover:bg-white/10"
                }`}
                style={{ fontSize: `${0.9 + i * 0.25}rem` }}
              >
                ع
              </button>
            ))}
          </div>

          <p className="text-cream/70 text-xs uppercase tracking-widest mb-2">{t("reading.theme")}</p>
          <div className="flex gap-1.5 mb-4" role="group" aria-label={t("reading.theme")}>
            {THEMES.map((theme) => (
              <button
                key={theme}
                onClick={() => update({ theme })}
                aria-pressed={prefs.theme === theme}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                  prefs.theme === theme
                    ? "bg-gold text-dark"
                    : "bg-white/5 text-cream/70 hover:bg-white/10"
                }`}
              >
                {t(`theme.${theme}` as const)}
              </button>
            ))}
          </div>

          <label className="flex items-center justify-between gap-3 text-sm text-cream/80 cursor-pointer">
            {t("reading.transliteration")}
            <input
              type="checkbox"
              checked={prefs.showTransliteration}
              onChange={(e) => update({ showTransliteration: e.target.checked })}
              className="h-4 w-4 accent-[#c9a347] cursor-pointer"
            />
          </label>
        </div>
      )}
    </div>
  );
}
