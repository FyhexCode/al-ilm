import DailyLesson from "@/components/DailyLesson";
import CategoryGrid from "@/components/CategoryGrid";
import JuzCountNote from "@/components/JuzCountNote";
import { getAllVerses } from "@/lib/getAllVerses";
import { getDailyVerse } from "@/lib/getDailyVerse";
import { getClusterForVerse } from "@/lib/getVerseClusters";

export default function Home() {
  const verses = getAllVerses();
  const dailyVerse = getDailyVerse(verses);
  const cluster = getClusterForVerse(dailyVerse.surah, dailyVerse.ayah);
  const clusterVerses = cluster
    ? (cluster.ayahs
        .map((a) => verses.find((v) => v.surah === dailyVerse.surah && v.ayah === a))
        .filter(Boolean) as typeof verses)
    : [dailyVerse];

  return (
    <>
      <DailyLesson verse={dailyVerse} clusterVerses={clusterVerses} cluster={cluster ?? null} />
      <CategoryGrid />

      <JuzCountNote count={verses.length} />
    </>
  );
}
