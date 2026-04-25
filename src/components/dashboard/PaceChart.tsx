"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { RaceData } from "@/lib/types";
import { formatPace } from "@/lib/raceLogic";

interface Props {
  data: RaceData;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f3460] border border-[#1a4a8a] rounded-lg px-3 py-2 text-xs">
      <div className="text-[#8892b0] mb-1">km {label}</div>
      <div className="text-white font-bold">{formatPace(payload[0].value)}</div>
      {payload[1] && (
        <div className="text-[#8892b0]">plán {formatPace(payload[1].value)}</div>
      )}
    </div>
  );
};

export function PaceChart({ data }: Props) {
  const chartData = data.splits.map((s) => ({
    km: s.km,
    pace: s.pace,
    planned: s.plannedPace,
    fast: s.pace < s.plannedPace,
  }));

  // Y axis: invert so faster pace (smaller number) is higher
  const allPaces = chartData.flatMap((d) => [d.pace, d.planned]);
  const minPace = Math.min(...allPaces) - 10;
  const maxPace = Math.max(...allPaces) + 10;

  const formatYTick = (val: number) => formatPace(val);

  return (
    <div className="bg-[#16213e] border border-[#0f3460] rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">Tempo po km</h3>
        <div className="flex items-center gap-3 text-xs text-[#8892b0]">
          <span className="flex items-center gap-1">
            <span className="w-3 h-2 rounded-sm bg-[#e94560] inline-block" />
            skutečné
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-[#4ade80] inline-block" />
            plán
          </span>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#0f3460" vertical={false} />
            <XAxis
              dataKey="km"
              tick={{ fill: "#8892b0", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              label={{ value: "km", position: "insideBottomRight", offset: 0, fill: "#8892b0", fontSize: 11 }}
            />
            <YAxis
              domain={[minPace, maxPace]}
              tickFormatter={formatYTick}
              tick={{ fill: "#8892b0", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={36}
              reversed
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#0f346040" }} />
            <ReferenceLine
              y={data.plannedPace}
              stroke="#4ade80"
              strokeDasharray="4 2"
              strokeWidth={1.5}
            />
            <Bar dataKey="pace" radius={[3, 3, 0, 0]} maxBarSize={24}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.fast ? "#60a5fa" : "#e94560"}
                  opacity={0.9}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
