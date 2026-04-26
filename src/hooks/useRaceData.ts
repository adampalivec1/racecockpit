"use client";

import { useState, useEffect, useCallback } from "react";
import { RaceData, Split } from "@/lib/types";
import { createBaseRaceData, applyVariation, PLANNED_PACE, PLANNED_FINISH } from "@/lib/mockData";

const STORAGE_KEY = "garmin_livetrack_url";

export type ConnectionStatus = "mock" | "connecting" | "live" | "error";

interface UseRaceDataReturn {
  data: RaceData;
  liveTrackUrl: string;
  setLiveTrackUrl: (url: string) => void;
  connectionStatus: ConnectionStatus;
}

// Shape of a single point from Garmin's trackpoints API
interface GarminTrackPoint {
  dateTime: string;
  reportedTime?: string;
  position?: { lat: number; lon: number };
  altitude?: number;
  totalDurationSecs?: number;
  speedMetersPerSec?: number;
  totalDistanceMeters?: number;
  heartRateBeatsPerMin?: number;
  pointStatus?: string;
  cadenceCyclesPerMin?: number;
  powerWatts?: number;
}

interface GarminResponse {
  trackPoints: GarminTrackPoint[];
}

function isGarminResponse(v: unknown): v is GarminResponse {
  return (
    typeof v === "object" &&
    v !== null &&
    "trackPoints" in v &&
    Array.isArray((v as GarminResponse).trackPoints) &&
    (v as GarminResponse).trackPoints.length > 0
  );
}

// Map the latest Garmin trackpoint onto the previous RaceData, preserving
// fields that LiveTrack doesn't expose (verticalOscillation, groundContactTime).
function parseGarminData(parsed: unknown, prev: RaceData): RaceData {
  if (!isGarminResponse(parsed)) return prev;

  const points = parsed.trackPoints;
  const pt = points[points.length - 1]; // latest point

  const currentKm = (pt.totalDistanceMeters ?? 0) / 1000;
  const elapsedTime = pt.totalDurationSecs ?? prev.elapsedTime;
  const speedMps = pt.speedMetersPerSec ?? 0;

  // Keep previous pace when stationary (speed = 0) to avoid division by zero
  const pace = speedMps > 0.5 ? Math.round(1000 / speedMps) : prev.pace;

  const heartRate = pt.heartRateBeatsPerMin ?? prev.heartRate;

  // Garmin reports running cadence in cycles/min (strides). 1 stride = 2 steps.
  const rawCadence = pt.cadenceCyclesPerMin ?? 0;
  const cadence = rawCadence > 0 ? rawCadence * 2 : prev.cadence;

  const hrZone = (
    heartRate < 115 ? 1 :
    heartRate < 140 ? 2 :
    heartRate < 155 ? 3 :
    heartRate < 170 ? 4 : 5
  ) as 1 | 2 | 3 | 4 | 5;

  const remainingKm = Math.max(0, prev.totalKm - currentKm);
  const finishPrediction = Math.round(elapsedTime + remainingKm * pace);

  // Add a split entry each time we cross a full km mark
  const newFullKm = Math.floor(currentKm);
  const prevFullKm = Math.floor(prev.currentKm);
  let splits: Split[] = prev.splits;
  if (newFullKm > prevFullKm) {
    splits = [
      ...prev.splits,
      { km: newFullKm, pace, plannedPace: PLANNED_PACE, hr: heartRate },
    ];
  }

  return {
    ...prev,
    currentKm,
    pace,
    heartRate,
    hrZone,
    cadence,
    elapsedTime,
    finishPrediction,
    plannedFinish: PLANNED_FINISH,
    latitude: pt.position?.lat ?? prev.latitude,
    longitude: pt.position?.lon ?? prev.longitude,
    splits,
    garminStatus: "connected",
    gpsStatus: pt.position ? "connected" : "searching",
    lastUpdate: new Date(pt.reportedTime ?? pt.dateTime),
  };
}

function buildTrackpointsUrl(viewerUrl: string): string | null {
  const match = viewerUrl.match(/livetrack\.garmin\.com\/session\/([^/?#]+)/);
  if (!match) return null;
  return `https://livetrack.garmin.com/services/session/${match[1]}/trackpoints`;
}

export function useRaceData(intervalMs = 5000): UseRaceDataReturn {
  const [data, setData] = useState<RaceData>(createBaseRaceData);
  const [liveTrackUrl, setLiveTrackUrlState] = useState<string>("");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("mock");

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
      console.error("[Garmin] Could not parse session ID from URL:", liveTrackUrl);
      setConnectionStatus("error");
      return;
    }

    setConnectionStatus("connecting");

    const poll = async () => {
      try {
        const res = await fetch(trackpointsUrl, {
          headers: {
            Accept: "application/json, text/plain, */*",
            Referer: liveTrackUrl,
          },
          cache: "no-store",
        });

        const text = await res.text();

        let parsed: unknown = null;
        try { parsed = JSON.parse(text); } catch { /* not JSON */ }

        if (!res.ok || !isGarminResponse(parsed)) {
          console.warn("[Garmin] Bad response:", res.status, text.slice(0, 200));
          setConnectionStatus("error");
          setData((prev) => applyVariation(prev)); // keep UI moving
          return;
        }

        console.log("[Garmin] Live data:", parsed.trackPoints[parsed.trackPoints.length - 1]);
        setConnectionStatus("live");
        setData((prev) => parseGarminData(parsed, prev));
      } catch (err) {
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
