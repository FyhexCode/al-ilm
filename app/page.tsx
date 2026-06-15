import DailyLesson from "@/components/DailyLesson";
import CategoryGrid from "@/components/CategoryGrid";
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

      <div className="bg-primary-dark text-center py-8">
        <p className="text-cream/60 text-sm">
          <span className="text-gold font-bold text-lg">{verses.length}</span> verses from{" "}
          <span className="text-gold font-bold text-lg">Juz 30</span> — Surahs 78–114
        </p>
        <p className="text-cream/30 text-xs mt-1">More Juz coming soon</p>
      </div>
    </>
  );
}
