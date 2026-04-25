"use client";

import dynamic from "next/dynamic";
import { useRaceData } from "@/hooks/useRaceData";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { MetricGrid } from "@/components/dashboard/MetricGrid";
import { MapBox } from "@/components/dashboard/MapBox";
import { FuelPlan } from "@/components/dashboard/FuelPlan";
import { SplitTimes } from "@/components/dashboard/SplitTimes";
import { ExtraMetrics } from "@/components/dashboard/ExtraMetrics";
import { DataSources } from "@/components/dashboard/DataSources";
import { LiveTrackInput } from "@/components/dashboard/LiveTrackInput";

// recharts uses ResizeObserver/DOM measurements — skip SSR to avoid static-generation warnings
const PaceChart = dynamic(
  () => import("@/components/dashboard/PaceChart").then((m) => m.PaceChart),
  { ssr: false }
);

export default function DashboardPage() {
  const { data: raceData, liveTrackStatus, liveTrackUrl, setLiveTrackUrl } = useRaceData(5000);

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
          <div className="text-right text-xs text-[#8892b0]">
            <div>Praha Half Marathon 2025</div>
            <div className="text-[#4ade80] font-medium animate-pulse">● přímý přenos</div>
          </div>
        </div>

        {/* LiveTrack URL input */}
        <LiveTrackInput
          url={liveTrackUrl}
          status={liveTrackStatus}
          onSave={setLiveTrackUrl}
        />

        {/* Status Bar */}
        <StatusBar data={raceData} />

        {/* Metric Cards */}
        <MetricGrid data={raceData} />

        {/* Middle row: Map + Pace Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MapBox data={raceData} />
          <PaceChart data={raceData} />
        </div>

        {/* Fuel Plan */}
        <FuelPlan data={raceData} />

        {/* Bottom row: Splits + Extra Metrics + Data Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SplitTimes data={raceData} />
          <ExtraMetrics data={raceData} />
          <DataSources data={raceData} />
        </div>
      </div>
    </main>
  );
}
