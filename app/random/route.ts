import type { NextRequest } from "next/server";
import { getAllVerses } from "@/lib/getAllVerses";

// Redirects to a random verse. Reading the request keeps this handler dynamic.
export function GET(request: NextRequest) {
  const verses = getAllVerses();
  const verse = verses[Math.floor(Math.random() * verses.length)];
  return Response.redirect(new URL(`/verse/${verse.surah}/${verse.ayah}`, request.url), 307);
}
