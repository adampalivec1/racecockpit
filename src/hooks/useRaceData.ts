"use client";

import { useState, useEffect, useCallback } from "react";
import { RaceData } from "@/lib/types";
import { createBaseRaceData, applyVariation } from "@/lib/mockData";

const STORAGE_KEY = "garmin_livetrack_url";

export type ConnectionStatus = "mock" | "connecting" | "live" | "error";

interface UseRaceDataReturn {
  data: RaceData;
  liveTrackUrl: string;
  setLiveTrackUrl: (url: string) => void;
  connectionStatus: ConnectionStatus;
}

// Parse the session ID out of a LiveTrack viewer URL, then build the
// undocumented services endpoint that the LiveTrack SPA itself uses.
//
// Input:  https://livetrack.garmin.com/session/{id}/token/{token}
// Output: https://livetrack.garmin.com/services/session/{id}/trackpoints
function buildTrackpointsUrl(viewerUrl: string): string | null {
  const match = viewerUrl.match(
    /livetrack\.garmin\.com\/session\/([^/?#]+)/
  );
  if (!match) return null;
  return `https://livetrack.garmin.com/services/session/${match[1]}/trackpoints`;
}

export function useRaceData(intervalMs = 5000): UseRaceDataReturn {
  const [data, setData] = useState<RaceData>(createBaseRaceData);
  const [liveTrackUrl, setLiveTrackUrlState] = useState<string>("");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("mock");

  // Load saved URL from localStorage once on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setLiveTrackUrlState(saved);
  }, []);

  const setLiveTrackUrl = useCallback((url: string) => {
    setLiveTrackUrlState(url);
    if (url) {
      localStorage.setItem(STORAGE_KEY, url);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!liveTrackUrl) {
      setConnectionStatus("mock");
      const id = setInterval(
        () => setData((prev) => applyVariation(prev)),
        intervalMs
      );
      return () => clearInterval(id);
    }

    const trackpointsUrl = buildTrackpointsUrl(liveTrackUrl);
    if (!trackpointsUrl) {
      console.error("[useRaceData] Could not parse session ID from URL:", liveTrackUrl);
      setConnectionStatus("error");
      return;
    }

    setConnectionStatus("connecting");

    const poll = async () => {
      try {
        // Fetch directly from the browser (real user IP, bypasses Garmin's
        // datacenter-IP block). We pass no-cors as a fallback signal if needed,
        // but try a normal fetch first so we can read the body.
        const res = await fetch(trackpointsUrl, {
          headers: {
            Accept: "application/json, text/plain, */*",
            Referer: liveTrackUrl,
          },
          cache: "no-store",
        });

        const text = await res.text();
        console.log("[Garmin] HTTP", res.status, res.headers.get("content-type"));
        console.log("[Garmin] Raw body:", text.slice(0, 2000));

        let parsed: unknown = null;
        try { parsed = JSON.parse(text); } catch { /* not JSON */ }

        if (!res.ok || parsed === null) {
          setConnectionStatus("error");
          setData((prev) => applyVariation(prev));
          return;
        }

        console.log("[Garmin] Parsed:", parsed);
        setConnectionStatus("live");

        // TODO: map parsed → RaceData once we understand the schema.
        // Keep mock simulation running for display until then.
        setData((prev) => applyVariation(prev));
      } catch (err) {
        // CORS block or network error
        console.error("[Garmin] Fetch error:", err);
        setConnectionStatus("error");
        setData((prev) => applyVariation(prev));
      }
    };

    poll();
    const id = setInterval(poll, intervalMs);
    return () => clearInterval(id);
  }, [liveTrackUrl, intervalMs]);

  return { data, liveTrackUrl, setLiveTrackUrl, connectionStatus };
}
