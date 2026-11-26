import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Stores cache their state at module level; load a fresh copy per test.
const load = <T,>(path: string) => {
  vi.resetModules();
  return import(/* @vite-ignore */ path) as Promise<T>;
};

describe("bookmarks", () => {
  const loadBookmarks = () => load<typeof import("@/lib/bookmarks")>("@/lib/bookmarks");

  it("builds ids as surah:ayah", async () => {
    const { bookmarkId } = await loadBookmarks();
    expect(bookmarkId(78, 2)).toBe("78:2");
  });

  it("toggles a bookmark on and off and persists it", async () => {
    const { useBookmarks } = await loadBookmarks();
    const { result } = renderHook(() => useBookmarks());
    expect(result.current.isSaved("78:2")).toBe(false);
    act(() => result.current.toggle("78:2"));
    expect(result.current.isSaved("78:2")).toBe(true);
    expect(JSON.parse(localStorage.getItem("al-ilm-bookmarks")!)).toEqual(["78:2"]);
    act(() => result.current.toggle("78:2"));
    expect(result.current.isSaved("78:2")).toBe(false);
  });

  it("loads previously saved ids", async () => {
    localStorage.setItem("al-ilm-bookmarks", JSON.stringify(["93:1", "78:1"]));
    const { useBookmarks } = await loadBookmarks();
    const { result } = renderHook(() => useBookmarks());
    expect(result.current.ids).toEqual(["93:1", "78:1"]);
  });

  it("ignores corrupt or non-array storage", async () => {
    localStorage.setItem("al-ilm-bookmarks", '{"a":1}');
    const { useBookmarks } = await loadBookmarks();
    const { result } = renderHook(() => useBookmarks());
    expect(result.current.ids).toEqual([]);
  });

  it("picks up changes made in another tab (storage event)", async () => {
    const { useBookmarks } = await loadBookmarks();
    const { result } = renderHook(() => useBookmarks());
    act(() => {
      localStorage.setItem("al-ilm-bookmarks", JSON.stringify(["80:1"]));
      window.dispatchEvent(new StorageEvent("storage", { key: "al-ilm-bookmarks" }));
    });
    expect(result.current.ids).toEqual(["80:1"]);
  });
});

describe("journal", () => {
  const loadJournal = () => load<typeof import("@/lib/journal")>("@/lib/journal");

  it("saves and reads a note", async () => {
    const { useJournal } = await loadJournal();
    const { result } = renderHook(() => useJournal());
    act(() => result.current.setNote("78:2", "Seek reliable answers."));
    expect(result.current.notes["78:2"]).toBe("Seek reliable answers.");
    expect(JSON.parse(localStorage.getItem("al-ilm-journal")!)).toEqual({ "78:2": "Seek reliable answers." });
  });

  it("deletes a note when its text is cleared or whitespace-only", async () => {
    const { useJournal } = await loadJournal();
    const { result } = renderHook(() => useJournal());
    act(() => result.current.setNote("78:2", "x"));
    act(() => result.current.setNote("78:2", "   "));
    expect(result.current.notes).toEqual({});
  });

  it("caps notes at MAX_NOTE_CHARS", async () => {
    const { useJournal, MAX_NOTE_CHARS } = await loadJournal();
    const { result } = renderHook(() => useJournal());
    act(() => result.current.setNote("78:2", "a".repeat(MAX_NOTE_CHARS + 500)));
    expect(result.current.notes["78:2"]).toHaveLength(MAX_NOTE_CHARS);
  });

  it("does nothing when clearing a note that does not exist", async () => {
    const { useJournal } = await loadJournal();
    const { result } = renderHook(() => useJournal());
    act(() => result.current.setNote("78:2", ""));
    expect(localStorage.getItem("al-ilm-journal")).toBeNull();
  });

  it("discards entries with invalid ids or non-string values", async () => {
    localStorage.setItem("al-ilm-journal", JSON.stringify({ "78:2": "ok", bad: "x", "93:1": 5 }));
    const { useJournal } = await loadJournal();
    const { result } = renderHook(() => useJournal());
    expect(result.current.notes).toEqual({ "78:2": "ok" });
  });

  it("survives corrupt storage", async () => {
    localStorage.setItem("al-ilm-journal", "[[[");
    const { useJournal } = await loadJournal();
    const { result } = renderHook(() => useJournal());
    expect(result.current.notes).toEqual({});
  });
});

describe("readingPrefs", () => {
  const loadPrefs = () => load<typeof import("@/lib/readingPrefs")>("@/lib/readingPrefs");

  it("defaults to size 0, transliteration on, auto theme", async () => {
    const { useReadingPrefs } = await loadPrefs();
    const { result } = renderHook(() => useReadingPrefs());
    expect(result.current.prefs).toEqual({ arabicSize: 0, showTransliteration: true, theme: "auto" });
  });

  it("updates and persists a partial change", async () => {
    const { useReadingPrefs } = await loadPrefs();
    const { result } = renderHook(() => useReadingPrefs());
    act(() => result.current.update({ theme: "dark" }));
    expect(result.current.prefs.theme).toBe("dark");
    expect(result.current.prefs.arabicSize).toBe(0);
    expect(JSON.parse(localStorage.getItem("al-ilm-reading")!).theme).toBe("dark");
  });

  it("rejects out-of-range sizes and unknown themes from storage", async () => {
    localStorage.setItem("al-ilm-reading", JSON.stringify({ arabicSize: 99, theme: "neon", showTransliteration: "yes" }));
    const { useReadingPrefs } = await loadPrefs();
    const { result } = renderHook(() => useReadingPrefs());
    expect(result.current.prefs).toEqual({ arabicSize: 0, showTransliteration: true, theme: "auto" });
  });

  it("restores valid saved prefs", async () => {
    localStorage.setItem("al-ilm-reading", JSON.stringify({ arabicSize: 2, theme: "light", showTransliteration: false }));
    const { useReadingPrefs } = await loadPrefs();
    const { result } = renderHook(() => useReadingPrefs());
    expect(result.current.prefs).toEqual({ arabicSize: 2, showTransliteration: false, theme: "light" });
  });
});
