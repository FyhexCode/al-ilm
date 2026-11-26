import { notFound } from "next/navigation";
import { getLessons, getLessonSummaries, slimLessonForClient } from "@/lib/getLessons";
import LessonPageClient from "@/components/LessonPageClient";

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
    openGraph: {
      siteName: "Al-Ilm",
      type: "article",
      title: `${lesson.surahName} — Al-Ilm`,
      description: lesson.previewTakeaway ?? lesson.application ?? `${lesson.surahNameTranslation} — Surah ${lesson.surah}`,
    },
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

  const lessonIdx = lessons.findIndex(
    (l) => l.surah === surahNum && l.firstAyah === ayahNum
  );
  // Neighbours only need a title and link, so send summaries, not whole lessons.
  const summaries = getLessonSummaries();
  const prevLesson = lessonIdx > 0 ? summaries[lessonIdx - 1] : null;
  const nextLesson = lessonIdx < summaries.length - 1 ? summaries[lessonIdx + 1] : null;

  return (
    <LessonPageClient
      lesson={slimLessonForClient(lesson)}
      prevLesson={prevLesson}
      nextLesson={nextLesson}
    />
  );
}
