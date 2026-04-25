"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { RaceData } from "@/lib/types";
import { createBaseRaceData, applyVariation } from "@/lib/mockData";

export type LiveTrackStatus = "idle" | "connecting" | "online" | "offline";

const STORAGE_KEY = "garmin_livetrack_url";

export interface UseRaceDataResult {
  data: RaceData;
  liveTrackStatus: LiveTrackStatus;
  liveTrackUrl: string;
  setLiveTrackUrl: (url: string) => void;
}

export function useRaceData(intervalMs = 5000): UseRaceDataResult {
  const [data, setData] = useState<RaceData>(createBaseRaceData);
  const [liveTrackUrl, setLiveTrackUrlState] = useState("");
  const [liveTrackStatus, setLiveTrackStatus] = useState<LiveTrackStatus>("idle");

  // Load saved URL from localStorage once on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setLiveTrackUrlState(stored);
  }, []);

  const setLiveTrackUrl = useCallback((url: string) => {
    setLiveTrackUrlState(url);
    if (url) {
      localStorage.setItem(STORAGE_KEY, url);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Polling — switches between mock simulation and Garmin proxy based on URL
  const urlRef = useRef(liveTrackUrl);
  urlRef.current = liveTrackUrl;

  useEffect(() => {
    if (!liveTrackUrl) {
      setLiveTrackStatus("idle");
      const id = setInterval(() => setData((prev) => applyVariation(prev)), intervalMs);
      return () => clearInterval(id);
    }

    setLiveTrackStatus("connecting");

    const poll = async () => {
      try {
        const res = await fetch(`/api/garmin?url=${encodeURIComponent(urlRef.current)}`);
        const json = await res.json();

        if (json.ok) {
          setLiveTrackStatus("online");
          // Real data mapping goes here once we know Garmin's schema.
          // For now advance mock data but mark Garmin as connected.
          setData((prev) =>
            applyVariation({ ...prev, garminStatus: "connected", gpsStatus: "connected" })
          );
        } else {
          setLiveTrackStatus("offline");
          setData((prev) => ({ ...prev, garminStatus: "disconnected" }));
        }
      } catch {
        setLiveTrackStatus("offline");
        setData((prev) => ({ ...prev, garminStatus: "disconnected" }));
      }
    };

    poll();
    const id = setInterval(poll, intervalMs);
    return () => {
      clearInterval(id);
      setLiveTrackStatus("idle");
    };
  }, [liveTrackUrl, intervalMs]);

  return { data, liveTrackStatus, liveTrackUrl, setLiveTrackUrl };
}
