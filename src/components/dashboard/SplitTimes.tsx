"use client";

import { RaceData } from "@/lib/types";
import { formatPace } from "@/lib/raceLogic";
import { cn } from "@/lib/utils";

interface Props {
  data: RaceData;
}

export function SplitTimes({ data }: Props) {
  const splits = [...data.splits].reverse().slice(0, 8);

  return (
    <div className="bg-[#16213e] border border-[#0f3460] rounded-xl p-4 space-y-3">
      <h3 className="text-white font-semibold text-sm">Splity</h3>

      <div className="space-y-1.5">
        {/* Header */}
        <div className="grid grid-cols-4 text-[10px] text-[#8892b0] uppercase tracking-wider px-1">
          <span>km</span>
          <span className="text-right">tempo</span>
          <span className="text-right">plán</span>
          <span className="text-right">tep</span>
        </div>

        {splits.map((split) => {
          const diff = split.pace - split.plannedPace;
          const isLatest = split.km === Math.max(...data.splits.map((s) => s.km));
          return (
            <div
              key={split.km}
              className={cn(
                "grid grid-cols-4 text-sm rounded-lg px-2 py-1.5 items-center",
                isLatest ? "bg-[#0f3460]" : "bg-transparent hover:bg-[#0f346050]"
              )}
            >
              <span className="text-[#8892b0] text-xs font-medium">
                {split.km.toString().padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "text-right font-bold tabular-nums text-sm",
                  diff < -5 ? "text-[#60a5fa]" : diff > 5 ? "text-[#f87171]" : "text-white"
                )}
              >
                {formatPace(split.pace)}
              </span>
              <span className="text-right text-[#8892b0] text-xs tabular-nums">
                {formatPace(split.plannedPace)}
              </span>
              <span className="text-right text-[#8892b0] text-xs tabular-nums">
                {split.hr}
              </span>
            </div>
          );
        })}
      </div>

      {data.splits.length === 0 && (
        <p className="text-[#8892b0] text-xs text-center py-4">
          Čekání na splity...
        </p>
      )}
    </div>
  );
}
