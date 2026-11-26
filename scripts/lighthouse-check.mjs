/**
 * Lighthouse budget check against a running production server.
 *   npm run build && npm run start -- -p 3217   (in another terminal)
 *   npm run lighthouse
 * Fails (exit 1) if any category drops below its threshold. Override the URL with LH_BASE_URL.
 */
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const BASE = process.env.LH_BASE_URL ?? "http://localhost:3217";
const PAGES = ["/", "/browse", "/verse/78/2", "/lesson/78/1"];

// Thresholds sit a little below the recorded baseline (docs/lighthouse-baseline.md) so noise does not
// fail the build but a real regression does. Scores are 0-100.
const THRESHOLDS = { performance: 70, accessibility: 95, "best-practices": 90, seo: 90 };

async function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const { chromium } = await import("@playwright/test");
  return chromium.executablePath();
}

const chrome = await launch({
  chromePath: await chromePath(),
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
});

const failures = [];
const rows = [];
try {
  for (const path of PAGES) {
    const result = await lighthouse(`${BASE}${path}`, {
      port: chrome.port,
      output: "json",
      logLevel: "error",
      onlyCategories: Object.keys(THRESHOLDS),
    });
    const cats = result.lhr.categories;
    const scores = Object.fromEntries(Object.keys(THRESHOLDS).map((k) => [k, Math.round((cats[k].score ?? 0) * 100)]));
    rows.push({ path, ...scores });
    for (const [k, min] of Object.entries(THRESHOLDS)) {
      if (scores[k] < min) failures.push(`${path}: ${k} ${scores[k]} < ${min}`);
    }
  }
} finally {
  await chrome.kill();
}

console.table(rows);
if (failures.length) {
  console.error("Lighthouse budget failures:\n" + failures.join("\n"));
  process.exit(1);
}
console.log("Lighthouse budgets met.");
