import type { VerseCluster } from "./types";
import clustersData from "@/data/verse-clusters.json";

const data = clustersData as Record<string, VerseCluster[]>;

export function getClustersForSurah(surah: number): VerseCluster[] {
  return data[String(surah)] ?? [];
}

export function getClusterForVerse(surah: number, ayah: number): VerseCluster | undefined {
  return getClustersForSurah(surah).find((c) => c.ayahs.includes(ayah));
}

export function buildClusterList(surah: number, ayahs: number[]): VerseCluster[] {
  const clusters = getClustersForSurah(surah);
  const seen = new Set<string>();
  const result: VerseCluster[] = [];

  for (const ayah of ayahs) {
    const cluster = clusters.find((c) => c.ayahs.includes(ayah));
    if (!cluster) {
      result.push({ ayahs: [ayah], keyTakeaway: "", lesson: "" });
      continue;
    }
    const key = cluster.ayahs.join(",");
    if (!seen.has(key)) {
      seen.add(key);
      result.push(cluster);
    }
  }

  return result;
}
