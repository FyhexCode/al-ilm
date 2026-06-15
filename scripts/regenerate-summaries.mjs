/**
 * Re-extracts tafseerSummary for every verse in data/juz30.json
 * using improved extraction logic. No API calls — reads existing tafseer text.
 *
 * Run: node scripts/regenerate-summaries.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "data", "juz30.json");

const CONNECTOR_RE = /^(meaning[,;]?|that is[,;]?|i\.e\.[,;]?|which means[,;]?|this means[,;]?)\s*/i;
const SKIP_START_RE = /^(Then |After |Following |So |He said|He would|It is said|As for |Also,|This is the end|Both of them|Al-Bukhari|Muslim |Imam |Ibn |Abu |The two Sahihs|This Hadith|He \(Ibn|«|\([\d]+:[\d]+\)|That |Is |Was |Were |Will |Includes |When they|When he|I said|" |Verily, We|Ahmad |At-Tirmidhi|An-Nasa|Qatadah|Ad-Dahhak|As-Suddi|Mujahid|Waraqah|Ikrimah|Surat |Means,|Meaning,|Which means|It has been |This was recorded|This has been|There is a narration|And \(|From the evil|From other)/i;
const HAS_ARABIC_RE = /[؀-ۿݐ-ݿ«»]/; // Arabic Unicode block + guillemets

function extractSummary(cleanedText, maxChars = 380) {
  if (!cleanedText) return null;

  const paragraphs = cleanedText
    .split("\n\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  for (const para of paragraphs) {
    // Skip section headers
    if (para.startsWith("[")) continue;
    // Skip Bismillah / opening boilerplate
    if (para.startsWith("In the Name of Allah")) continue;

    let candidate;

    if (para.startsWith("(")) {
      // Pattern: (verse quote) explanation text
      // Find the outermost closing paren that ends the verse quote
      let depth = 0;
      let closeIdx = -1;
      for (let i = 0; i < para.length; i++) {
        if (para[i] === "(") depth++;
        else if (para[i] === ")") {
          depth--;
          if (depth === 0) { closeIdx = i; break; }
        }
      }
      if (closeIdx === -1) continue; // unclosed paren

      const afterParen = para.slice(closeIdx + 1).trim();
      if (afterParen.length < 50) continue; // pure verse quote with no explanation

      // Strip leading connector words
      candidate = afterParen.replace(CONNECTOR_RE, "").trim();
      if (!candidate || candidate.length < 50) continue;
      // Apply same skip rules + capitalize
      if (SKIP_START_RE.test(candidate)) continue;
      candidate = candidate.charAt(0).toUpperCase() + candidate.slice(1);
    } else {
      // Standalone paragraph
      candidate = para;
      if (SKIP_START_RE.test(candidate)) continue;
    }

    // Reject incomplete sentences
    const last = candidate[candidate.length - 1];
    if (last === "," || last === ":" || last === ";") continue;
    // Must be substantive
    if (candidate.length < 60) continue;
    // Must be pure English — no Arabic Unicode
    if (HAS_ARABIC_RE.test(candidate)) continue;
    // Must start with an uppercase letter
    if (!/^[A-Z]/.test(candidate)) continue;

    // Truncate at sentence boundary within maxChars
    return truncateAtSentence(candidate, maxChars);
  }

  // Fallback: first paragraph that is clean English and ends with a sentence terminator
  for (const para of paragraphs) {
    if (para.startsWith("[")) continue;
    if (para.startsWith("In the Name of Allah")) continue;
    if (para.length < 80) continue;
    if (HAS_ARABIC_RE.test(para)) continue;
    if (SKIP_START_RE.test(para)) continue;

    let text = para;
    if (text.startsWith("(")) {
      const closeIdx = text.indexOf(")");
      if (closeIdx !== -1) {
        const after = text.slice(closeIdx + 1).replace(CONNECTOR_RE, "").trim();
        // Only use the after-paren text if it ends with a sentence terminator and passes skip rules
        if (after.length > 40 && /[.!?]/.test(after[after.length - 1]) && !SKIP_START_RE.test(after)) {
          text = after.charAt(0).toUpperCase() + after.slice(1);
        } else {
          continue; // skip verse-quote-only paragraphs or bad starts
        }
      }
    }

    if (HAS_ARABIC_RE.test(text)) continue;
    if (!/[.!?]/.test(text[text.length - 1])) continue; // must end with a sentence
    if (!/^[A-Z]/.test(text)) continue;
    return truncateAtSentence(text, maxChars);
  }

  return null;
}

function truncateAtSentence(text, maxChars) {
  if (text.length <= maxChars) return text;
  // Find last sentence-ending punctuation before maxChars
  const slice = text.slice(0, maxChars);
  const lastDot = Math.max(
    slice.lastIndexOf(". "),
    slice.lastIndexOf("! "),
    slice.lastIndexOf("? ")
  );
  if (lastDot > maxChars * 0.4) {
    return text.slice(0, lastDot + 1).trim();
  }
  // Fall back to word boundary
  const cut = slice.lastIndexOf(" ");
  return text.slice(0, cut > 0 ? cut : maxChars) + "…";
}

// --- Main ---
const verses = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

// Process per surah (all verses share the same tafseer within a surah)
const surahsSeen = new Set();
let updated = 0;
let improved = 0;

for (const verse of verses) {
  if (surahsSeen.has(verse.surah)) continue;
  surahsSeen.add(verse.surah);

  if (!verse.tafseer) continue;

  const newSummary = extractSummary(verse.tafseer);
  const oldSummary = verse.tafseerSummary;

  const changed = newSummary !== oldSummary;
  if (changed) improved++;

  // Apply new summary to all verses of this surah
  for (const v of verses) {
    if (v.surah === verse.surah) {
      v.tafseerSummary = newSummary;
      updated++;
    }
  }

  // Print diff for spot-checking
  const surahName = verse.surahName;
  console.log(`\nSurah ${verse.surah} (${surahName}):`);
  if (changed) {
    console.log(`  OLD: ${(oldSummary || "null").slice(0, 100)}...`);
    console.log(`  NEW: ${(newSummary || "null").slice(0, 100)}...`);
  } else {
    console.log(`  unchanged: ${(newSummary || "null").slice(0, 80)}...`);
  }
}

writeFileSync(DATA_PATH, JSON.stringify(verses, null, 2), "utf-8");
console.log(`\nDone. Updated ${updated} verses across ${surahsSeen.size} surahs. ${improved} summaries changed.`);
