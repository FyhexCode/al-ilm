import { Suspense } from "react";
import { getLessons } from "@/lib/getLessons";
import { CATEGORIES } from "@/data/categories";
import BrowseClient from "@/components/BrowseClient";

export const metadata = {
  title: "Browse Lessons — Al-Ilm",
  description: "Browse Quran lessons from Juz 30 by theme and category",
};

export default function BrowsePage() {
  const lessons = getLessons();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-primary mb-2">Browse Lessons</h1>
        <div className="w-16 h-1 bg-gold rounded-full mb-4" />
        <p className="text-dark/60">
          Filter by theme and explore Juz 30 — {lessons.length} lessons across Surahs 78–114
        </p>
      </div>

      <Suspense fallback={<div className="text-primary/40 text-sm">Loading...</div>}>
        <BrowseClient lessons={lessons} categories={CATEGORIES} />
      </Suspense>
    </div>
  );
}
