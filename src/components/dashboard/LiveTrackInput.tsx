"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { Wifi, WifiOff, Loader, Link } from "lucide-react";
import { LiveTrackStatus } from "@/hooks/useRaceData";

interface Props {
  url: string;
  status: LiveTrackStatus;
  onSave: (url: string) => void;
}

const STATUS_CONFIG: Record<
  LiveTrackStatus,
  { label: string; color: string; icon: React.ReactNode; pulse: boolean }
> = {
  idle: {
    label: "Nepřipojeno",
    color: "text-[#8892b0]",
    icon: <WifiOff className="w-3.5 h-3.5" />,
    pulse: false,
  },
  connecting: {
    label: "Připojování...",
    color: "text-[#f97316]",
    icon: <Loader className="w-3.5 h-3.5 animate-spin" />,
    pulse: false,
  },
  online: {
    label: "Online",
    color: "text-[#4ade80]",
    icon: <Wifi className="w-3.5 h-3.5" />,
    pulse: true,
  },
  offline: {
    label: "Offline",
    color: "text-[#f87171]",
    icon: <WifiOff className="w-3.5 h-3.5" />,
    pulse: false,
  },
};

export function LiveTrackInput({ url, status, onSave }: Props) {
  const [draft, setDraft] = useState(url);
  const initialised = useRef(false);

  // Sync draft once when url loads from localStorage (changes from "" to stored value)
  useEffect(() => {
    if (!initialised.current && url) {
      setDraft(url);
      initialised.current = true;
    }
  }, [url]);

  const cfg = STATUS_CONFIG[status];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(draft.trim());
  };

  const handleClear = () => {
    setDraft("");
    onSave("");
  };

  return (
    <div className="bg-[#16213e] border border-[#0f3460] rounded-xl px-4 py-2.5">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <Link className="w-4 h-4 text-[#8892b0] shrink-0" />

        <span className="text-[#8892b0] text-xs font-medium whitespace-nowrap hidden sm:block">
          Garmin LiveTrack
        </span>

        <input
          type="url"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="https://livetrack.garmin.com/session/..."
          className="flex-1 bg-[#0f3460] text-white text-xs rounded-lg px-3 py-1.5 placeholder:text-[#8892b0] outline-none focus:ring-1 focus:ring-[#e94560] min-w-0"
        />

        {draft && draft !== url && (
          <button
            type="submit"
            className="bg-[#e94560] hover:bg-[#c73652] text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors"
          >
            Uložit
          </button>
        )}

        {url && draft === url && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[#8892b0] hover:text-[#f87171] text-xs px-2 py-1.5 transition-colors"
          >
            Smazat
          </button>
        )}

        {/* Status badge */}
        <div className={`flex items-center gap-1.5 ${cfg.color} shrink-0`}>
          {cfg.pulse ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]" />
            </span>
          ) : (
            cfg.icon
          )}
          <span className="text-xs font-medium hidden sm:block">{cfg.label}</span>
        </div>
      </form>
    </div>
  );
}
