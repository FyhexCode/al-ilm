import { notFound } from "next/navigation";
import Link from "next/link";
import { getLessons } from "@/lib/getLessons";
import { getAllVerses } from "@/lib/getAllVerses";
import LessonDetail from "@/components/LessonDetail";

interface Props {
  params: Promise<{ surah: string; ayah: string }>;
}

export async function generateStaticParams() {
  const lessons = getLessons();
  return lessons.map((l) => ({
    surah: String(l.surah),
    ayah: String(l.firstAyah),
  }));
}

export async function generateMetadata({ params }: Props) {
  const { surah, ayah } = await params;
  const lessons = getLessons();
  const lesson = lessons.find(
    (l) => l.surah === Number(surah) && l.firstAyah === Number(ayah)
  );
  if (!lesson) return { title: "Lesson Not Found" };
  return {
    title: `${lesson.surahName} — Al-Ilm`,
    description: lesson.application ?? `${lesson.surahNameTranslation} — Surah ${lesson.surah}`,
  };
}

export default async function LessonPage({ params }: Props) {
  const { surah, ayah } = await params;
  const lessons = getLessons();

  const surahNum = Number(surah);
  const ayahNum = Number(ayah);

  const lesson = lessons.find(
    (l) => l.surah === surahNum && l.firstAyah === ayahNum
  );
  if (!lesson) notFound();

  const surahVerses = getAllVerses().filter((v) => v.surah === surahNum);

  const lessonIdx = lessons.findIndex(
    (l) => l.surah === surahNum && l.firstAyah === ayahNum
  );
  const prevLesson = lessonIdx > 0 ? lessons[lessonIdx - 1] : null;
  const nextLesson = lessonIdx < lessons.length - 1 ? lessons[lessonIdx + 1] : null;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-2">
        <nav className="text-sm text-dark/40 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/browse" className="hover:text-primary transition-colors">Browse</Link>
          <span>/</span>
          <span className="text-dark/70 truncate max-w-xs">{lesson.surahName}</span>
        </nav>
      </div>

      <LessonDetail lesson={lesson} surahVerses={surahVerses} />

      {/* Prev / Next navigation */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-12 mt-4">
        <div className="grid grid-cols-2 gap-4">
          {prevLesson ? (
            <Link
              href={`/lesson/${prevLesson.surah}/${prevLesson.firstAyah}`}
              className="flex flex-col p-4 rounded-2xl border border-gold/20 hover:border-gold hover:bg-cream-dark transition-all"
            >
              <span className="text-xs text-dark/40 mb-1">← Previous</span>
              <span className="text-sm font-semibold text-primary">{prevLesson.surahName}</span>
              <span className="text-xs text-dark/40 mt-1">{prevLesson.surahNameTranslation}</span>
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Link
              href={`/lesson/${nextLesson.surah}/${nextLesson.firstAyah}`}
              className="flex flex-col p-4 rounded-2xl border border-gold/20 hover:border-gold hover:bg-cream-dark transition-all text-right"
            >
              <span className="text-xs text-dark/40 mb-1">Next →</span>
              <span className="text-sm font-semibold text-primary">{nextLesson.surahName}</span>
              <span className="text-xs text-dark/40 mt-1">{nextLesson.surahNameTranslation}</span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
