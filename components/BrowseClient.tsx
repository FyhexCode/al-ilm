"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import LessonCard from "./LessonCard";
import type { LessonGroup } from "@/lib/getLessons";
import type { Category } from "@/lib/types";

interface BrowseClientProps {
  lessons: LessonGroup[];
  categories: Category[];
}

export default function BrowseClient({ lessons, categories }: BrowseClientProps) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "all";
  const [active, setActive] = useState(initialCategory);

  const filtered = useMemo(
    () =>
      active === "all"
        ? lessons
        : lessons.filter((l) => l.categories.includes(active)),
    [lessons, active]
  );

  return (
    <>
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActive("all")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
            active === "all"
              ? "bg-gold text-dark shadow-md"
              : "bg-cream-dark text-primary border border-gold/30 hover:border-gold hover:bg-gold/10"
          }`}
        >
          All Lessons
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActive(cat.slug)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
              active === cat.slug
                ? "bg-gold text-dark shadow-md"
                : "bg-cream-dark text-primary border border-gold/30 hover:border-gold hover:bg-gold/10"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Result count */}
      <p className="text-sm text-dark/50 mt-6 mb-4">
        Showing <span className="font-semibold text-primary">{filtered.length}</span>{" "}
        {filtered.length === 1 ? "lesson" : "lessons"}
        {active !== "all" && (
          <>
            {" "}in{" "}
            <span className="font-semibold text-primary">
              {categories.find((c) => c.slug === active)?.label}
            </span>
          </>
        )}
      </p>

      {/* Lesson grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </div>
    </>
  );
}
