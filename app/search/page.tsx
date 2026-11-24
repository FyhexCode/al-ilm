import { Suspense } from "react";
import SearchClient from "@/components/SearchClient";

export const metadata = {
  title: "Search — Al-Ilm",
  description: "Search Quran verses by meaning, transliteration, Arabic or lesson",
};

export default function SearchPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Suspense fallback={null}>
        <SearchClient />
      </Suspense>
    </div>
  );
}
