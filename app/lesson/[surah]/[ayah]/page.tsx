import { notFound } from "next/navigation";
import { getLessons } from "@/lib/getLessons";
import { getAllVerses } from "@/lib/getAllVerses";
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
    <LessonPageClient
      lesson={lesson}
      surahVerses={surahVerses}
      prevLesson={prevLesson}
      nextLesson={nextLesson}
    />
  );
}
