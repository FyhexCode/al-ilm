/**
 * One-time script: fetches Juz 30 data + Ibn Kathir tafseer (English, abridged)
 * and writes to data/juz30.json
 *
 * Strategy: one tafseer API call per surah (37 calls total), applied to all verses.
 *
 * Run: node scripts/fetch-juz30.mjs
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TAFSEER_ID = 169; // Ibn Kathir (Abridged) — English

const JUZ30_SURAHS = Array.from({ length: 37 }, (_, i) => 78 + i); // 78–114

const SURAH_CATEGORIES = {
  78: ["judgment", "signs"],   79: ["judgment", "signs"],
  80: ["guidance", "lessons"], 81: ["judgment", "signs"],
  82: ["judgment", "faith"],   83: ["judgment", "guidance"],
  84: ["judgment", "signs"],   85: ["lessons", "faith"],
  86: ["signs", "faith"],      87: ["purification", "guidance"],
  88: ["judgment", "signs", "guidance"], 89: ["lessons", "judgment"],
  90: ["guidance", "lessons"], 91: ["purification", "signs"],
  92: ["guidance", "purification"], 93: ["gratitude", "guidance"],
  94: ["gratitude", "guidance"], 95: ["guidance", "judgment", "signs"],
  96: ["guidance", "lessons"], 97: ["faith", "gratitude"],
  98: ["faith", "guidance"],   99: ["judgment"],
  100: ["judgment", "signs"],  101: ["judgment"],
  102: ["judgment", "guidance"], 103: ["guidance", "faith"],
  104: ["judgment", "guidance"], 105: ["lessons"],
  106: ["gratitude", "guidance"], 107: ["guidance", "faith"],
  108: ["gratitude", "faith"], 109: ["faith"],
  110: ["faith", "gratitude"], 111: ["lessons", "judgment"],
  112: ["faith"],              113: ["faith", "purification"],
  114: ["faith", "purification"],
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchEdition(edition) {
  const url = `https://api.alquran.cloud/v1/juz/30/${edition}`;
  console.log(`  Fetching ${edition}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${edition}: ${res.status}`);
  return (await res.json()).data.ayahs;
}

function isArabicDominant(text) {
  const arabic = (text.match(/[؀-ۿ]/g) || []).length;
  const latin = (text.match(/[a-zA-Z]/g) || []).length;
  return arabic > latin * 0.5;
}

function cleanTafseer(html) {
  if (!html) return "";
  return html
    .replace(/<h2[^>]*>(.*?)<\/h2>/gs, (_, h) => {
      const s = h.replace(/<[^>]+>/g, "").trim();
      return s ? `[${s}]\n` : "";
    })
    .replace(/<p[^>]*>(.*?)<\/p>/gs, (_, p) => {
      const s = p.replace(/<[^>]+>/g, "").trim();
      if (!s || isArabicDominant(s)) return "";
      return s + "\n\n";
    })
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&ldquo;|&#8220;/g, "“").replace(/&rdquo;|&#8221;/g, "”")
    .replace(/&lsquo;|&#8216;/g, "‘").replace(/&rsquo;|&#8217;/g, "’")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractSummary(cleanedText, maxChars = 320) {
  const paras = cleanedText.split("\n\n").map((p) => p.trim())
    .filter((p) => p && !p.startsWith("[") && p.length > 40);
  const first = paras[0] || "";
  if (!first) return null;
  if (first.length <= maxChars) return first;
  const cut = first.lastIndexOf(" ", maxChars);
  return first.slice(0, cut > 0 ? cut : maxChars) + "…";
}

async function fetchTafseerForSurah(surahNum) {
  const url = `https://api.quran.com/api/v4/tafsirs/${TAFSEER_ID}/by_chapter/${surahNum}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Tafseer fetch failed for surah ${surahNum}: ${res.status}`);
  const json = await res.json();
  // First block has the actual text (all others are empty)
  const block = (json.tafsirs || []).find((t) => t.text && t.text.length > 0);
  return block ? block.text : null;
}

async function main() {
  console.log("\n[1/3] Fetching verse text (Arabic, transliteration, translation)...");
  const [arabicAyahs, translitAyahs, translationAyahs] = await Promise.all([
    fetchEdition("quran-uthmani"),
    fetchEdition("en.transliteration"),
    fetchEdition("en.sahih"),
  ]);

  console.log(`\n[2/3] Fetching Ibn Kathir tafseer for ${JUZ30_SURAHS.length} surahs...`);

  // Map: surahNum -> { tafseer, tafseerSummary }
  const surahTafseer = new Map();

  for (const surahNum of JUZ30_SURAHS) {
    try {
      await sleep(200);
      const rawText = await fetchTafseerForSurah(surahNum);
      const tafseer = cleanTafseer(rawText || "");
      const tafseerSummary = extractSummary(tafseer);
      surahTafseer.set(surahNum, { tafseer: tafseer || null, tafseerSummary });
      console.log(`  Surah ${surahNum}: ${tafseer ? tafseer.length + " chars" : "no text"}`);
    } catch (err) {
      console.warn(`  Warning: surah ${surahNum} tafseer failed: ${err.message}`);
      surahTafseer.set(surahNum, { tafseer: null, tafseerSummary: null });
    }
  }

  console.log("\n[3/3] Merging and writing data...");

  // Group ayah counts per surah for group labelling
  const surahAyahCounts = {};
  for (const a of arabicAyahs) {
    surahAyahCounts[a.surah.number] = Math.max(
      surahAyahCounts[a.surah.number] || 0,
      a.numberInSurah
    );
  }

  const verses = arabicAyahs.map((ayah, i) => {
    const surah = ayah.surah.number;
    const t = surahTafseer.get(surah) || { tafseer: null, tafseerSummary: null };
    const totalAyahs = surahAyahCounts[surah] || 1;

    return {
      surah,
      surahName: ayah.surah.englishName,
      surahNameTranslation: ayah.surah.englishNameTranslation,
      surahNameAr: ayah.surah.name,
      ayah: ayah.numberInSurah,
      arabic: ayah.text,
      transliteration: translitAyahs[i].text,
      translation: translationAyahs[i].text,
      juz: 30,
      categories: SURAH_CATEGORIES[surah] || [],
      tafseer: t.tafseer,
      tafseerSummary: t.tafseerSummary,
      tafseerGroup: `${surah}:1`,
      tafseerGroupEnd: `${surah}:${totalAyahs}`,
      tafseerVerseCount: totalAyahs,
    };
  });

  mkdirSync(join(ROOT, "data"), { recursive: true });
  const outPath = join(ROOT, "data", "juz30.json");
  writeFileSync(outPath, JSON.stringify(verses, null, 2), "utf-8");

  const withTafseer = verses.filter((v) => v.tafseer).length;
  console.log(`\nWrote ${verses.length} verses to data/juz30.json`);
  console.log(`Tafseer coverage: ${withTafseer}/${verses.length} verses (${Math.round(withTafseer/verses.length*100)}%)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
