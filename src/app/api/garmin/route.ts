import { NextRequest, NextResponse } from "next/server";

// Only allow Garmin-owned domains to prevent SSRF
const ALLOWED_HOSTS = ["livetrack.garmin.com", "share.garmin.com"];

export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get("url");

  if (!urlParam) {
    return NextResponse.json({ error: "Missing ?url= parameter" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(urlParam);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    return NextResponse.json(
      { error: `URL host must be one of: ${ALLOWED_HOSTS.join(", ")}` },
      { status: 400 }
    );
  }

  let upstreamStatus: number;
  let contentType: string | null;
  let raw: string;

  try {
    const res = await fetch(urlParam, {
      cache: "no-store",
      headers: {
        Accept: "application/json, text/html, */*",
        "User-Agent": "Mozilla/5.0 RaceCockpit/1.0",
      },
    });
    upstreamStatus = res.status;
    contentType = res.headers.get("content-type");
    raw = await res.text();
  } catch (err) {
    console.error("[garmin-proxy] fetch error:", err);
    return NextResponse.json({ error: "Fetch failed", detail: String(err) }, { status: 502 });
  }

  console.log("[garmin-proxy] upstream status:", upstreamStatus);
  console.log("[garmin-proxy] content-type:", contentType);
  console.log("[garmin-proxy] raw response (first 3000 chars):\n", raw.slice(0, 3000));

  // Try JSON parse so the client gets a proper object; fall back to raw text
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    data = null;
  }

  return NextResponse.json({
    ok: upstreamStatus >= 200 && upstreamStatus < 300,
    upstreamStatus,
    contentType,
    // Always include raw so we can inspect whatever Garmin returns
    raw: raw.slice(0, 10_000),
    data,
  });
}
