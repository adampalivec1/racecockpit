"use client";

import dynamic from "next/dynamic";
import { useState, type FormEvent } from "react";
import { useRaceData, ConnectionStatus } from "@/hooks/useRaceData";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { MetricGrid } from "@/components/dashboard/MetricGrid";
import { MapBox } from "@/components/dashboard/MapBox";
import { FuelPlan } from "@/components/dashboard/FuelPlan";
import { SplitTimes } from "@/components/dashboard/SplitTimes";
import { ExtraMetrics } from "@/components/dashboard/ExtraMetrics";
import { DataSources } from "@/components/dashboard/DataSources";

// recharts uses ResizeObserver/DOM measurements — skip SSR to avoid static-generation warnings
const PaceChart = dynamic(
  () => import("@/components/dashboard/PaceChart").then((m) => m.PaceChart),
  { ssr: false }
);

const CONNECTION_STATUS_DISPLAY: Record<
  ConnectionStatus,
  { color: string; label: string; pulse: boolean }
> = {
  mock: { color: "#8892b0", label: "Simulovaná data", pulse: false },
  connecting: { color: "#facc15", label: "Připojování…", pulse: true },
  live: { color: "#4ade80", label: "● přímý přenos", pulse: true },
  error: { color: "#f87171", label: "Chyba spojení", pulse: false },
};

export default function DashboardPage() {
  const { data, liveTrackUrl, setLiveTrackUrl, connectionStatus } =
    useRaceData(5000);

  const [showUrlInput, setShowUrlInput] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const statusDisplay = CONNECTION_STATUS_DISPLAY[connectionStatus];

  const handleOpenInput = () => {
    setInputValue(liveTrackUrl); // always show current saved value
    setShowUrlInput(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLiveTrackUrl(inputValue.trim());
    setShowUrlInput(false);
  };

  const handleDisconnect = () => {
    setLiveTrackUrl("");
    setInputValue("");
    setShowUrlInput(false);
  };

  return (
    <main className="min-h-screen bg-[#1a1a2e] p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight">
              Race Cockpit
            </h1>
            <p className="text-[#8892b0] text-xs">Trenérský přehled · live</p>
          </div>
          <div className="text-right text-xs text-[#8892b0] flex flex-col items-end gap-1">
            <div>Praha Half Marathon 2025</div>
            {/* Clicking the status badge opens the LiveTrack URL input */}
            <button
              onClick={showUrlInput ? () => setShowUrlInput(false) : handleOpenInput}
              className={`font-medium transition-opacity hover:opacity-80 ${
                statusDisplay.pulse ? "animate-pulse" : ""
              }`}
              style={{ color: statusDisplay.color }}
            >
              {statusDisplay.label}
            </button>
          </div>
        </div>

        {/* Garmin LiveTrack URL input panel */}
        {showUrlInput && (
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 bg-[#16213e] border border-[#0f3460] rounded-xl px-4 py-3"
          >
            <span className="text-[#8892b0] text-xs whitespace-nowrap shrink-0">
              Garmin LiveTrack URL:
            </span>
            <input
              type="url"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="https://livetrack.garmin.com/session/…"
              className="flex-1 bg-transparent text-white text-xs placeholder-[#4a5568] outline-none min-w-0"
              autoFocus
            />
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="submit"
                className="text-xs bg-[#0f3460] hover:bg-[#1a4a80] text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                Připojit
              </button>
              {liveTrackUrl && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-xs text-[#f87171] hover:text-red-400 px-2 py-1.5 rounded-lg transition-colors"
                >
                  Odpojit
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="text-xs text-[#8892b0] hover:text-white px-2 py-1.5 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          </form>
        )}

        {/* Status Bar */}
        <StatusBar data={data} />

        {/* Metric Cards */}
        <MetricGrid data={data} />

        {/* Middle row: Map + Pace Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MapBox data={data} />
          <PaceChart data={data} />
        </div>

        {/* Fuel Plan */}
        <FuelPlan data={data} />

        {/* Bottom row: Splits + Extra Metrics + Data Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SplitTimes data={data} />
          <ExtraMetrics data={data} />
          <DataSources data={data} />
        </div>
      </div>
    </main>
  );
}
