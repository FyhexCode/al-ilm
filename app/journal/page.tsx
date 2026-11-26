import JournalClient from "@/components/JournalClient";

export const metadata = {
  title: "Journal — Al-Ilm",
  description: "Your private reflections on Quran verses",
};

export default function JournalPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <JournalClient />
    </div>
  );
}
