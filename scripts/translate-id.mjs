/**
 * Generates Indonesian translations for Quran content via a local Ollama model
 * and writes them into the `*Id` fields of the data files.
 *
 *   data/juz30.json          → surahNameTranslationId, translationId,
 *                              lessonTitleId, applicationId,
 *                              tafseerSummaryId, tafseerId
 *   data/verse-clusters.json → keyTakeawayId, lessonId
 *
 * Design:
 *   - Resumable: entries that already have a non-empty `*Id` are skipped.
 *   - Deduplicated: identical English strings are translated once (tafseer and
 *     summaries are shared per surah, so ~37 unique each, not 564).
 *   - Incremental: the data file is saved after every real translation, so a
 *     crash never loses progress. Saves are atomic (temp file + rename).
 *
 * Usage:
 *   node scripts/translate-id.mjs                  # everything, light → heavy
 *   node scripts/translate-id.mjs --only=tafseer   # one pass only
 *   node scripts/translate-id.mjs --limit=5        # cap translations (testing)
 *
 * Passes (order): surahName, translation, clusters, lessons, summary, tafseer
 */

import { readFileSync, writeFileSync, renameSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const JUZ_PATH = join(DATA_DIR, "juz30.json");
const CLUSTERS_PATH = join(DATA_DIR, "verse-clusters.json");

const OLLAMA = "http://localhost:11434";
const MODEL = "llama3.1:8b";

// --- CLI args ---
const args = process.argv.slice(2);
const onlyArg = args.find((a) => a.startsWith("--only="));
const limitArg = args.find((a) => a.startsWith("--limit="));
const ONLY = onlyArg ? onlyArg.split("=")[1].split(",") : null;
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : Infinity;
let translateCount = 0;

const SYSTEM_PROMPT = `You are a professional Islamic translator. Translate the user's English text into clear, natural Indonesian (Bahasa Indonesia).

Rules:
- Preserve the exact meaning faithfully. This is religious content (Quran translations and tafsir); accuracy matters more than style.
- Keep established Islamic terms in their common Indonesian form (e.g. Allah, surah, ayat, tafsir, iman, tauhid, shalat, Kiamat, Akhirat).
- Preserve paragraph breaks exactly: keep every blank line (\\n\\n) where it appears in the source.
- If a line is a bracketed section label like [Refutation of...], translate the words but keep the square brackets.
- Do NOT add commentary, notes, quotation marks, or a "Translation:" prefix. Output ONLY the Indonesian translation.`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// One streamed request. Streaming makes Ollama send headers immediately and
// emit the answer as newline-delimited JSON, so a long generation never trips
// undici's headers/body timeout (which `stream: false` would, by withholding
// headers until the whole answer is ready).
async function streamTranslate(text) {
  const res = await fetch(`${OLLAMA}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      keep_alive: "30m",
      options: { temperature: 0.2 },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}: ${await res.text()}`);

  const decoder = new TextDecoder();
  let buffer = "";
  let out = "";
  for await (const chunk of res.body) {
    buffer += decoder.decode(chunk, { stream: true });
    let nl;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      const obj = JSON.parse(line);
      if (obj.message?.content) out += obj.message.content;
      if (obj.error) throw new Error(`Ollama error: ${obj.error}`);
    }
  }
  return out;
}

async function translateText(text) {
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      let out = (await streamTranslate(text)).trim();
      // Strip a stray leading label or wrapping quotes the model sometimes adds.
      out = out.replace(/^(terjemahan|translation)\s*:\s*/i, "").trim();
      if (out.length > 1 && out.startsWith('"') && out.endsWith('"')) {
        out = out.slice(1, -1).trim();
      }
      return out;
    } catch (e) {
      lastErr = e;
      if (attempt < 4) {
        const backoff = 2000 * 2 ** (attempt - 1); // 2s, 4s, 8s
        process.stdout.write(`retry ${attempt} (${e.code || e.message})… `);
        await sleep(backoff);
      }
    }
  }
  throw lastErr;
}

function saveAtomic(path, obj) {
  const tmp = path + ".tmp";
  writeFileSync(tmp, JSON.stringify(obj, null, 2), "utf-8");
  renameSync(tmp, path);
}

function wantPass(name) {
  return !ONLY || ONLY.includes(name);
}

// Surah name meanings are a small, fixed, well-established set (standard Kemenag
// renderings). The 8B model hallucinates on these context-free titles, so they
// are hand-authored and keyed by surah number (two surahs share the English
// "The Dawn", so the English string alone is ambiguous).
const SURAH_NAME_ID = {
  78: "Berita Besar", 79: "Malaikat-malaikat yang Mencabut", 80: "Ia Bermuka Masam",
  81: "Menggulung", 82: "Terbelah", 83: "Orang-orang yang Curang",
  84: "Terbelah", 85: "Gugusan Bintang", 86: "Yang Datang di Malam Hari",
  87: "Yang Paling Tinggi", 88: "Hari Pembalasan", 89: "Fajar",
  90: "Negeri", 91: "Matahari", 92: "Malam",
  93: "Waktu Dhuha", 94: "Melapangkan", 95: "Buah Tin",
  96: "Segumpal Darah", 97: "Kemuliaan", 98: "Bukti Nyata",
  99: "Kegoncangan", 100: "Kuda Perang yang Berlari Kencang", 101: "Hari Kiamat",
  102: "Bermegah-megahan", 103: "Masa", 104: "Pengumpat",
  105: "Gajah", 106: "Suku Quraisy", 107: "Barang-barang yang Berguna",
  108: "Nikmat yang Berlimpah", 109: "Orang-orang Kafir", 110: "Pertolongan",
  111: "Sabut", 112: "Memurnikan Keesaan Allah", 113: "Waktu Subuh",
  114: "Manusia",
};

function applySurahNames(verses, save) {
  let changed = 0;
  for (const v of verses) {
    const id = SURAH_NAME_ID[v.surah];
    if (id && v.surahNameTranslationId !== id) {
      v.surahNameTranslationId = id;
      changed++;
    }
  }
  if (changed) save();
  console.log(`\n[surahName] applied ${changed} hand-authored surah-name translations`);
}

/**
 * Run one field pass over a list of items with dedupe + resume + incremental save.
 *   items   : array of objects to mutate
 *   enKey   : source English field name
 *   idKey   : target Indonesian field name
 *   save    : () => void, persists the owning data structure
 *   cache   : shared Map(en -> id)
 */
async function runPass(label, items, enKey, idKey, save, cache) {
  // Prime cache from any translations already present (cross-run reuse).
  for (const it of items) {
    const en = it[enKey];
    if (en && it[idKey]) cache.set(en, it[idKey]);
  }

  const pending = items.filter((it) => it[enKey] && !it[idKey]);
  const uniquePending = new Set(pending.map((it) => it[enKey])).size;
  console.log(`\n[${label}] ${pending.length} entries, ${uniquePending} unique to translate`);

  let done = 0;
  for (const it of items) {
    const en = it[enKey];
    if (!en) continue; // null/empty source — leave as-is (English fallback handles it)
    if (it[idKey]) continue; // already translated

    if (cache.has(en)) {
      it[idKey] = cache.get(en);
      continue;
    }
    if (translateCount >= LIMIT) {
      console.log(`  reached --limit=${LIMIT}, stopping pass`);
      return;
    }

    const preview = en.replace(/\s+/g, " ").slice(0, 50);
    process.stdout.write(`  (${++done}/${uniquePending}) ${preview}… `);
    const id = await translateText(en);
    it[idKey] = id;
    cache.set(en, id);
    translateCount++;
    save();
    console.log("ok");
  }
}

async function preflight() {
  let data;
  try {
    const res = await fetch(`${OLLAMA}/api/tags`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (e) {
    console.error(`\nCannot reach Ollama at ${OLLAMA}. Is it running?\n  ${e.message}`);
    process.exit(1);
  }
  const has = (data.models ?? []).some((m) => m.name === MODEL || m.model === MODEL);
  if (!has) {
    console.error(`\nModel "${MODEL}" not found. Pull it with:\n  ollama pull ${MODEL}`);
    process.exit(1);
  }
  console.log(`Ollama OK — using ${MODEL}`);
}

async function main() {
  await preflight();

  const verses = JSON.parse(readFileSync(JUZ_PATH, "utf-8"));
  const clusters = JSON.parse(readFileSync(CLUSTERS_PATH, "utf-8")); // Record<surah, cluster[]>
  const clusterList = Object.values(clusters).flat();

  const saveVerses = () => saveAtomic(JUZ_PATH, verses);
  const saveClusters = () => saveAtomic(CLUSTERS_PATH, clusters);

  // Separate caches per semantic kind so short labels and long prose don't collide.
  const caches = {
    translation: new Map(),
    cluster: new Map(),
    lesson: new Map(),
    summary: new Map(),
    tafseer: new Map(),
  };

  // Light → heavy.
  if (wantPass("surahName")) applySurahNames(verses, saveVerses);

  if (wantPass("translation"))
    await runPass("translation", verses, "translation", "translationId", saveVerses, caches.translation);

  if (wantPass("clusters")) {
    await runPass("cluster.keyTakeaway", clusterList, "keyTakeaway", "keyTakeawayId", saveClusters, caches.cluster);
    await runPass("cluster.lesson", clusterList, "lesson", "lessonId", saveClusters, caches.cluster);
  }

  if (wantPass("lessons")) {
    await runPass("lessonTitle", verses, "lessonTitle", "lessonTitleId", saveVerses, caches.lesson);
    await runPass("application", verses, "application", "applicationId", saveVerses, caches.lesson);
  }

  if (wantPass("summary"))
    await runPass("tafseerSummary", verses, "tafseerSummary", "tafseerSummaryId", saveVerses, caches.summary);

  if (wantPass("tafseer"))
    await runPass("tafseer", verses, "tafseer", "tafseerId", saveVerses, caches.tafseer);

  console.log(`\nDone. ${translateCount} new translation(s) this run.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
