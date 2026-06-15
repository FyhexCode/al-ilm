import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "../data/juz30.json");

const OLLAMA_URL = "http://localhost:11434/v1/chat/completions";
const MODEL = "llama3.1:8b";

const SYSTEM_PROMPT = `You are generating content for an Islamic educational app called Al-Ilm.
For each Quranic verse, produce a lessonTitle and application field.

lessonTitle: A short, punchy actionable lesson drawn from the verse.
- 12 words or fewer
- Present-tense, active voice
- Do NOT start with "Allah"
- No quotation marks
- Should feel like an insight or principle, not a headline

application: How to apply this lesson in daily life.
- 2-3 sentences
- Second person ("When you...", "Try to...", "Each day...")
- Concrete, practical daily action
- Warm and encouraging tone

Respond ONLY with a valid JSON array. Each element must have exactly:
{ "lessonTitle": "...", "application": "..." }
The array must be the same length as the input array, in the same order.`;

async function generateBatch(verses) {
  const input = verses.map((v) => ({
    surah: v.surah,
    ayah: v.ayah,
    translation: v.translation,
    summary: v.tafseerSummary || (v.tafseer ? v.tafseer.slice(0, 400) : ""),
    categories: v.categories,
  }));

  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Generate lessonTitle and application for these ${verses.length} Quranic verses:\n\n${JSON.stringify(input, null, 2)}`,
        },
      ],
      max_tokens: 2048,
      stream: false,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Ollama error ${response.status}: ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content;
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error(`No JSON array in response: ${text.slice(0, 300)}`);
  return JSON.parse(match[0]);
}

async function main() {
  const verses = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

  const pending = verses.reduce((acc, v, i) => {
    if (!v.lessonTitle) acc.push(i);
    return acc;
  }, []);

  console.log(
    `${pending.length} verses need generation (${verses.length - pending.length} already done)`
  );

  if (pending.length === 0) {
    console.log("All done.");
    return;
  }

  const BATCH = 5;
  let processed = 0;

  for (let b = 0; b < pending.length; b += BATCH) {
    const batchIdx = pending.slice(b, b + BATCH);
    const batchVerses = batchIdx.map((i) => verses[i]);
    const batchNum = Math.floor(b / BATCH) + 1;
    const totalBatches = Math.ceil(pending.length / BATCH);

    process.stdout.write(`Batch ${batchNum}/${totalBatches} (${batchVerses.length} verses)... `);

    try {
      const results = await generateBatch(batchVerses);

      if (results.length !== batchVerses.length) {
        throw new Error(`Expected ${batchVerses.length} results, got ${results.length}`);
      }

      for (let i = 0; i < batchIdx.length; i++) {
        verses[batchIdx[i]].lessonTitle = results[i].lessonTitle;
        verses[batchIdx[i]].application = results[i].application;
      }

      processed += batchVerses.length;
      console.log(`done (${processed}/${pending.length})`);

      writeFileSync(DATA_PATH, JSON.stringify(verses, null, 2));
    } catch (err) {
      console.error(`FAILED: ${err.message}`);
    }
  }

  console.log(`\nComplete. ${processed}/${pending.length} verses updated.`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
