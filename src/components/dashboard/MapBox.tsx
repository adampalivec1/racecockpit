"use client";

import { RaceData } from "@/lib/types";
import { MapPin, Navigation } from "lucide-react";

interface Props {
  data: RaceData;
}

// SVG placeholder route — a rough half marathon shape
const ROUTE_PATH =
  "M 20 160 C 40 150, 80 140, 120 130 C 160 120, 200 100, 240 90 C 280 80, 320 75, 350 80 C 380 85, 400 100, 410 120 C 420 140, 415 165, 400 180 C 380 200, 340 210, 300 205 C 260 200, 220 185, 190 175 C 150 162, 110 158, 80 162 C 60 165, 35 170, 20 160";

export function MapBox({ data }: Props) {
  const progress = data.currentKm / data.totalKm;

  return (
    <div className="bg-[#16213e] border border-[#0f3460] rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">GPS Mapa</h3>
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${
              data.gpsStatus === "connected"
                ? "bg-[#4ade80] animate-pulse"
                : "bg-[#f87171]"
            }`}
          />
          <span className="text-[#8892b0] text-xs">
            {data.gpsStatus === "connected" ? "GPS OK" : "GPS hledá"}
          </span>
        </div>
      </div>

      <div className="relative h-52 bg-[#0d1b2a] rounded-lg overflow-hidden">
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#0f3460" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Full route (faded) */}
          <path
            d={ROUTE_PATH}
            fill="none"
            stroke="#1a4a8a"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Completed route */}
          <path
            d={ROUTE_PATH}
            fill="none"
            stroke="#e94560"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="460"
            strokeDashoffset={460 * (1 - progress)}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />

          {/* Start marker */}
          <circle cx="20" cy="160" r="5" fill="#4ade80" />
          <text x="25" y="155" fill="#4ade80" fontSize="10">
            Start
          </text>

          {/* Finish marker */}
          <circle cx="20" cy="160" r="4" fill="none" stroke="#facc15" strokeWidth="1.5" />
          <text x="25" y="175" fill="#facc15" fontSize="10">
            Cíl
          </text>

          {/* km marks */}
          {[5, 10, 15].map((km) => {
            const t = km / data.totalKm;
            // approximate position along path — simplified
            const x = 20 + t * 390;
            const y = 160 - Math.sin(t * Math.PI) * 90;
            return (
              <g key={km}>
                <circle cx={x} cy={y} r="3" fill="#0f3460" stroke="#8892b0" strokeWidth="1" />
                <text x={x + 5} y={y - 4} fill="#8892b0" fontSize="9">
                  {km}
                </text>
              </g>
            );
          })}

          {/* Current position dot */}
          <circle
            cx={20 + progress * 390}
            cy={160 - Math.sin(progress * Math.PI) * 90}
            r="7"
            fill="#e94560"
            style={{ transition: "all 1s ease" }}
          />
          <circle
            cx={20 + progress * 390}
            cy={160 - Math.sin(progress * Math.PI) * 90}
            r="12"
            fill="none"
            stroke="#e94560"
            strokeWidth="1.5"
            opacity="0.4"
            style={{ transition: "all 1s ease" }}
          />
        </svg>

        {/* Coords overlay */}
        <div className="absolute bottom-2 left-2 text-[10px] text-[#8892b0] font-mono">
          {data.latitude.toFixed(4)}N, {data.longitude.toFixed(4)}E
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1 text-[#e94560]">
          <Navigation className="w-3 h-3" />
          <span className="text-xs font-bold">{data.currentKm.toFixed(2)} km</span>
        </div>
      </div>
    </div>
  );
}
