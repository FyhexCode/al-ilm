import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The store keeps a module-level cache, so load a fresh copy per test.
async function loadProgress() {
  vi.resetModules();
  return import("@/lib/progress");
}

describe("localDay", () => {
  it("formats the local calendar day with zero padding", async () => {
    const { localDay } = await loadProgress();
    expect(localDay(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
    expect(localDay(new Date(2026, 10, 26, 0, 1))).toBe("2026-11-26");
  });
});

describe("computeStreak", () => {
  it("is 0 with no visits", async () => {
    const { computeStreak } = await loadProgress();
    expect(computeStreak([], "2026-11-24")).toBe(0);
  });

  it("counts today alone as 1", async () => {
    const { computeStreak } = await loadProgress();
    expect(computeStreak(["2026-11-24"], "2026-11-24")).toBe(1);
  });

  it("counts consecutive days ending today", async () => {
    const { computeStreak } = await loadProgress();
    expect(computeStreak(["2026-11-22", "2026-11-23", "2026-11-24"], "2026-11-24")).toBe(3);
  });

  it("keeps the streak alive until you miss today (yesterday still counts)", async () => {
    const { computeStreak } = await loadProgress();
    expect(computeStreak(["2026-11-22", "2026-11-23"], "2026-11-24")).toBe(2);
  });

  it("resets after a missed day", async () => {
    const { computeStreak } = await loadProgress();
    expect(computeStreak(["2026-11-21", "2026-11-22"], "2026-11-24")).toBe(0);
  });

  it("stops counting at a gap", async () => {
    const { computeStreak } = await loadProgress();
    expect(computeStreak(["2026-11-20", "2026-11-22", "2026-11-23", "2026-11-24"], "2026-11-24")).toBe(3);
  });

  it("handles month and year boundaries", async () => {
    const { computeStreak } = await loadProgress();
    expect(computeStreak(["2026-02-27", "2026-02-28", "2026-03-01"], "2026-03-01")).toBe(3);
    expect(computeStreak(["2025-12-31", "2026-01-01"], "2026-01-01")).toBe(2);
  });

  it("handles leap-day boundaries", async () => {
    const { computeStreak } = await loadProgress();
    expect(computeStreak(["2028-02-28", "2028-02-29", "2028-03-01"], "2028-03-01")).toBe(3);
  });

  it("ignores duplicate days", async () => {
    const { computeStreak } = await loadProgress();
    expect(computeStreak(["2026-11-24", "2026-11-24"], "2026-11-24")).toBe(1);
  });
});

describe("progress store", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 24, 12, 0));
  });
  afterEach(() => vi.useRealTimers());

  it("recordVisit stores today once (idempotent)", async () => {
    const { recordVisit } = await loadProgress();
    recordVisit();
    recordVisit();
    expect(JSON.parse(localStorage.getItem("al-ilm-progress")!).days).toEqual(["2026-11-24"]);
  });

  it("builds a streak across consecutive days", async () => {
    const { recordVisit, useProgress } = await loadProgress();
    vi.setSystemTime(new Date(2026, 10, 23, 12, 0));
    recordVisit();
    vi.setSystemTime(new Date(2026, 10, 24, 12, 0));
    recordVisit();
    const { result } = renderHook(() => useProgress());
    expect(result.current.streak).toBe(2);
  });

  it("toggleRead marks and unmarks a surah and persists", async () => {
    const { useProgress } = await loadProgress();
    const { result } = renderHook(() => useProgress());
    expect(result.current.isRead(78)).toBe(false);
    act(() => result.current.toggleRead(78));
    expect(result.current.isRead(78)).toBe(true);
    expect(JSON.parse(localStorage.getItem("al-ilm-progress")!).read).toEqual([78]);
    act(() => result.current.toggleRead(78));
    expect(result.current.isRead(78)).toBe(false);
  });

  it("recovers from corrupt storage", async () => {
    localStorage.setItem("al-ilm-progress", "{not json");
    const { useProgress } = await loadProgress();
    const { result } = renderHook(() => useProgress());
    expect(result.current.readSurahs).toEqual([]);
    expect(result.current.streak).toBe(0);
  });

  it("drops malformed entries from storage", async () => {
    localStorage.setItem("al-ilm-progress", JSON.stringify({ read: [78, "x", 1.5], days: ["2026-11-24", "nope", 5] }));
    const { useProgress } = await loadProgress();
    const { result } = renderHook(() => useProgress());
    expect(result.current.readSurahs).toEqual([78]);
    expect(result.current.streak).toBe(1);
  });
});
