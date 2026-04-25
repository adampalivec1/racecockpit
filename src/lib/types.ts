export interface RaceData {
  currentKm: number;
  totalKm: number;
  pace: number; // seconds per km
  plannedPace: number; // seconds per km
  heartRate: number;
  hrZone: 1 | 2 | 3 | 4 | 5;
  cadence: number; // steps per minute
  verticalOscillation: number; // cm
  groundContactTime: number; // ms
  finishPrediction: number; // total seconds
  plannedFinish: number; // total seconds
  elapsedTime: number; // seconds
  latitude: number;
  longitude: number;
  splits: Split[];
  gpsStatus: "connected" | "searching" | "disconnected";
  garminStatus: "connected" | "disconnected";
  lastUpdate: Date;
}

export interface Split {
  km: number;
  pace: number; // seconds per km
  plannedPace: number;
  hr: number;
}

export interface FuelEvent {
  km: number;
  type: "gel" | "water" | "electrolyte";
  taken: boolean;
  label: string;
}

export type MetricStatus = "ok" | "watch" | "speed-up" | "slow-down";

export interface MetricCardData {
  label: string;
  value: string;
  unit: string;
  subValue?: string;
  status: MetricStatus;
  actionLabel: string;
  trend?: "up" | "down" | "stable";
}
