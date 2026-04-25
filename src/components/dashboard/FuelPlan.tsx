"use client";

import { RaceData } from "@/lib/types";
import { FUEL_PLAN } from "@/lib/mockData";
import { Droplets, Zap, FlaskConical, CheckCircle2, Circle } from "lucide-react";

interface Props {
  data: RaceData;
}

const typeIcon = {
  gel: <Zap className="w-3.5 h-3.5" />,
  water: <Droplets className="w-3.5 h-3.5" />,
  electrolyte: <FlaskConical className="w-3.5 h-3.5" />,
};

const typeColor = {
  gel: "#f97316",
  water: "#60a5fa",
  electrolyte: "#a78bfa",
};

export function FuelPlan({ data }: Props) {
  const events = FUEL_PLAN.map((e) => ({
    ...e,
    taken: e.km <= data.currentKm,
    upcoming: e.km > data.currentKm && e.km <= data.currentKm + 3,
  }));

  const nextGel = events.find((e) => !e.taken && e.type === "gel");

  return (
    <div className="bg-[#16213e] border border-[#0f3460] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">Výživa & voda</h3>
        {nextGel && (
          <span className="text-xs text-[#f97316] bg-[#f9731620] px-2 py-0.5 rounded-full font-medium">
            Gel za {(nextGel.km - data.currentKm).toFixed(1)} km
          </span>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Track */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#0f3460]" />
        {/* Progress */}
        <div
          className="absolute top-4 left-4 h-0.5 bg-gradient-to-r from-[#e94560] to-[#f97316] transition-all duration-1000"
          style={{
            width: `${Math.min(100, (data.currentKm / 21.1) * 100)}%`,
            maxWidth: "calc(100% - 2rem)",
          }}
        />

        <div className="flex justify-between relative z-10 pt-0">
          {events.map((event, i) => {
            const color = typeColor[event.type];
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all"
                  style={{
                    borderColor: event.taken ? color : event.upcoming ? color : "#0f3460",
                    backgroundColor: event.taken ? `${color}20` : "#0d1b2a",
                    color: event.taken ? color : event.upcoming ? color : "#8892b0",
                    boxShadow: event.upcoming ? `0 0 8px ${color}80` : "none",
                  }}
                >
                  {typeIcon[event.type]}
                </div>
                <span
                  className="text-[9px] font-medium"
                  style={{ color: event.taken ? color : "#8892b0" }}
                >
                  {event.km}km
                </span>
                <span className="text-[8px] text-[#8892b0]">{event.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-3 text-xs text-[#8892b0] pt-1 border-t border-[#0f3460]">
        <span>
          <span className="text-[#4ade80] font-bold">
            {events.filter((e) => e.taken).length}
          </span>{" "}
          přijato
        </span>
        <span>
          <span className="text-[#facc15] font-bold">
            {events.filter((e) => !e.taken).length}
          </span>{" "}
          zbývá
        </span>
        <span>
          <span className="text-[#f97316] font-bold">
            {events.filter((e) => e.taken && e.type === "gel").length}
          </span>{" "}
          gely
        </span>
      </div>
    </div>
  );
}
