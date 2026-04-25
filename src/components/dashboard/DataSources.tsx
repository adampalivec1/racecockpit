"use client";

import { RaceData } from "@/lib/types";
import { Watch, Satellite, Wifi, Activity } from "lucide-react";

interface Props {
  data: RaceData;
}

interface SourceRowProps {
  icon: React.ReactNode;
  name: string;
  status: "connected" | "disconnected" | "searching";
  detail: string;
}

function SourceRow({ icon, name, status, detail }: SourceRowProps) {
  const statusConfig = {
    connected: { color: "#4ade80", label: "Připojeno", pulse: true },
    disconnected: { color: "#f87171", label: "Odpojeno", pulse: false },
    searching: { color: "#facc15", label: "Hledá...", pulse: true },
  }[status];

  return (
    <div className="flex items-center justify-between py-2 border-b border-[#0f3460] last:border-0">
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${statusConfig.color}15`, color: statusConfig.color }}
        >
          {icon}
        </div>
        <div>
          <div className="text-white text-xs font-medium">{name}</div>
          <div className="text-[#8892b0] text-[10px]">{detail}</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className={`w-2 h-2 rounded-full ${statusConfig.pulse ? "animate-pulse" : ""}`}
          style={{ backgroundColor: statusConfig.color }}
        />
        <span className="text-[10px] font-medium" style={{ color: statusConfig.color }}>
          {statusConfig.label}
        </span>
      </div>
    </div>
  );
}

export function DataSources({ data }: Props) {
  return (
    <div className="bg-[#16213e] border border-[#0f3460] rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">Zdroje dat</h3>
        {/* suppressHydrationWarning: time differs between SSR and client first render */}
        <span className="text-[10px] text-[#8892b0]" suppressHydrationWarning>
          {data.lastUpdate.toLocaleTimeString("cs-CZ")}
        </span>
      </div>

      <div className="divide-y divide-[#0f3460]">
        <SourceRow
          icon={<Watch className="w-3.5 h-3.5" />}
          name="Garmin Forerunner"
          status={data.garminStatus}
          detail="HR, kadence, oscilace"
        />
        <SourceRow
          icon={<Satellite className="w-3.5 h-3.5" />}
          name="GPS Satelity"
          status={data.gpsStatus}
          detail={`${data.latitude.toFixed(4)}N ${data.longitude.toFixed(4)}E`}
        />
        <SourceRow
          icon={<Activity className="w-3.5 h-3.5" />}
          name="Live Tracking"
          status="connected"
          detail="WebSocket · 5s interval"
        />
        <SourceRow
          icon={<Wifi className="w-3.5 h-3.5" />}
          name="ANT+ Bridge"
          status="connected"
          detail="Hrudní pás · BLE"
        />
      </div>
    </div>
  );
}
