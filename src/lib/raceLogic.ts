import { RaceData, MetricCardData, MetricStatus } from "./types";

export function formatPace(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function hrZoneLabel(zone: number): string {
  return ["", "Z1", "Z2", "Z3", "Z4", "Z5"][zone] ?? "Z?";
}

export function hrZoneColor(zone: number): string {
  return (
    ["", "#6ee7b7", "#86efac", "#fde047", "#fb923c", "#f87171"][zone] ?? "#94a3b8"
  );
}

export function paceStatus(pace: number, planned: number): MetricStatus {
  const diff = pace - planned; // positive = slower
  if (diff > 10) return "slow-down"; // more than 10s/km faster
  if (diff < -10) return "speed-up"; // more than 10s/km slower
  if (Math.abs(diff) > 5) return "watch";
  return "ok";
}

export function hrStatus(hr: number, zone: number): MetricStatus {
  if (zone >= 5 || hr > 178) return "slow-down";
  if (zone === 4 && hr > 170) return "watch";
  return "ok";
}

export function statusLabel(status: MetricStatus): string {
  const map: Record<MetricStatus, string> = {
    ok: "v pohodě",
    watch: "hlídat",
    "speed-up": "zrychlit",
    "slow-down": "ubrat",
  };
  return map[status];
}

export function statusColor(status: MetricStatus): string {
  const map: Record<MetricStatus, string> = {
    ok: "#4ade80",
    watch: "#facc15",
    "speed-up": "#60a5fa",
    "slow-down": "#f87171",
  };
  return map[status];
}

export function buildMetricCards(data: RaceData): MetricCardData[] {
  const paceSt = paceStatus(data.pace, data.plannedPace);
  const hrSt = hrStatus(data.heartRate, data.hrZone);
  const cadenceSt: MetricStatus =
    data.cadence < 170 ? "watch" : data.cadence > 190 ? "watch" : "ok";
  const finishDiff = data.plannedFinish - data.finishPrediction; // positive = ahead
  const finishSt: MetricStatus =
    finishDiff > 120 ? "slow-down" : finishDiff < -120 ? "speed-up" : finishDiff < -30 ? "watch" : "ok";

  return [
    {
      label: "Tempo",
      value: formatPace(data.pace),
      unit: "min/km",
      subValue: `plán ${formatPace(data.plannedPace)}`,
      status: paceSt,
      actionLabel: statusLabel(paceSt),
      trend: data.pace < data.plannedPace ? "up" : data.pace > data.plannedPace ? "down" : "stable",
    },
    {
      label: "Tep",
      value: data.heartRate.toString(),
      unit: "bpm",
      subValue: hrZoneLabel(data.hrZone),
      status: hrSt,
      actionLabel: statusLabel(hrSt),
    },
    {
      label: "Kadence",
      value: data.cadence.toString(),
      unit: "spm",
      subValue: "optimum 178–182",
      status: cadenceSt,
      actionLabel: statusLabel(cadenceSt),
    },
    {
      label: "Cílový čas",
      value: formatTime(data.finishPrediction),
      unit: "",
      subValue: `plán ${formatTime(data.plannedFinish)}`,
      status: finishSt,
      actionLabel: statusLabel(finishSt),
    },
  ];
}

export function coachRecommendation(data: RaceData): string {
  const paceDiff = data.pace - data.plannedPace;
  const finishDiff = data.plannedFinish - data.finishPrediction;

  if (data.heartRate > 175) return "Tep příliš vysoký — zpomal a zkontroluj dýchání";
  if (paceDiff < -15) return "Jedeš moc rychle — tempo na plán, šetři energii";
  if (paceDiff > 15) return "Tempo pod plán — pokud se cítíš dobře, přidej";
  if (finishDiff > 90) return `Jdeš o ${formatTime(finishDiff)} před plánem — skvělé!`;
  if (finishDiff < -60) return `Jdeš za plánem o ${formatTime(Math.abs(finishDiff))} — přidej`;
  if (data.cadence < 172) return "Kadence nízká — zvyš frekvenci kroků";
  return "Výborně — drž tempo, zásobníky v pořádku";
}

export function progressPercent(data: RaceData): number {
  return (data.currentKm / data.totalKm) * 100;
}
