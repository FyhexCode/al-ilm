import { describe, expect, it } from "vitest";
import { dictionary, translate, type DictKey } from "@/lib/i18n/dictionary";
import { localizeCategory, localizeCluster, localizeLesson, localizeVerse, pick, pickNullable } from "@/lib/i18n/pick";
import { getLessons } from "@/lib/getLessons";
import { getAllVerses } from "@/lib/getAllVerses";
import { CATEGORIES } from "@/data/categories";
import type { VerseCluster } from "@/lib/types";

const tokens = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("dictionary parity (EN/ID)", () => {
  const enKeys = Object.keys(dictionary.en).sort();
  const idKeys = Object.keys(dictionary.id).sort();

  it("has exactly the same keys in both languages", () => {
    expect(idKeys).toEqual(enKeys);
  });

  it("has no empty strings", () => {
    for (const locale of ["en", "id"] as const) {
      for (const [key, value] of Object.entries(dictionary[locale])) {
        expect(value.trim(), `${locale}:${key}`).not.toBe("");
      }
    }
  });

  it("uses the same {placeholders} in both languages for every key", () => {
    for (const key of enKeys as DictKey[]) {
      expect(tokens(dictionary.id[key]), key).toEqual(tokens(dictionary.en[key]));
    }
  });
});

describe("translate", () => {
  it("returns the string for the locale", () => {
    expect(translate("en", "nav.home")).toBe("Home");
    expect(translate("id", "nav.home")).toBe("Beranda");
  });

  it("interpolates params, including repeated tokens", () => {
    expect(translate("en", "search.count", { count: 7 })).toBe("7 results");
    expect(translate("id", "progress.summary", { read: 3, total: 37 })).toContain("3 dari 37");
  });

  it("leaves unknown placeholders untouched and ignores extra params", () => {
    expect(translate("en", "search.noResults", { other: "x" })).toContain("{query}");
  });

  it("falls back to the key for an unknown key", () => {
    expect(translate("en", "does.not.exist" as DictKey)).toBe("does.not.exist");
  });
});

describe("pick / pickNullable", () => {
  it("uses English for the en locale", () => {
    expect(pick("en", "hello", "halo")).toBe("hello");
  });

  it("uses Indonesian for id when present", () => {
    expect(pick("id", "hello", "halo")).toBe("halo");
  });

  it("falls back to English when the Indonesian value is missing or empty", () => {
    expect(pick("id", "hello")).toBe("hello");
    expect(pick("id", "hello", "")).toBe("hello");
    expect(pick("id", "hello", null)).toBe("hello");
  });

  it("pickNullable preserves null", () => {
    expect(pickNullable("id", null, undefined)).toBeNull();
    expect(pickNullable("id", "a", "b")).toBe("b");
    expect(pickNullable("en", "a", "b")).toBe("a");
  });
});

describe("localize helpers", () => {
  const verse = getAllVerses()[0];

  it("localizeVerse returns the same object for en", () => {
    expect(localizeVerse(verse, "en")).toBe(verse);
  });

  it("localizeVerse swaps in the Indonesian translation for id", () => {
    expect(localizeVerse(verse, "id").translation).toBe(verse.translationId);
  });

  it("localizeCategory translates labels", () => {
    const cat = CATEGORIES[0];
    expect(localizeCategory(cat, "id").label).toBe(cat.labelId);
    expect(localizeCategory(cat, "en")).toBe(cat);
  });

  it("every category has Indonesian label and description", () => {
    for (const c of CATEGORIES) {
      expect(c.labelId, c.slug).toBeTruthy();
      expect(c.descriptionId, c.slug).toBeTruthy();
    }
  });

  it("localizeCluster falls back to English when no Indonesian text exists", () => {
    const cluster: VerseCluster = { ayahs: [1], keyTakeaway: "EN take", lesson: "EN lesson" };
    expect(localizeCluster(cluster, "id")).toMatchObject({ keyTakeaway: "EN take", lesson: "EN lesson" });
  });

  it("localizeLesson localizes the preview takeaway and nested verses", () => {
    const lesson = getLessons()[0];
    const id = localizeLesson(lesson, "id");
    expect(id.verses[0].translation).toBe(lesson.verses[0].translationId);
    if (lesson.previewTakeawayId) expect(id.previewTakeaway).toBe(lesson.previewTakeawayId);
  });
});
