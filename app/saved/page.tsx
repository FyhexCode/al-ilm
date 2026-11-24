import SavedClient from "@/components/SavedClient";

export const metadata = {
  title: "Saved verses — Al-Ilm",
  description: "Your bookmarked Quran verses",
};

export default function SavedPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <SavedClient />
    </div>
  );
}
