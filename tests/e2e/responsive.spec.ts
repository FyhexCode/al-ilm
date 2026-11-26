import { expect, test } from "./fixtures";

// Runs on the "mobile" project (Pixel 7).
test.describe("mobile layout", () => {
  for (const path of ["/", "/browse", "/search", "/saved", "/journal", "/verse/78/2", "/lesson/78/1"]) {
    test(`no horizontal scroll on ${path}`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflow).toBe(false);
    });
  }

  test("navbar keeps the logo on one line and everything inside the viewport", async ({ page }) => {
    await page.goto("/");
    const logo = page.locator("header a[href='/'] span").first();
    expect((await logo.boundingBox())!.height).toBeLessThan(26);
    const rights = await page.locator("header nav a, header nav button").evaluateAll((els) =>
      els.map((e) => e.getBoundingClientRect().right)
    );
    expect(Math.max(...rights)).toBeLessThanOrEqual(page.viewportSize()!.width);
  });
});
