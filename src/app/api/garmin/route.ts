import { NextRequest, NextResponse } from "next/server";

// Garmin LiveTrack URL format:
//   https://livetrack.garmin.com/session/{sessionId}/token/{userToken}
//
// Undocumented internal API that the LiveTrack page uses:
//   https://livetrack.garmin.com/services/session/{sessionId}/trackpoints
//
// This route acts as a server-side proxy so we avoid CORS issues and
// can inspect the raw response before we know exactly what Garmin sends.

const GARMIN_SERVICES = "https://livetrack.garmin.com/services/session";

export async function GET(request: NextRequest) {
  const liveTrackUrl = request.nextUrl.searchParams.get("url");

  if (!liveTrackUrl) {
    return NextResponse.json(
      { error: "Missing required query param: ?url=<Garmin LiveTrack URL>" },
      { status: 400 }
    );
  }

  // Pull the session ID out of the LiveTrack URL.
  // Handles both:
  //   .../session/abc123/token/xyz  (standard)
  //   .../session/abc123            (shortened / share link)
  const match = liveTrackUrl.match(
    /livetrack\.garmin\.com\/session\/([^/?#]+)/
  );

  if (!match) {
    return NextResponse.json(
      {
        error: "Could not parse Garmin session ID from URL",
        hint: "Expected: https://livetrack.garmin.com/session/{sessionId}/token/{token}",
        received: liveTrackUrl,
      },
      { status: 400 }
    );
  }

  const sessionId = match[1];
  const trackpointsUrl = `${GARMIN_SERVICES}/${sessionId}/trackpoints`;

  console.log("[Garmin API] Fetching:", trackpointsUrl);

  try {
    const garminRes = await fetch(trackpointsUrl, {
      headers: {
        Accept: "application/json, text/plain, */*",
        // Garmin may check Referer to validate the session
        Referer: liveTrackUrl,
        "User-Agent":
          "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      },
      // Always fetch live data — no Next.js caching
      cache: "no-store",
    });

    const rawText = await garminRes.text();

    let parsed: unknown = null;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Garmin returned HTML (error page) or something non-JSON
    }

    console.log("[Garmin API] HTTP status:", garminRes.status);
    console.log(
      "[Garmin API] Content-Type:",
      garminRes.headers.get("content-type")
    );
    console.log("[Garmin API] Body preview:", rawText.slice(0, 500));

    return NextResponse.json({
      sessionId,
      trackpointsUrl,
      httpStatus: garminRes.status,
      contentType: garminRes.headers.get("content-type"),
      // Full raw body so we can inspect the exact structure
      raw: rawText.slice(0, 8000),
      parsed,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Garmin API] Fetch failed:", message);
    return NextResponse.json(
      { error: `Failed to reach Garmin: ${message}` },
      { status: 502 }
    );
  }
}
