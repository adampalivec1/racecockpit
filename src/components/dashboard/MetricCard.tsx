"use client";

import { MetricCardData } from "@/lib/types";
import { statusColor } from "@/lib/raceLogic";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  metric: MetricCardData;
}

export function MetricCard({ metric }: Props) {
  const color = statusColor(metric.status);

  return (
    <div
      className="bg-[#16213e] border rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden"
      style={{ borderColor: `${color}40` }}
    >
      {/* Glow accent */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none"
        style={{ background: color }}
      />

      <div className="flex items-start justify-between">
        <span className="text-[#8892b0] text-xs font-medium uppercase tracking-wider">
          {metric.label}
        </span>
        {metric.trend && (
          <span className="text-[#8892b0]">
            {metric.trend === "up" ? (
              <TrendingUp className="w-3.5 h-3.5 text-[#4ade80]" />
            ) : metric.trend === "down" ? (
              <TrendingDown className="w-3.5 h-3.5 text-[#f87171]" />
            ) : (
              <Minus className="w-3.5 h-3.5 text-[#8892b0]" />
            )}
          </span>
        )}
      </div>

      <div className="flex items-end gap-1.5">
        <span className="text-white font-bold text-3xl leading-none tabular-nums">
          {metric.value}
        </span>
        {metric.unit && (
          <span className="text-[#8892b0] text-sm mb-0.5">{metric.unit}</span>
        )}
      </div>

      {metric.subValue && (
        <div className="text-[#8892b0] text-xs">{metric.subValue}</div>
      )}

      {/* Action badge */}
      <div
        className={cn(
          "mt-auto self-start text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
        )}
        style={{ backgroundColor: `${color}20`, color }}
      >
        {metric.actionLabel}
      </div>
    </div>
  );
}
