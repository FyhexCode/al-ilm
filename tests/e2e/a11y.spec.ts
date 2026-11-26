import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures";

const PAGES = ["/", "/browse", "/search?q=patience", "/saved", "/journal", "/verse/78/2", "/lesson/78/1", "/lesson/78/1#verses"];
const THEMES = ["light", "dark"] as const;

// Serious/critical WCAG 2.x A/AA violations fail the build.
for (const theme of THEMES) {
  for (const path of PAGES) {
    test(`a11y (${theme}): ${path}`, async ({ page }) => {
      await page.addInitScript((t) => {
        localStorage.setItem("al-ilm-reading", JSON.stringify({ arabicSize: 0, showTransliteration: true, theme: t }));
      }, theme);
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const blocking = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      const summary = blocking.map(
        (v) => `${v.id} [${v.impact}] x${v.nodes.length}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`
      );
      expect(summary, "axe violations").toEqual([]);
    });
  }
}
