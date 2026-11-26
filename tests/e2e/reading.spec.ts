import { expect, test } from "./fixtures";

test.describe("verse page", () => {
  test("bookmark persists across reloads and appears on /saved", async ({ page }) => {
    await page.goto("/verse/78/2");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByRole("button", { name: "Saved", exact: true })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("button", { name: "Saved", exact: true })).toBeVisible();

    await page.goto("/saved");
    await expect(page.locator("main li").filter({ hasText: "An-Naba 78:2" })).toBeVisible();
    await page.getByRole("button", { name: "Remove from saved" }).click();
    await expect(page.getByText(/No saved verses yet/)).toBeVisible();
  });

  test("journal note autosaves, lists on /journal and can be deleted", async ({ page }) => {
    await page.goto("/verse/78/2");
    await page.getByLabel("Your reflection").fill("Seek reliable answers.");

    await page.goto("/journal");
    const entry = page.locator("main li").filter({ hasText: "Seek reliable answers." });
    await expect(entry).toBeVisible();
    await expect(page.getByRole("button", { name: "Export as text" })).toBeVisible();
    await entry.getByRole("button", { name: "Delete reflection" }).click();
    await expect(page.getByText(/No reflections yet/)).toBeVisible();
  });

  test("shows the lesson card and offers copy, save-as-image and share", async ({ page }) => {
    await page.goto("/verse/78/2");
    await expect(page.getByText("The lesson in this verse")).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy verse" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Save as image" })).toHaveAttribute("href", /\/og\/78\/2\?lang=en/);
    await expect(page.getByRole("button", { name: "Share verse" })).toBeVisible();
  });

  test("exposes Open Graph image metadata", async ({ page }) => {
    await page.goto("/verse/78/2");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\/78\/2$/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  });
});

test.describe("lesson page", () => {
  test("restores the tab from the URL hash and supports arrow keys", async ({ page }) => {
    await page.goto("/lesson/78/1#tafseer");
    await expect(page.getByRole("tab", { name: "Tafseer" })).toHaveAttribute("aria-selected", "true");

    await page.getByRole("tab", { name: "Tafseer" }).focus();
    await page.keyboard.press("Home");
    await expect(page.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
    await expect(page).not.toHaveURL(/#/);

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Verses" })).toHaveAttribute("aria-selected", "true");
    await expect(page).toHaveURL(/#verses/);
  });

  test("has exactly three tabs (the redundant Surah tab is gone)", async ({ page }) => {
    await page.goto("/lesson/78/1");
    await expect(page.getByRole("tab")).toHaveText(["Overview", "Verses", "Tafseer"]);
  });

  test("marking a surah read updates the card badge and Browse progress", async ({ page }) => {
    await page.goto("/lesson/78/1");
    await page.getByRole("button", { name: "Mark this surah as read" }).click();
    await expect(page.getByRole("button", { name: /Read — tap to undo/ })).toBeVisible();

    await page.goto("/browse");
    await expect(page.getByText("1 of 37 surahs read")).toBeVisible();
    await expect(page.locator("main a").filter({ hasText: "An-Naba" }).getByText("✓ Read")).toBeVisible();
    await expect(page.getByText(/1-day streak/)).toBeVisible();
  });
});
