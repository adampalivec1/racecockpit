"use client";

import { RaceData } from "@/lib/types";
import { formatTime, progressPercent, coachRecommendation } from "@/lib/raceLogic";
import { Activity, Wifi } from "lucide-react";

interface Props {
  data: RaceData;
}

export function StatusBar({ data }: Props) {
  const progress = progressPercent(data);
  const elapsed = formatTime(data.elapsedTime);
  const recommendation = coachRecommendation(data);

  return (
    <div className="bg-[#16213e] border border-[#0f3460] rounded-xl p-4 space-y-3">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#e94560]" />
            <span className="text-white font-bold text-lg">PŮLMARATON</span>
          </div>
          <span className="bg-[#e94560] text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
            LIVE
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <div className="text-[#8892b0] text-xs">km</div>
            <div className="text-white font-bold">
              {data.currentKm.toFixed(1)} / {data.totalKm.toFixed(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[#8892b0] text-xs">čas</div>
            <div className="text-white font-bold">{elapsed}</div>
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi
              className={`w-4 h-4 ${data.garminStatus === "connected" ? "text-[#4ade80]" : "text-[#f87171]"}`}
            />
            <span
              className={`text-xs font-medium ${data.garminStatus === "connected" ? "text-[#4ade80]" : "text-[#f87171]"}`}
            >
              Garmin
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="relative h-3 bg-[#0f3460] rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #e94560, #f97316)",
            }}
          />
          {/* km markers */}
          {[5, 10, 15, 21].map((km) => (
            <div
              key={km}
              className="absolute top-0 h-full w-px bg-[#1a1a2e] opacity-60"
              style={{ left: `${(km / data.totalKm) * 100}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-[#8892b0]">
          <span>0</span>
          <span>5</span>
          <span>10</span>
          <span>15</span>
          <span>21.1</span>
        </div>
      </div>

      {/* Coach recommendation */}
      <div className="flex items-center gap-2 bg-[#0f3460] rounded-lg px-3 py-2">
        <span className="text-[#e94560] text-xs font-bold uppercase tracking-wider">
          Trenér
        </span>
        <span className="text-white text-sm">{recommendation}</span>
      </div>
    </div>
  );
}
