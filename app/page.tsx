import DailyLesson from "@/components/DailyLesson";
import CategoryGrid from "@/components/CategoryGrid";
import { getAllVerses } from "@/lib/getAllVerses";
import { getDailyVerse } from "@/lib/getDailyVerse";

export default function Home() {
  const verses = getAllVerses();
  const dailyVerse = getDailyVerse(verses);

  return (
    <>
      <DailyLesson verse={dailyVerse} />
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
