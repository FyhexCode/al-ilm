# Lighthouse baseline

Run: `npm run build`, start the server (`npm run start -- -p 3217`), then `npm run lighthouse`.
Mobile emulation, default throttling, Windows dev machine, 2026-11-26.

| Page | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| `/` | 86 | 100 | 100 | 100 |
| `/browse` | 83 | 100 | 100 | 100 |
| `/verse/78/2` | 83 | 100 | 100 | 100 |
| `/lesson/78/1` | 84 | 100 | 100 | 100 |

**Budgets enforced** (`scripts/lighthouse-check.mjs`, also run in CI): performance >= 70,
accessibility >= 95, best practices >= 90, SEO >= 90. They sit below the baseline so CI-runner noise
does not fail a build, but a real regression does.

## What changed the numbers
Before slimming page payloads (AL-060), `/browse` scored performance 75 and its HTML was 4.46 MB
(213 KB gzip) because every lesson shipped all its verses and tafseer to the browser. It is now
38 KB. `/lesson/78/1` went from 712 KB to 77 KB. HTML size budgets are tested in
`tests/e2e/performance.spec.ts`.

## Known remaining performance cost
Web fonts (Geist, Amiri, Cormorant) and client JS dominate what is left. Candidates: subset Amiri to
Arabic only, preload the hero font, trim unused Cormorant weights.
