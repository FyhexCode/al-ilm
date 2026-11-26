import { describe, expect, it } from "vitest";
import { getAllVerses } from "@/lib/getAllVerses";

// Smoke test: proves the runner, the "@/" alias and JSON imports all work.
describe("test environment", () => {
  it("resolves the @/ alias and loads the Juz 30 data", () => {
    expect(getAllVerses()).toHaveLength(564);
  });

  it("provides a browser-like environment with storage", () => {
    localStorage.setItem("probe", "1");
    expect(localStorage.getItem("probe")).toBe("1");
  });

  it("starts each test with cleared storage", () => {
    expect(localStorage.getItem("probe")).toBeNull();
  });
});
