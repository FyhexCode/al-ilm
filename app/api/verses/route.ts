import type { NextRequest } from "next/server";
import { getVerseSummaries } from "@/lib/search";

const MAX_IDS = 200;

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const ids = (params.get("ids") ?? "")
    .split(",")
    .filter((id) => /^\d{1,3}:\d{1,3}$/.test(id))
    .slice(0, MAX_IDS);
  const locale = params.get("locale") === "id" ? "id" : "en";
  return Response.json({ results: getVerseSummaries(ids, locale) });
}
