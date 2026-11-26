import { describe, expect, it } from "vitest";
import { getAllVerses } from "@/lib/getAllVerses";
import { getDailyVerse, getTodayISO } from "@/lib/getDailyVerse";

const verses = getAllVerses();
const key = (v: { surah: number; ayah: number }) => `${v.surah}:${v.ayah}`;

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

describe("getTodayISO", () => {
  it("formats a date as YYYY-MM-DD (UTC)", () => {
    expect(getTodayISO(new Date("2026-11-26T23:59:59Z"))).toBe("2026-11-26");
  });
});

describe("getDailyVerse", () => {
  it("is deterministic for a given date", () => {
    expect(key(getDailyVerse(verses, "2026-11-26"))).toBe(key(getDailyVerse(verses, "2026-11-26")));
  });

  it("serves every verse exactly once per full cycle (regression: used to be 19 verses/year)", () => {
    const seen = new Set<string>();
    for (let i = 0; i < verses.length; i++) {
      seen.add(key(getDailyVerse(verses, addDays("2026-01-01", i))));
    }
    expect(seen.size).toBe(verses.length);
  });

  it("gives 365 distinct verses across a calendar year", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 365; i++) seen.add(key(getDailyVerse(verses, addDays("2026-01-01", i))));
    expect(seen.size).toBe(365);
  });

  it("changes from one day to the next", () => {
    expect(key(getDailyVerse(verses, "2026-11-26"))).not.toBe(key(getDailyVerse(verses, "2026-11-27")));
  });

  it("repeats after exactly one full cycle", () => {
    const start = "2026-03-01";
    expect(key(getDailyVerse(verses, start))).toBe(
      key(getDailyVerse(verses, addDays(start, verses.length)))
    );
  });

  it("always returns a verse from the list, including at year boundaries", () => {
    for (const date of ["2025-12-31", "2026-01-01", "2028-02-29", "2030-12-31"]) {
      expect(verses).toContain(getDailyVerse(verses, date));
    }
  });
});
