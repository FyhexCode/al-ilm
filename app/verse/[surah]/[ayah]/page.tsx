import { notFound } from "next/navigation";
import VerseDetail from "@/components/VerseDetail";
import { getAllVerses } from "@/lib/getAllVerses";

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

  const idx = verses.findIndex((v) => v.surah === surahNum && v.ayah === ayahNum);
  const prev = idx > 0 ? verses[idx - 1] : null;
  const next = idx < verses.length - 1 ? verses[idx + 1] : null;

  return <VerseDetail verse={verse} prev={prev} next={next} />;
}
