import { expect, test } from "./fixtures";

test.describe("language", () => {
  test("switching to Indonesian translates the UI and persists across pages", async ({ page }) => {
    await page.goto("/browse");
    await page.getByRole("button", { name: "ID", exact: true }).click();
    await expect(page.locator("h1")).toHaveText("Jelajahi Pelajaran");
    await expect(page.locator("html")).toHaveAttribute("lang", "id");

    await page.goto("/search");
    await expect(page.locator("h1")).toHaveText("Cari ayat");
    await page.reload();
    await expect(page.locator("h1")).toHaveText("Cari ayat");
  });
});

test.describe("reading settings", () => {
  test("Arabic size and transliteration toggle apply and persist", async ({ page }) => {
    await page.goto("/verse/78/2");
    const arabic = page.locator(".arabic").first();
    const before = parseFloat(await arabic.evaluate((el) => getComputedStyle(el).fontSize));

    await page.getByRole("button", { name: "Reading settings" }).click();
    await page.getByRole("button", { name: "Arabic size 4" }).click();
    await page.getByLabel("Show transliteration").uncheck();

    const after = parseFloat(await arabic.evaluate((el) => getComputedStyle(el).fontSize));
    expect(after).toBeGreaterThan(before * 1.5);
    await expect(page.locator(".translit").first()).toBeHidden();

    await page.goto("/verse/78/3");
    await expect(page.locator(".translit").first()).toBeHidden();
    const persisted = parseFloat(await page.locator(".arabic").first().evaluate((el) => getComputedStyle(el).fontSize));
    expect(persisted).toBeCloseTo(after, 0);
  });

  test("Escape closes the settings menu", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Reading settings" }).click();
    await expect(page.getByText("Arabic size", { exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByText("Arabic size", { exact: true })).toBeHidden();
  });
});

test.describe("theme", () => {
  test("dark theme applies, changes colours, and persists without a flash", async ({ page }) => {
    await page.goto("/browse");
    const lightBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    await page.getByRole("button", { name: "Reading settings" }).click();
    await page.getByRole("button", { name: "Dark", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    const darkBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(darkBg).not.toBe(lightBg);

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(darkBg);
  });

  test("follows the OS preference in Auto mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/browse");
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await page.emulateMedia({ colorScheme: "light" });
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).not.toBe(bg);
  });
});
