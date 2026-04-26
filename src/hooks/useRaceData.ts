"use client";

import { useState, useEffect, useCallback } from "react";
import { RaceData } from "@/lib/types";
import { createBaseRaceData, applyVariation } from "@/lib/mockData";

const STORAGE_KEY = "garmin_livetrack_url";

// What the hook reports about the data source
export type ConnectionStatus = "mock" | "connecting" | "live" | "error";

interface UseRaceDataReturn {
  data: RaceData;
  liveTrackUrl: string;
  setLiveTrackUrl: (url: string) => void;
  connectionStatus: ConnectionStatus;
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

  // Persist URL changes to localStorage
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
      // No URL set — run the mock simulation
      setConnectionStatus("mock");
      const id = setInterval(
        () => setData((prev) => applyVariation(prev)),
        intervalMs
      );
      return () => clearInterval(id);
    }

    // LiveTrack URL present — poll the server-side proxy every intervalMs
    setConnectionStatus("connecting");

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/garmin?url=${encodeURIComponent(liveTrackUrl)}`
        );
        const json = await res.json();

        // Always log the raw response so we can see Garmin's data structure
        console.log("[useRaceData] Garmin raw response:", json);

        if (json.error || !json.parsed) {
          // Garmin unreachable or returned non-JSON — keep mock running
          setConnectionStatus("error");
          setData((prev) => applyVariation(prev));
          return;
        }

        setConnectionStatus("live");

        // TODO: map json.parsed → RaceData once we know Garmin's schema.
        // Until then, keep mock simulation running so the UI stays active.
        setData((prev) => applyVariation(prev));
      } catch (err) {
        console.error("[useRaceData] Poll error:", err);
        setConnectionStatus("error");
        setData((prev) => applyVariation(prev));
      }
    };

    poll(); // fire immediately, then on each interval
    const id = setInterval(poll, intervalMs);
    return () => clearInterval(id);
  }, [liveTrackUrl, intervalMs]);

  return { data, liveTrackUrl, setLiveTrackUrl, connectionStatus };
}
