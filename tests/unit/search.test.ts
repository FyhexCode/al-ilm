import { describe, expect, it } from "vitest";
import { normalize, searchVerses } from "@/lib/search";

describe("normalize", () => {
  it("lowercases and strips Latin accents and punctuation", () => {
    expect(normalize("  Ḥamd — Al-Fātiḥa!  ")).toBe("hamd al fatiha");
  });

  it("removes Arabic diacritics and tatweel", () => {
    expect(normalize("بِسْمِ ٱللَّهِ")).toBe(normalize("بسم الله"));
    expect(normalize("اللـــه")).toBe("الله");
  });

  it("unifies alef variants, alef maqsura and ta marbuta", () => {
    expect(normalize("أ")).toBe(normalize("ا"));
    expect(normalize("إ")).toBe(normalize("ا"));
    expect(normalize("ى")).toBe(normalize("ي"));
    expect(normalize("رحمة")).toBe(normalize("رحمه"));
  });

  it("collapses whitespace", () => {
    expect(normalize("a   b\t\nc")).toBe("a b c");
  });
});

describe("searchVerses", () => {
  it("returns nothing for queries shorter than 2 characters", () => {
    expect(searchVerses("", "en")).toEqual([]);
    expect(searchVerses("a", "en")).toEqual([]);
    expect(searchVerses("  ", "en")).toEqual([]);
  });

  it("finds verses by English meaning", () => {
    const hits = searchVerses("patience", "en");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((h) => h.surah >= 78 && h.surah <= 114)).toBe(true);
  });

  it("returns nothing for gibberish", () => {
    expect(searchVerses("zzzzqqxx", "en")).toEqual([]);
  });

  it("requires every term to match (AND), so more terms never widen results", () => {
    const one = searchVerses("judgement", "en", 1000).length;
    const two = searchVerses("judgement day", "en", 1000).length;
    expect(two).toBeLessThanOrEqual(one);
  });

  it("is insensitive to Arabic diacritics", () => {
    const plain = searchVerses("الله", "en", 1000).map((h) => `${h.surah}:${h.ayah}`);
    const marked = searchVerses("اللّٰه", "en", 1000).map((h) => `${h.surah}:${h.ayah}`);
    expect(plain.length).toBeGreaterThan(0);
    expect(marked).toEqual(plain);
  });

  it("finds a surah by name, ranked above incidental matches", () => {
    const hits = searchVerses("An-Naba", "en");
    expect(hits[0].surah).toBe(78);
  });

  it("respects the result limit", () => {
    expect(searchVerses("allah", "en", 5)).toHaveLength(5);
    expect(searchVerses("allah", "en").length).toBeLessThanOrEqual(30);
  });

  it("returns results sorted by descending score", () => {
    const hits = searchVerses("the day", "en", 100);
    for (let i = 1; i < hits.length; i++) expect(hits[i - 1].score).toBeGreaterThanOrEqual(hits[i].score);
  });

  it("returns the Indonesian translation when locale is id", () => {
    const en = searchVerses("kiamat", "en", 1)[0];
    const id = searchVerses("kiamat", "id", 1)[0];
    expect(id.surah).toBe(en.surah);
    expect(id.translation).not.toBe("");
  });

  it("matches Indonesian words regardless of locale", () => {
    expect(searchVerses("kiamat", "en").length).toBeGreaterThan(0);
  });
});
