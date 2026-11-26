import { expect, test } from "./fixtures";

// HTML size budgets guard against shipping whole datasets to the client again
// (Browse was 4.4 MB and the lesson page 712 KB before they were slimmed).
const BUDGETS: Record<string, number> = {
  "/": 80_000,
  "/browse": 100_000,
  "/lesson/78/1": 150_000,
  "/lesson/79/1": 150_000,
  "/verse/78/2": 100_000,
  "/search": 40_000,
};

for (const [path, maxBytes] of Object.entries(BUDGETS)) {
  test(`HTML for ${path} stays under ${Math.round(maxBytes / 1000)} KB`, async ({ request }) => {
    const res = await request.get(path);
    expect(res.status()).toBe(200);
    const size = (await res.body()).length;
    expect(size, `${path} is ${size} bytes`).toBeLessThan(maxBytes);
  });
}
