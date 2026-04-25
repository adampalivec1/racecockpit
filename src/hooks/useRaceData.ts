"use client";

import { useState, useEffect } from "react";
import { RaceData } from "@/lib/types";
import { createBaseRaceData, applyVariation } from "@/lib/mockData";

export function useRaceData(intervalMs = 5000) {
  const [data, setData] = useState<RaceData>(createBaseRaceData);

  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => applyVariation(prev));
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return data;
}
