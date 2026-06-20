/**
 * Cleans up machine-generated Indonesian translations in verse-clusters.json.
 *
 * Three passes:
 *   1. Artifact cleanup — removes \\n\\n escape sequences left by the Ollama
 *      streaming script and normalises them to real paragraph breaks.
 *   2. Stray-note removal — the 8B model often appended "(Note: I translated…)",
 *      "Catatan:", "(N.B:…)" etc. Those are filtered out.
 *   3. Paragraph trimming — if the English source has N paragraphs, the
 *      translation keeps at most N+1, cutting any extra model-added commentary.
 *   4. Specific overrides — for translations that are outright wrong (idioms
 *      rendered literally, completely mis-translated sentences, wrong Islamic
 *      terms) the correct version is hardcoded below.
 *
 * Run: node scripts/fix-cluster-translations.mjs
 */

import { readFileSync, writeFileSync, renameSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLUSTERS_PATH = join(__dirname, "..", "data", "verse-clusters.json");

function saveAtomic(path, obj) {
  const tmp = path + ".tmp";
  writeFileSync(tmp, JSON.stringify(obj, null, 2), "utf-8");
  renameSync(tmp, path);
}

/**
 * General cleanup pass.
 * @param {string} text - Indonesian translation to clean
 * @param {string} reference - English original (used to limit paragraph count)
 */
function cleanTranslation(text, reference) {
  if (!text) return text;

  // 1. Normalise escaped \\n\\n sequences that the streaming script left in
  text = text.replace(/\\n\\n/g, "\n\n");

  // 2. Split into paragraphs, strip stray translator notes
  const NOTE_PATTERNS = [
    /^\(Note:/i,
    /^Note:/i,
    /^\(N\.B/i,
    /^N\.B:/i,
    /^Catatan:/i,
    /^\(Catatan:/i,
  ];
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .filter((p) => !NOTE_PATTERNS.some((re) => re.test(p)));

  // 3. Limit paragraph count to reference + 1 (cuts extra model commentary)
  if (reference) {
    const refCount = reference.split(/\n\n+/).filter((p) => p.trim()).length;
    const max = refCount + 1;
    if (paragraphs.length > max) paragraphs.splice(max);
  }

  return paragraphs.join("\n\n");
}

// ---------------------------------------------------------------------------
// Specific overrides (surah:firstAyah → { keyTakeawayId?, lessonId? })
// Applied AFTER the general cleanup pass.
// Only include entries with substantive errors beyond what cleanup catches.
// ---------------------------------------------------------------------------
const OVERRIDES = {
  // 78:1-3 — keyTakeawayId had a second unrelated sentence added
  "78:1": {
    keyTakeawayId:
      "Orang-orang berdebat tentang Hari Kiamat, namun pertanyaan mereka tidak mengubah kepastiannya.",
  },

  // 78:30 — "Neraka akan datang" should be "perhitungan pasti tiba" (reckoning, not hellfire)
  "78:30": {
    lessonId:
      "Keadilan yang tertunda bukanlah keadilan yang tidak jadi. Ketika orang-orang luput dari akibat perbuatannya di dunia ini, neraca hanya ditangguhkan. Perhitungan itu pasti akan tiba.",
  },

  // 79:17-19 — "menulis mereka off" is literal English slang
  "79:17": {
    lessonId:
      "Bahkan orang zalim yang paling kejam sekalipun diberi kesempatan. Jika Musa diutus kepada Firaun dengan petunjuk, bukan kutukan, maka hadapilah orang-orang yang sulit dengan hikmah sebelum memvonis mereka.",
  },

  // 79:21-25 — translator added "(Note: I translated 'Firaun'…)" inline
  "79:21": {
    lessonId:
      "Kejatuhan Firaun terjadi selangkah demi selangkah: penolakan, pembangkangan, kesombongan, dan pengakuan ketuhanan diri sendiri. Setiap langkah memudahkan langkah berikutnya. Jagalah langkah pertama.",
  },

  // 79:27-33 — "Berhenti menghakimi Pencipta kamu" is odd; "meremehkan" is better
  "79:27": {
    lessonId:
      "Penciptaan langit jauh lebih rumit daripada membangkitkanmu kembali. Jika Dia mampu melakukan semua itu, menghidupkanmu kembali adalah hal yang sangat mudah. Jangan meremehkan Penciptamu.",
  },

  // 80:7 — "And kamu tidak berdosa" — stray "And" from English
  "80:7": {
    keyTakeawayId:
      "Kamu tidak berdosa jika orang yang merasa cukup itu tidak bertambah (imannya).",
  },

  // 81:22 — "(Note: This is not a religious text…)" in keyTakeawayId
  "81:22": {
    keyTakeawayId: "Sahabatmu Muhammad bukanlah orang gila.",
    lessonId:
      "Menyebut seseorang yang berbicara kebenaran sebagai gila adalah penghindaran tertua dalam sejarah. Ketika orang-orang menyerang sang utusan untuk menghindar dari pesannya, tataplah langsung pada pesannya, bukan pada serangannya.",
  },

  // 81:23 — "(Note: I translated 'saw' as…)" in keyTakeawayId
  "81:23": {
    keyTakeawayId:
      "Nabi menyaksikan Jibril di ufuk yang terang — ini bukan imajinasi atau khayalan.",
    lessonId:
      "Pertemuan Nabi dengan Jibril bersifat nyata dan fisik. Wahyu bukan puisi atau halusinasi — ia disaksikan, nyata, dan dapat diverifikasi.",
  },

  // 83:34-36 — THE main idiom complaint:
  // "The tables turn completely" → "Tabel-tabel berbalik totalnya" (furniture/data tables)
  // Correct: "keadaan berbalik" (the situation reverses)
  "83:34": {
    lessonId:
      "Keadaan berbalik sepenuhnya. Mereka yang dulu diolok-olok kini dimuliakan; mereka yang dulu mengolok-olok kini menjadi tontonan. Kesabaran di dunia ini dibalas dengan kemuliaan di akhirat.",
  },

  // 85:4-8 — four extra religious paragraphs appended by the model
  "85:4": {
    lessonId:
      "Satu-satunya kejahatan para syuhada adalah iman mereka. Jika kamu menghadapi permusuhan karena keyakinanmu, ingatlah mereka yang menghadapi kobaran api dengan alasan yang sama namun tetap teguh.",
  },

  // 86:5-7 — "Asal-usulmuah" (typo/odd suffix)
  "86:5": {
    lessonId:
      "Asal-usulmu adalah hina — setetes cairan. Kesombongan orang yang berasal dari ketiadaan adalah kontradiksi yang paling aneh. Kembalilah ke asal-usulmu dan rendahkanlah hatimu.",
  },

  // 87:1 — keyTakeawayId is completely wrong (hallucinated a different verse)
  // English: "Exalt the name of your Lord, the Most High."
  // Current ID: "Maha Karunia Allah SWT yang telah mengajarkan kepada malaikat…"
  "87:1": {
    keyTakeawayId: "Sucikanlah nama Tuhanmu Yang Maha Tinggi.",
    lessonId:
      "Mulailah dengan nama-Nya. Sebelum setiap tugas, setiap hari, setiap perbuatan — tinggikan Allah di atas segalanya. Satu kebiasaan ini menata ulang seluruh hidupmu.",
  },

  // 88:25-26 — "(N.B: Note the use of…)" appended
  "88:25": {
    lessonId:
      "Keputusan akhir adalah milik Allah. Setiap perkara, setiap orang, setiap pilihan — semuanya kembali kepada-Nya untuk diselesaikan dengan keadilan yang sempurna.",
  },

  // 89:6-8 — extra paragraph with \\n\\n artifact
  "89:6": {
    lessonId:
      "Peradaban terbesar pada masanya dihancurkan. Keagungan yang diukur dengan bangunan, kekuatan militer, dan jumlah penduduk tidak memberikan perlindungan dari keadilan ilahi.",
  },

  // 90:4 — "(Note: I translated…)" appended
  "90:4": {
    lessonId:
      "Kesulitan bukan suatu kerusakan — itu memang rancangannya. Kamu diciptakan untuk hidup di tengah kesulitan. Berhentilah terkejut menghadapi perjuangan dan mulailah memanfaatkannya.",
  },

  // 90:7 — "(Note: This is not a religious text…)" in keyTakeawayId
  "90:7": {
    keyTakeawayId: "Apakah dia mengira tidak ada yang melihatnya?",
  },

  // 93:9-11 — "(Note: I translated 'Speaking of His favor'…)"
  "93:9": {
    lessonId:
      "Rasa syukur atas apa yang Allah berikan kepadamu tercermin dari cara kamu memperlakukan mereka yang kekurangan. Berbicara tentang karunia-Nya bukanlah memamerkan diri — itu adalah kesaksian.",
  },

  // 95:1-3 — "Dibenamkan" is an odd/wrong verb for a divine oath
  "95:1": {
    keyTakeawayId:
      "Demi buah tin, zaitun, Gunung Sinai, dan kota yang aman ini — sumpah suci yang merangkum geografi dan nubuat.",
  },

  // 97:1 — "Malam Nazar" should be "Lailatul Qadr"
  "97:1": {
    keyTakeawayId:
      "Al-Qur'an diturunkan pada Malam Lailatul Qadr — malam yang lebih baik dari seribu bulan.",
  },

  // 98:1-3 — extra paragraph appended
  "98:1": {
    lessonId:
      "Alasan menunggu bukti telah terjawab sepenuhnya. Bukti yang jelas datang dalam wujud Nabi dan Al-Quran. Setelah itu, penolakan bukan lagi soal bukti.",
  },

  // 98:6 — "hewan yang paling buruk" should be "makhluk yang paling buruk"
  // also "Rangking" is not standard Indonesian — use "Predikat"
  "98:6": {
    lessonId:
      "Menolak kebenaran setelah ia datang dalam bentuk yang paling jelas adalah tanggapan yang paling buruk. Predikat 'makhluk paling buruk' itu diperoleh dengan pilihan, bukan diberikan secara sewenang-wenang.",
  },

  // 99:6 — extra paragraph with \\n\\n artifact
  "99:6": {
    keyTakeawayId:
      "Pada hari itu, manusia akan berpencar ke berbagai kelompok untuk diperlihatkan perbuatan-perbuatan mereka.",
  },

  // 100:1-5 — irrelevant Quran verse appended at the end
  "100:1": {
    lessonId:
      "Sumpah atas kuda-kuda perang menggambarkan mereka yang berlari menuju tujuan dengan komitmen penuh. Apakah kamu sesungguh-sungguhnya seperti itu dalam ibadah dan kewajibanmu?",
  },

  // 100:8 — "mengajarku padamu" (wrong person/direction)
  // English: "discipline it before it disciplines you"
  "100:8": {
    lessonId:
      "Cinta harta bersifat ekstrem secara alami — tidak pernah terpuaskan. Kenali cinta ini dalam dirimu dan kendalikanlah sebelum ia menguasaimu.",
  },

  // 101:8-11 — "Seimbangnya cahaya bukanlah hasil netral"
  // English: "A light scale is not a neutral outcome"
  "101:8": {
    lessonId:
      "Timbangan yang ringan bukan hasil yang netral — ia mengarah ke suatu tempat yang pasti. Ringannya timbangan bukan sekadar ketiadaan kebaikan — ia adalah kehadiran sebuah tujuan.",
  },

  // 104:7-9 — keyTakeawayId is completely wrong (model described God sending scripture,
  // not fire ascending to hearts)
  // English: "It mounts directed at the hearts — sealed in extended columns."
  "104:7": {
    keyTakeawayId:
      "Api itu memanjat menyerbu hati — dan mereka dikunci dalam tiang-tiang yang memanjang.",
    lessonId:
      "Api itu mengincar hati — tempat bersemayamnya kesombongan dan keserakahan yang menjadi penyebab kejatuhan mereka. Hukuman mengincar sumber dari dosa itu sendiri.",
  },

  // 105:1-5 — "(Note: I kept the original text's structure…)" appended
  "105:1": {
    lessonId:
      "Pasukan bergajah datang untuk menghancurkan Ka'bah. Allah mengutus burung-burung kecil. Pasukan paling kuat pada zamannya dihancurkan oleh makhluk terkecil. Tidak ada kekuatan manusia yang sanggup menandingi perlindungan ilahi.",
  },

  // 109:1-6 — "(Note: I translated 'non-compromise' to…)" appended
  "109:1": {
    lessonId:
      "Inilah pernyataan paling tegas tentang keteguhan prinsip yang pernah ada. Tidak ada tawar-menawar dalam hal objek penyembahan. Hormati kebebasan orang untuk memilih jalannya, tetapi jangan kaburkan kejelasan jalanmu sendiri.",
  },

  // 112:1-4 — "tidak bapak" is not natural Indonesian
  // "tidak bergantung", "tidak beranak dan diperanakkan", "tidak setara"
  "112:1": {
    lessonId:
      "Allah didefinisikan oleh apa yang Dia bukan: bukan jamak, bukan bergantung pada sesuatu, bukan beranak dan diperanakkan, dan tidak ada yang setara dengan-Nya. Setiap gagasan keliru tentang Allah gugur di hadapan keempat pernyataan ini. Murnikan pemahamanmu tentang Allah.",
  },

  // 113:1-5 — "memuntahkan benih (pada kertas)" is wrong
  // English: "those who blow on knots" = sihir (blowing on tied knots for magic)
  // Also extra paragraph at end
  "113:1": {
    keyTakeawayId:
      "Berlindunglah kepada Tuhan penguasa fajar dari empat kejahatan: segala yang Dia ciptakan, gelapnya malam ketika menyelimuti, para peniup pada simpul-simpul (sihir), dan pendengki ketika ia mendengki.",
    lessonId:
      "Memohon perlindungan adalah pengakuan bahwa bahaya nyata itu ada dan hanya Allah yang mampu menangkalnya. Ungkapkanlah rasa takutmu kepada Allah setiap hari — pengungkapan itu sendiri adalah bentuk kepercayaan.",
  },
};

function main() {
  const clusters = JSON.parse(readFileSync(CLUSTERS_PATH, "utf-8"));
  let cleanedCount = 0;
  let overriddenCount = 0;

  for (const [surahNum, clusterList] of Object.entries(clusters)) {
    for (const cluster of clusterList) {
      const key = `${surahNum}:${cluster.ayahs[0]}`;

      // Pass 1 + 2 + 3: general cleanup
      if (cluster.keyTakeawayId) {
        const cleaned = cleanTranslation(cluster.keyTakeawayId, cluster.keyTakeaway);
        if (cleaned !== cluster.keyTakeawayId) {
          cluster.keyTakeawayId = cleaned;
          cleanedCount++;
        }
      }
      if (cluster.lessonId) {
        const cleaned = cleanTranslation(cluster.lessonId, cluster.lesson);
        if (cleaned !== cluster.lessonId) {
          cluster.lessonId = cleaned;
          cleanedCount++;
        }
      }

      // Pass 4: specific overrides
      const override = OVERRIDES[key];
      if (override) {
        if (override.keyTakeawayId !== undefined) {
          cluster.keyTakeawayId = override.keyTakeawayId;
        }
        if (override.lessonId !== undefined) {
          cluster.lessonId = override.lessonId;
        }
        overriddenCount++;
      }
    }
  }

  saveAtomic(CLUSTERS_PATH, clusters);
  console.log(
    `Done. General cleanup applied to ${cleanedCount} fields; ${overriddenCount} entries received specific overrides.`
  );
}

main();
