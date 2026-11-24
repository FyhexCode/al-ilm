import type { NextRequest } from "next/server";
import { searchVerses } from "@/lib/search";

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = (params.get("q") ?? "").slice(0, 100);
  const locale = params.get("locale") === "id" ? "id" : "en";
  return Response.json({ results: searchVerses(q, locale) });
}
