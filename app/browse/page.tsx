import { Suspense } from "react";
import { getLessons } from "@/lib/getLessons";
import { CATEGORIES } from "@/data/categories";
import BrowseClient from "@/components/BrowseClient";
import BrowseHeader from "@/components/BrowseHeader";

export const metadata = {
  title: "Browse Lessons — Al-Ilm",
  description: "Browse Quran lessons from Juz 30 by theme and category",
};

export default function BrowsePage() {
  const lessons = getLessons();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Page header */}
      <BrowseHeader count={lessons.length} />

      <Suspense fallback={<div className="text-primary/40 text-sm">Loading…</div>}>
        <BrowseClient lessons={lessons} categories={CATEGORIES} />
      </Suspense>
    </div>
  );
}
