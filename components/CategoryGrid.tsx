"use client";

import Link from "next/link";
import { CATEGORIES } from "@/data/categories";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { useT } from "@/lib/i18n/useT";
import { localizeCategory } from "@/lib/i18n/pick";

export default function CategoryGrid() {
  const { locale } = useLanguage();
  const t = useT();

  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-semibold text-primary mb-3 font-[family-name:var(--font-display)]">{t("categoryGrid.title")}</h2>
        <p className="text-dark/60 text-sm">
          {t("categoryGrid.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((raw) => {
          const cat = localizeCategory(raw, locale);
          return (
            <Link
              key={cat.slug}
              href={`/browse?category=${cat.slug}`}
              className="group flex flex-col items-center text-center gap-3 p-5 rounded-2xl bg-cream border border-gold/20 hover:border-gold hover:shadow-md hover:shadow-gold/10 transition-all duration-200"
            >
              {cat.icon && <span className="text-2xl" aria-hidden="true">{cat.icon}</span>}
              <span className="text-sm font-semibold text-primary">{cat.label}</span>
              <p className="text-xs text-dark/50 leading-relaxed hidden sm:block">
                {cat.description}
              </p>
            </Link>
          );
        })}

        {/* "All verses" card */}
        <Link
          href="/browse"
          className="group flex flex-col items-center text-center gap-3 p-5 rounded-2xl bg-primary hover:bg-primary-light border border-primary transition-all duration-200 hover:shadow-md"
        >
          <span className="text-2xl" aria-hidden="true">📚</span>
          <span className="text-sm font-semibold text-cream">{t("categoryGrid.allVerses")}</span>
          <p className="text-xs text-cream/60 leading-relaxed hidden sm:block">
            {t("categoryGrid.allVersesDesc")}
          </p>
        </Link>
      </div>
    </section>
  );
}
