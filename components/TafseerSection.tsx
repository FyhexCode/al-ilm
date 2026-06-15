"use client";

import { useState } from "react";

interface TafseerSectionProps {
  tafseer: string;
  tafseerSummary: string | null;
  groupStart: string;
  groupEnd: string;
  verseCount: number;
  surahName: string;
}

export default function TafseerSection({
  tafseer,
  tafseerSummary,
  groupStart,
  groupEnd,
  verseCount,
  surahName,
}: TafseerSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const groupLabel =
    verseCount > 1
      ? `${surahName} ${groupStart}–${groupEnd} (${verseCount} verses)`
      : `${surahName} ${groupStart}`;

  // Split tafseer into paragraphs for structured display
  const paragraphs = tafseer
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  const previewParas = paragraphs.slice(0, 2);
  const remainingParas = paragraphs.slice(2);

  return (
    <section className="mt-8 rounded-2xl border border-gold/25 overflow-hidden">
      {/* Header */}
      <div className="bg-primary px-5 py-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-cream font-bold text-sm uppercase tracking-wider">Tafseer</h2>
          </div>
          <p className="text-cream/50 text-xs">
            Ibn Kathir (Abridged) · {groupLabel}
          </p>
        </div>
        {/* Attribution badge */}
        <span className="text-gold/50 text-xs shrink-0 mt-0.5">English</span>
      </div>

      {/* About This Verse highlight */}
      {tafseerSummary && tafseerSummary.length >= 60 && (
        <div className="bg-gold/8 border-b border-gold/20 px-5 py-4">
          <p className="text-xs font-bold text-gold uppercase tracking-widest mb-2">
            About This Verse
          </p>
          <p className="text-dark/85 text-sm leading-relaxed">{tafseerSummary}</p>
        </div>
      )}

      {/* Full tafseer body */}
      <div className="bg-cream px-5 py-5">
        {previewParas.map((para, i) => (
          <TafseerParagraph key={i} text={para} />
        ))}

        {remainingParas.length > 0 && (
          <>
            {expanded && remainingParas.map((para, i) => (
              <TafseerParagraph key={i + previewParas.length} text={para} />
            ))}

            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-3 text-sm text-primary hover:text-primary-light font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>{expanded ? "Show less ↑" : `Read full tafseer (${remainingParas.length} more section${remainingParas.length !== 1 ? "s" : ""}) ↓`}</span>
            </button>
          </>
        )}
      </div>
    </section>
  );
}

function TafseerParagraph({ text }: { text: string }) {
  // Section labels like [Refutation against...] get special styling
  if (text.startsWith("[") && text.endsWith("]")) {
    return (
      <p className="text-primary font-semibold text-xs uppercase tracking-wide mt-4 mb-1">
        {text.slice(1, -1)}
      </p>
    );
  }
  return (
    <p className="text-dark/80 text-sm leading-relaxed mb-3">{text}</p>
  );
}
