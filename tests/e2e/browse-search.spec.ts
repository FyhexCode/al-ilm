import { expect, test } from "./fixtures";

test.describe("home", () => {
  test("shows today's lesson and links category chips to Browse", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Lesson of the Day")).toBeVisible();
    const chip = page.locator("a[href^='/browse?category=']").first();
    await expect(chip).toBeVisible();
    await expect(chip).not.toHaveText(/^(judgment|signs|guidance|purification|gratitude|faith|lessons)$/);
  });
});

test.describe("browse", () => {
  test("lists all 37 lessons with takeaway previews and progress", async ({ page }) => {
    await page.goto("/browse");
    await expect(page.locator("main h2")).toHaveCount(37);
    await expect(page.getByRole("progressbar")).toBeVisible();
    await expect(page.locator("main a p.line-clamp-2").first()).not.toBeEmpty();
  });

  test("category filter narrows results and is reflected in the URL", async ({ page }) => {
    await page.goto("/browse");
    await page.getByRole("button", { name: "Day of Judgment" }).click();
    await expect(page).toHaveURL(/category=judgment/);
    const filtered = await page.locator("main h2").count();
    expect(filtered).toBeGreaterThan(0);
    expect(filtered).toBeLessThan(37);

    await page.reload();
    await expect(page.locator("main h2")).toHaveCount(filtered);
    await expect(page.getByRole("button", { name: "Day of Judgment" })).toHaveClass(/bg-gold/);
  });

  test("sorting by most verses puts the longest surah first", async ({ page }) => {
    await page.goto("/browse");
    await page.getByLabel("Sort by").selectOption("longest");
    await expect(page).toHaveURL(/sort=longest/);
    await expect(page.locator("main h2").first()).toHaveText("An-Naazi'aat");
  });

  test("unknown category falls back to all lessons", async ({ page }) => {
    await page.goto("/browse?category=nonsense");
    await expect(page.locator("main h2")).toHaveCount(37);
  });
});

test.describe("search", () => {
  test("finds verses by meaning and opens one", async ({ page }) => {
    await page.goto("/search");
    await page.getByRole("searchbox").fill("patience");
    await expect(page.getByText(/\d+ results/)).toBeVisible();
    await page.locator("main ul li a").first().click();
    await expect(page).toHaveURL(/\/verse\/\d+\/\d+/);
  });

  test("finds verses from an Arabic query ignoring diacritics", async ({ page }) => {
    await page.goto("/search?q=" + encodeURIComponent("اللّٰه"));
    await expect(page.getByText(/\d+ results/)).toBeVisible();
  });

  test("shows a friendly empty state", async ({ page }) => {
    await page.goto("/search");
    await page.getByRole("searchbox").fill("zzzzqqxx");
    await expect(page.getByText(/No verses found/)).toBeVisible();
  });

  test("keeps the query in the URL", async ({ page }) => {
    await page.goto("/search");
    await page.getByRole("searchbox").fill("mercy");
    await expect(page).toHaveURL(/q=mercy/);
  });
});

test.describe("routes", () => {
  test("/random redirects to a verse page", async ({ page }) => {
    await page.goto("/random");
    await expect(page).toHaveURL(/\/verse\/\d+\/\d+/);
  });

  test("share card is a PNG, and unknown verses 404", async ({ request }) => {
    const ok = await request.get("/og/78/2");
    expect(ok.status()).toBe(200);
    expect(ok.headers()["content-type"]).toBe("image/png");
    expect((await ok.body()).length).toBeGreaterThan(5000);
    expect((await request.get("/og/1/1")).status()).toBe(404);
  });

  test("API rejects malformed ids safely", async ({ request }) => {
    const res = await request.get("/api/verses?ids=78:1,bad,999:999,<script>");
    expect(res.status()).toBe(200);
    const { results } = await res.json();
    expect(results.map((r: { surah: number; ayah: number }) => `${r.surah}:${r.ayah}`)).toEqual(["78:1"]);
  });
});
