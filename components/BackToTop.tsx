"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/useT";

const SHOW_AFTER_PX = 900;

export default function BackToTop() {
  const t = useT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0 })}
      aria-label={t("nav.backToTop")}
      className="fixed bottom-5 right-5 z-40 h-11 w-11 rounded-full bg-gold text-dark shadow-lg hover:bg-gold-light transition-colors cursor-pointer flex items-center justify-center"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}
