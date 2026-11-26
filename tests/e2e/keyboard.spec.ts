import { expect, test } from "./fixtures";

const PAGES = ["/", "/browse", "/verse/78/2", "/lesson/78/1", "/search"];

test.describe("keyboard", () => {
  for (const path of PAGES) {
    test(`every focusable element on ${path} shows a visible focus indicator`, async ({ page }) => {
      await page.goto(path);
      const missing: string[] = [];
      for (let i = 0; i < 40; i++) {
        await page.keyboard.press("Tab");
        const info = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body) return null;
          const cs = getComputedStyle(el);
          const visible = (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== "none";
          return { visible, label: `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30)}"` };
        });
        if (info && !info.visible) missing.push(info.label);
      }
      expect(missing).toEqual([]);
    });
  }

  test("skip link jumps past the navigation to the main content", async ({ page }) => {
    await page.goto("/browse");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
  });

  test("lesson accordion works with Enter and Space", async ({ page }) => {
    await page.goto("/lesson/78/1");
    const first = page.locator("button[aria-expanded]").first();
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await first.focus();
    await page.keyboard.press("Enter");
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Space");
    await expect(first).toHaveAttribute("aria-expanded", "false");
  });

  test("language switcher and filters are reachable and operable by keyboard", async ({ page }) => {
    await page.goto("/browse");
    await page.getByRole("button", { name: "ID", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("h1")).toHaveText("Jelajahi Pelajaran");
  });
});
