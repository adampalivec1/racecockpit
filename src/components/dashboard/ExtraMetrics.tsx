"use client";

import { RaceData } from "@/lib/types";

interface Props {
  data: RaceData;
}

interface GaugeProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  optimal: [number, number];
  color: string;
}

function MetricBar({ label, value, unit, min, max, optimal, color }: GaugeProps) {
  const percent = ((value - min) / (max - min)) * 100;
  const optStart = ((optimal[0] - min) / (max - min)) * 100;
  const optWidth = ((optimal[1] - optimal[0]) / (max - min)) * 100;
  const inOptimal = value >= optimal[0] && value <= optimal[1];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[#8892b0] text-xs uppercase tracking-wide">{label}</span>
        <span
          className="text-sm font-bold tabular-nums"
          style={{ color: inOptimal ? "#4ade80" : color }}
        >
          {value}
          <span className="text-[#8892b0] font-normal text-xs ml-0.5">{unit}</span>
        </span>
      </div>
      <div className="relative h-2 bg-[#0f3460] rounded-full overflow-hidden">
        {/* Optimal zone */}
        <div
          className="absolute top-0 h-full rounded-full opacity-30"
          style={{
            left: `${optStart}%`,
            width: `${optWidth}%`,
            backgroundColor: "#4ade80",
          }}
        />
        {/* Current value */}
        <div
          className="absolute top-0 h-full w-1 rounded-full -translate-x-0.5"
          style={{
            left: `${Math.max(0, Math.min(100, percent))}%`,
            backgroundColor: inOptimal ? "#4ade80" : color,
            boxShadow: `0 0 6px ${inOptimal ? "#4ade80" : color}`,
          }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-[#4a5568]">
        <span>{min}</span>
        <span className="text-[#4ade80] text-[9px]">
          {optimal[0]}–{optimal[1]}
        </span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export function ExtraMetrics({ data }: Props) {
  return (
    <div className="bg-[#16213e] border border-[#0f3460] rounded-xl p-4 space-y-4">
      <h3 className="text-white font-semibold text-sm">Biomechanika</h3>

      <MetricBar
        label="Kadence"
        value={data.cadence}
        unit="spm"
        min={155}
        max={200}
        optimal={[178, 182]}
        color="#f97316"
      />

      <MetricBar
        label="Vertikální oscilace"
        value={data.verticalOscillation}
        unit="cm"
        min={5}
        max={14}
        optimal={[6, 9]}
        color="#a78bfa"
      />

      <MetricBar
        label="Kontakt se zemí"
        value={data.groundContactTime}
        unit="ms"
        min={180}
        max={310}
        optimal={[200, 250]}
        color="#f87171"
      />
    </div>
  );
}
