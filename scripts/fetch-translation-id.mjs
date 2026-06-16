/**
 * Fills `translationId` on every verse in data/juz30.json with the OFFICIAL
 * Indonesian Quran translation (Kemenag) from alquran.cloud — the same source
 * and method as fetch-juz30.mjs. This replaces the machine-translated verse text.
 *
 * Run: node scripts/fetch-translation-id.mjs
 */

import { readFileSync, writeFileSync, renameSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const JUZ_PATH = join(__dirname, "..", "data", "juz30.json");
const EDITION = "id.indonesian"; // Kemenag — official Indonesian translation

function saveAtomic(path, obj) {
  const tmp = path + ".tmp";
  writeFileSync(tmp, JSON.stringify(obj, null, 2), "utf-8");
  renameSync(tmp, path);
}

async function main() {
  console.log(`Fetching ${EDITION} (Juz 30)…`);
  const res = await fetch(`https://api.alquran.cloud/v1/juz/30/${EDITION}`);
  if (!res.ok) throw new Error(`alquran.cloud HTTP ${res.status}`);
  const ayahs = (await res.json()).data.ayahs;

  const map = new Map();
  for (const a of ayahs) {
    map.set(`${a.surah.number}:${a.numberInSurah}`, a.text.trim());
  }
  console.log(`Got ${map.size} Indonesian ayahs.`);

  const verses = JSON.parse(readFileSync(JUZ_PATH, "utf-8"));
  let updated = 0;
  const missing = [];
  for (const v of verses) {
    const t = map.get(`${v.surah}:${v.ayah}`);
    if (t) {
      v.translationId = t;
      updated++;
    } else {
      missing.push(`${v.surah}:${v.ayah}`);
    }
  }

  saveAtomic(JUZ_PATH, verses);
  console.log(`Updated translationId on ${updated}/${verses.length} verses.`);
  if (missing.length) console.log(`Missing (left as-is): ${missing.join(", ")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
