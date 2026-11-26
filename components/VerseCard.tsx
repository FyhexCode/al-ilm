import Link from "next/link";
import ArabicText from "./ArabicText";
import type { Verse } from "@/lib/types";
import { CATEGORIES } from "@/data/categories";

interface VerseCardProps {
  verse: Verse;
}

export default function VerseCard({ verse }: VerseCardProps) {
  const verseCategories = CATEGORIES.filter((c) => verse.categories.includes(c.slug));
  const translationSnippet =
    verse.translation.length > 140
      ? verse.translation.slice(0, 140).trimEnd() + "…"
      : verse.translation;

  return (
    <Link
      href={`/verse/${verse.surah}/${verse.ayah}`}
      className="group block bg-surface rounded-2xl border-t-4 border-gold shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-gold-ink uppercase tracking-wider">
            {verse.surahName}
          </span>
          <span className="text-xs text-muted ml-2">
            {verse.surahNameTranslation}
          </span>
        </div>
        <span className="text-xs bg-primary/10 text-heading px-2 py-0.5 rounded-full font-mono">
          {verse.surah}:{verse.ayah}
        </span>
      </div>

      {/* Arabic */}
      <div className="px-5 py-3 bg-primary/5 border-y border-primary/10">
        <ArabicText text={verse.arabic} size="sm" className="text-ink/90" />
      </div>

      {/* Transliteration */}
      <div className="px-5 pt-2 pb-1">
        <p className="text-xs italic text-muted text-right">
          {verse.transliteration}
        </p>
      </div>

      {/* Translation */}
      <div className="px-5 pb-3">
        <p className="text-sm text-ink/80 leading-relaxed">{translationSnippet}</p>
      </div>

      {/* Category badges */}
      {verseCategories.length > 0 && (
        <div className="px-5 pb-4 flex flex-wrap gap-1">
          {verseCategories.map((cat) => (
            <span
              key={cat.slug}
              className="text-xs bg-gold/15 text-gold-ink px-2 py-0.5 rounded-full"
            >
              {cat.icon} {cat.label}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
