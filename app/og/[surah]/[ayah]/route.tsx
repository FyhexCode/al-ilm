import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getAllVerses } from "@/lib/getAllVerses";

const WIDTH = 1200;
const HEIGHT = 630;
const GOLD = "#c9a347";
const MAX_TRANSLATION_CHARS = 230;

interface Context {
  params: Promise<{ surah: string; ayah: string }>;
}

let fontPromise: Promise<Buffer> | null = null;
function loadFont(): Promise<Buffer> {
  // Amiri (SIL OFL): joins Arabic correctly and also covers the Latin text on the card.
  return (fontPromise ??= readFile(join(process.cwd(), "assets/fonts/Amiri-Regular.ttf")));
}

// Arabic size shrinks with length so long verses still fit the card.
function arabicFontSize(length: number): number {
  if (length <= 40) return 76;
  if (length <= 80) return 60;
  if (length <= 130) return 48;
  return 38;
}

function clip(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

/** Shareable verse card (PNG, 1200×630). `?lang=id` uses the Indonesian translation. */
export async function GET(request: NextRequest, { params }: Context) {
  const { surah, ayah } = await params;
  const verse = getAllVerses().find((v) => v.surah === Number(surah) && v.ayah === Number(ayah));
  if (!verse) return new Response("Verse not found", { status: 404 });

  const lang = request.nextUrl.searchParams.get("lang") === "id" ? "id" : "en";
  const translation = clip(
    lang === "id" && verse.translationId ? verse.translationId : verse.translation,
    MAX_TRANSLATION_CHARS
  );
  const reference = `${verse.surahName} ${verse.surah}:${verse.ayah}`;

  try {
    const svg = await satori(
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          background: "#0f2e1c",
          padding: 36,
          fontFamily: "Amiri",
        }}
      >
        <div
          style={{
            flex: 1,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            border: `2px solid ${GOLD}`,
            borderRadius: 24,
            padding: "36px 56px",
          }}
        >
          <div style={{ display: "flex", color: GOLD, fontSize: 28, letterSpacing: 6 }}>AL-ILM</div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                fontSize: arabicFontSize(verse.arabic.length),
                lineHeight: 1.7,
                color: "#fdf8ee",
                direction: "rtl",
                textAlign: "center",
              }}
            >
              {verse.arabic}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 28,
                fontSize: 32,
                lineHeight: 1.4,
                color: "rgba(253,248,238,0.82)",
                textAlign: "center",
                justifyContent: "center",
              }}
            >
              {`“${translation}”`}
            </div>
          </div>

          <div style={{ display: "flex", color: GOLD, fontSize: 30 }}>{reference}</div>
        </div>
      </div>,
      {
        width: WIDTH,
        height: HEIGHT,
        fonts: [{ name: "Amiri", data: await loadFont(), weight: 400, style: "normal" }],
      }
    );

    const png = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } }).render().asPng();
    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("OG render failed", error);
    return new Response("Could not render image", { status: 500 });
  }
}
