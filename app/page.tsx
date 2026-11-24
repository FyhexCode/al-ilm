import DailyLesson from "@/components/DailyLesson";
import CategoryGrid from "@/components/CategoryGrid";
import JuzCountNote from "@/components/JuzCountNote";
import { getAllVerses } from "@/lib/getAllVerses";
import { getDailyVerse, getTodayISO } from "@/lib/getDailyVerse";
import { getClusterForVerse } from "@/lib/getVerseClusters";

// Regenerate hourly so "Verse of the Day" rolls over instead of freezing at build time.
export const revalidate = 3600;

export default function Home() {
  const verses = getAllVerses();
  const dateISO = getTodayISO();
  const dailyVerse = getDailyVerse(verses, dateISO);
  const cluster = getClusterForVerse(dailyVerse.surah, dailyVerse.ayah);
  const clusterVerses = cluster
    ? (cluster.ayahs
        .map((a) => verses.find((v) => v.surah === dailyVerse.surah && v.ayah === a))
        .filter(Boolean) as typeof verses)
    : [dailyVerse];

  return (
    <>
      <DailyLesson verse={dailyVerse} clusterVerses={clusterVerses} cluster={cluster ?? null} dateISO={dateISO} />
      <CategoryGrid />

      <JuzCountNote count={verses.length} />
    </>
  );
}
