import { expect, test } from "./fixtures";

// Pixel baselines are rendered on Windows (font rasterisation differs per OS), so they are
// compared locally only. Regenerate intentionally with: npx playwright test visual --update-snapshots
test.skip(!!process.env.CI, "visual baselines are platform-specific; run locally");

test.use({ deviceScaleFactor: 1 });

const PAGES = [
  { name: "browse", path: "/browse" },
  { name: "verse", path: "/verse/78/2" },
  { name: "lesson-verses", path: "/lesson/78/1#verses" },
  { name: "lesson-overview", path: "/lesson/78/1" },
  { name: "search-empty", path: "/search" },
  { name: "saved-empty", path: "/saved" },
];

for (const theme of ["light", "dark"] as const) {
  test.describe(`visual (${theme})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((t) => {
        localStorage.setItem("al-ilm-reading", JSON.stringify({ arabicSize: 0, showTransliteration: true, theme: t }));
      }, theme);
    });

    for (const { name, path } of PAGES) {
      test(name, async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        await page.evaluate(() => document.fonts.ready);
        await expect(page).toHaveScreenshot(`${name}-${theme}.png`, {
          animations: "disabled",
          maxDiffPixels: 150,
        });
      });
    }

    // The home page's daily verse changes every day, so only the static theme grid is compared.
    test("home-theme-grid", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => document.fonts.ready);
      const grid = page.locator("section").filter({ has: page.getByRole("heading", { name: "Browse by Theme" }) });
      await grid.scrollIntoViewIfNeeded();
      await expect(grid).toHaveScreenshot(`home-theme-grid-${theme}.png`, {
        animations: "disabled",
        maxDiffPixels: 150,
      });
    });
  });
}
