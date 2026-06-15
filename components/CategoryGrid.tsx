import Link from "next/link";
import { CATEGORIES } from "@/data/categories";

export default function CategoryGrid() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-primary mb-2">Browse by Theme</h2>
        <div className="w-16 h-1 bg-gold mx-auto rounded-full" />
        <p className="text-dark/60 mt-4 text-sm">
          Explore Quran verses organised by the wisdom they carry
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/browse?category=${cat.slug}`}
            className="group flex flex-col items-center text-center gap-3 p-5 rounded-2xl bg-cream border border-gold/20 hover:border-gold hover:shadow-md hover:shadow-gold/10 transition-all duration-200"
          >
              <span className="text-sm font-semibold text-primary">{cat.label}</span>
            <p className="text-xs text-dark/50 leading-relaxed hidden sm:block">
              {cat.description}
            </p>
          </Link>
        ))}

        {/* "All verses" card */}
        <Link
          href="/browse"
          className="group flex flex-col items-center text-center gap-3 p-5 rounded-2xl bg-primary hover:bg-primary-light border border-primary transition-all duration-200 hover:shadow-md"
        >
          <span className="text-sm font-semibold text-cream">All Verses</span>
          <p className="text-xs text-cream/60 leading-relaxed hidden sm:block">
            Browse the complete Juz 30 collection
          </p>
        </Link>
      </div>
    </section>
  );
}
