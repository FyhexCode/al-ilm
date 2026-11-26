import { describe, expect, it } from "vitest";
import { getAllVerses } from "@/lib/getAllVerses";
import { getLessons } from "@/lib/getLessons";
import { getClustersForSurah } from "@/lib/getVerseClusters";
import { CATEGORIES } from "@/data/categories";

const verses = getAllVerses();
const surahs = [...new Set(verses.map((v) => v.surah))];

describe("verses", () => {
  it("covers Juz 30: surahs 78-114, 564 verses, all unique", () => {
    expect(Math.min(...surahs)).toBe(78);
    expect(Math.max(...surahs)).toBe(114);
    expect(surahs).toHaveLength(37);
    expect(verses).toHaveLength(564);
    expect(new Set(verses.map((v) => `${v.surah}:${v.ayah}`)).size).toBe(564);
  });

  it("numbers ayahs 1..n contiguously within each surah", () => {
    for (const s of surahs) {
      const ayahs = verses.filter((v) => v.surah === s).map((v) => v.ayah);
      expect(ayahs, `surah ${s}`).toEqual(Array.from({ length: ayahs.length }, (_, i) => i + 1));
    }
  });

  it("has the core text fields on every verse (EN and ID translation)", () => {
    for (const v of verses) {
      for (const field of ["arabic", "transliteration", "translation", "translationId", "surahName", "surahNameAr"] as const) {
        expect(v[field]?.trim(), `${v.surah}:${v.ayah} ${field}`).toBeTruthy();
      }
    }
  });

  it("only references known categories, and has at least one", () => {
    const known = new Set(CATEGORIES.map((c) => c.slug));
    for (const v of verses) {
      expect(v.categories.length, `${v.surah}:${v.ayah}`).toBeGreaterThan(0);
      for (const c of v.categories) expect(known.has(c), `${v.surah}:${v.ayah} -> ${c}`).toBe(true);
    }
  });

  it("is internally consistent about the tafseer group", () => {
    for (const s of surahs) {
      const groups = new Set(verses.filter((v) => v.surah === s).map((v) => v.tafseerGroup));
      expect(groups.size, `surah ${s}`).toBe(1);
      expect([...groups][0].startsWith(`${s}:`)).toBe(true);
    }
  });

  // Known content gaps (see Sprint 4 in docs/al-ilm-sprint-plan.xlsx). They are tracked here so
  // they turn into real assertions the moment the data lands.
  it.todo("has Indonesian tafseer (tafseerId) on every verse");
  it.todo("has Indonesian application (applicationId) on every verse");
  it.todo("has an English application on every verse (10 are empty today)");
});

describe("verse clusters", () => {
  it("exist for every surah", () => {
    for (const s of surahs) expect(getClustersForSurah(s).length, `surah ${s}`).toBeGreaterThan(0);
  });

  it("only reference ayahs that exist, with no ayah in two clusters", () => {
    for (const s of surahs) {
      const valid = new Set(verses.filter((v) => v.surah === s).map((v) => v.ayah));
      const seen = new Set<number>();
      for (const cluster of getClustersForSurah(s)) {
        for (const a of cluster.ayahs) {
          expect(valid.has(a), `surah ${s} ayah ${a} does not exist`).toBe(true);
          expect(seen.has(a), `surah ${s} ayah ${a} is in two clusters`).toBe(false);
          seen.add(a);
        }
      }
    }
  });

  it("lists ayahs in ascending, consecutive order", () => {
    for (const s of surahs) {
      for (const c of getClustersForSurah(s)) {
        c.ayahs.forEach((a, i) => {
          if (i > 0) expect(a, `surah ${s}`).toBe(c.ayahs[i - 1] + 1);
        });
      }
    }
  });

  it("has English and Indonesian takeaway + lesson text on every cluster", () => {
    for (const s of surahs) {
      for (const c of getClustersForSurah(s)) {
        const where = `surah ${s} ayah ${c.ayahs[0]}`;
        expect(c.keyTakeaway?.trim(), where).toBeTruthy();
        expect(c.lesson?.trim(), where).toBeTruthy();
        expect(c.keyTakeawayId?.trim(), where).toBeTruthy();
        expect(c.lessonId?.trim(), where).toBeTruthy();
      }
    }
  });

  it("covers every verse of every surah", () => {
    for (const s of surahs) {
      const total = verses.filter((v) => v.surah === s).length;
      const covered = getClustersForSurah(s).reduce((n, c) => n + c.ayahs.length, 0);
      expect(covered, `surah ${s}`).toBe(total);
    }
  });
});

describe("lessons", () => {
  const lessons = getLessons();

  it("builds one lesson per surah in surah order", () => {
    expect(lessons.map((l) => l.surah)).toEqual(surahs);
  });

  it("includes every verse exactly once", () => {
    expect(lessons.reduce((n, l) => n + l.verses.length, 0)).toBe(verses.length);
  });

  it("keys lessons by their first ayah (used in /lesson/[surah]/[ayah] URLs)", () => {
    for (const l of lessons) {
      expect(l.firstAyah).toBe(l.verses[0].ayah);
      expect(l.lastAyah).toBe(l.verses[l.verses.length - 1].ayah);
    }
  });

  it("provides a preview takeaway for every lesson", () => {
    for (const l of lessons) expect(l.previewTakeaway, `surah ${l.surah}`).toBeTruthy();
  });
});
