"use client";

import { useT } from "@/lib/i18n/useT";

export default function Footer() {
  const t = useT();
  return (
    <footer className="bg-dark text-cream/60 text-center text-sm py-6">
      <p>{t("footer.tagline")}</p>
    </footer>
  );
}
