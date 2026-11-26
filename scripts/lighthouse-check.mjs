/**
 * Lighthouse budget check against a running production server.
 *   npm run build && npm run start -- -p 3217   (in another terminal)
 *   npm run lighthouse
 * Fails (exit 1) if any category drops below its threshold. Override the URL with LH_BASE_URL.
 * With LH_START_SERVER=1 the script starts and stops `next start` itself (used in CI).
 */
import { spawn } from "node:child_process";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const BASE = process.env.LH_BASE_URL ?? "http://localhost:3217";
const PAGES = ["/", "/browse", "/verse/78/2", "/lesson/78/1"];
const IN_CI = !!process.env.GITHUB_ACTIONS;

// Thresholds sit a little below the recorded baseline (docs/lighthouse-baseline.md) so noise does not
// fail the build but a real regression does. Scores are 0-100. Performance is looser on shared CI runners.
const THRESHOLDS = {
  performance: IN_CI ? 50 : 70,
  accessibility: 95,
  "best-practices": 90,
  seo: 90,
};

async function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const { chromium } = await import("@playwright/test");
  return chromium.executablePath();
}

/** GitHub Actions annotations surface results on the run page without opening the raw log. */
function annotate(level, title, message) {
  if (IN_CI) console.log(`::${level} title=${title}::${message}`);
}

async function startServer() {
  const port = new URL(BASE).port || "3217";
  const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", port], {
    stdio: "inherit",
  });
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE)).ok) return server;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  server.kill();
  throw new Error(`Server did not start at ${BASE}`);
}

async function main() {
  const server = process.env.LH_START_SERVER ? await startServer() : null;
  try {
    await run();
  } finally {
    server?.kill();
  }
}

async function run() {
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
      const scores = Object.fromEntries(
        Object.keys(THRESHOLDS).map((k) => [k, Math.round((cats[k].score ?? 0) * 100)])
      );
      rows.push({ path, ...scores });
      annotate(
        "notice",
        `Lighthouse ${path}`,
        `perf ${scores.performance} / a11y ${scores.accessibility} / bp ${scores["best-practices"]} / seo ${scores.seo}`
      );
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
    annotate("error", "Lighthouse budgets", failures.join("; "));
    process.exitCode = 1; // not process.exit(): main() must still stop the server it started
    return;
  }
  console.log("Lighthouse budgets met.");
}

main().catch((error) => {
  console.error(error);
  annotate("error", "Lighthouse crashed", String(error?.message ?? error).replace(/\r?\n/g, " "));
  process.exit(1);
});
