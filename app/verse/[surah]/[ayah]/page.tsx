import { notFound } from "next/navigation";
import Link from "next/link";
import ArabicText from "@/components/ArabicText";
import ShareButtonClient from "@/components/ShareButton";
import TafseerSection from "@/components/TafseerSection";
import { getAllVerses } from "@/lib/getAllVerses";
import { CATEGORIES } from "@/data/categories";

interface Props {
  params: Promise<{ surah: string; ayah: string }>;
}

export async function generateStaticParams() {
  const verses = getAllVerses();
  return verses.map((v) => ({
    surah: String(v.surah),
    ayah: String(v.ayah),
  }));
}

export async function generateMetadata({ params }: Props) {
  const { surah, ayah } = await params;
  const verses = getAllVerses();
  const verse = verses.find(
    (v) => v.surah === Number(surah) && v.ayah === Number(ayah)
  );
  if (!verse) return { title: "Verse Not Found" };
  return {
    title: `${verse.surahName} ${verse.surah}:${verse.ayah} — Al-Ilm`,
    description: verse.translation,
  };
}

export default async function VersePage({ params }: Props) {
  const { surah, ayah } = await params;
  const verses = getAllVerses();

  const surahNum = Number(surah);
  const ayahNum = Number(ayah);

  const verse = verses.find((v) => v.surah === surahNum && v.ayah === ayahNum);
  if (!verse) notFound();

  const verseCategories = CATEGORIES.filter((c) => verse.categories.includes(c.slug));

  const idx = verses.findIndex((v) => v.surah === surahNum && v.ayah === ayahNum);
  const prev = idx > 0 ? verses[idx - 1] : null;
  const next = idx < verses.length - 1 ? verses[idx + 1] : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-dark/40 mb-8 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link href="/browse" className="hover:text-primary transition-colors">Browse</Link>
        <span>/</span>
        <span className="text-dark/70">{verse.surahName} {verse.surah}:{verse.ayah}</span>
      </nav>

      {/* Surah name + reference */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">{verse.surahName}</h1>
          <p className="text-dark/50 mt-1">{verse.surahNameTranslation}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-[family-name:var(--font-amiri)] text-gold" dir="rtl">
            {verse.surahNameAr}
          </span>
          <p className="text-xs text-dark/40 font-mono mt-1">
            Surah {verse.surah} · Ayah {verse.ayah} · Juz {verse.juz}
          </p>
        </div>
      </div>

      {/* Main verse card */}
      <div className="bg-dark rounded-3xl hero-pattern overflow-hidden mb-8">
        <div className="relative z-10 p-8 sm:p-12">
          <ArabicText
            text={verse.arabic}
            size="xl"
            align="center"
            className="text-cream mb-8 drop-shadow"
          />

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gold/30" />
            <span className="text-gold/50 text-xs">❖</span>
            <div className="flex-1 h-px bg-gold/30" />
          </div>

          <p className="text-gold-light/80 italic text-base mb-6 text-center">
            {verse.transliteration}
          </p>

          <p className="text-cream/90 text-lg leading-relaxed text-center">
            &ldquo;{verse.translation}&rdquo;
          </p>
        </div>
      </div>

      {/* Category tags */}
      {verseCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {verseCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/browse?category=${cat.slug}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-gold/15 text-gold-dark hover:bg-gold/25 transition-colors border border-gold/30"
            >
              {cat.icon} {cat.label}
            </Link>
          ))}
        </div>
      )}

      {/* Share */}
      <ShareButtonClient surah={verse.surah} ayah={verse.ayah} />

      {/* Tafseer — Ibn Kathir (Abridged) */}
      {verse.tafseer && (
        <TafseerSection
          tafseer={verse.tafseer}
          tafseerSummary={verse.tafseerSummary}
          groupStart={verse.tafseerGroup}
          groupEnd={verse.tafseerGroupEnd}
          verseCount={verse.tafseerVerseCount}
          surahName={verse.surahName}
        />
      )}

      {/* Prev / Next */}
      <div className="mt-10 grid grid-cols-2 gap-4">
        {prev ? (
          <Link
            href={`/verse/${prev.surah}/${prev.ayah}`}
            className="group flex flex-col p-4 rounded-2xl border border-gold/20 hover:border-gold hover:bg-cream-dark transition-all"
          >
            <span className="text-xs text-dark/40 mb-1">← Previous</span>
            <span className="text-sm font-semibold text-primary">{prev.surahName} {prev.surah}:{prev.ayah}</span>
            <p className="text-xs text-dark/50 mt-1 line-clamp-2">{prev.translation}</p>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={`/verse/${next.surah}/${next.ayah}`}
            className="group flex flex-col p-4 rounded-2xl border border-gold/20 hover:border-gold hover:bg-cream-dark transition-all text-right"
          >
            <span className="text-xs text-dark/40 mb-1">Next →</span>
            <span className="text-sm font-semibold text-primary">{next.surahName} {next.surah}:{next.ayah}</span>
            <p className="text-xs text-dark/50 mt-1 line-clamp-2">{next.translation}</p>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
