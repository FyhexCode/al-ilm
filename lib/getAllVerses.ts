import type { Verse } from "./types";
import juz30 from "@/data/juz30.json";

// Add juz JSON files here as more are added — each file is auto-included
const JUZ_FILES: Verse[][] = [juz30 as Verse[]];

export function getAllVerses(): Verse[] {
  return JUZ_FILES.flat();
}
