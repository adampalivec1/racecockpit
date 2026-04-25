import { RaceData, Split, FuelEvent } from "./types";

export const PLANNED_PACE = 4 * 60 + 55; // 4:55 per km in seconds
export const PLANNED_FINISH = (4 * 60 + 55) * 21.0975; // ~1:44:00

export function generateSplits(currentKm: number): Split[] {
  const splits: Split[] = [];
  const basePaces = [
    302, 298, 295, 297, 293, 291, 294, 290, 292, 295, 293, 291, 292,
  ];
  for (let i = 1; i <= Math.floor(currentKm); i++) {
    splits.push({
      km: i,
      pace: basePaces[i - 1] ?? 292 + Math.round((Math.random() - 0.5) * 6),
      plannedPace: PLANNED_PACE,
      hr: 155 + Math.round(i * 0.4) + Math.round((Math.random() - 0.5) * 4),
    });
  }
  return splits;
}

export const FUEL_PLAN: FuelEvent[] = [
  { km: 5, type: "gel", taken: true, label: "Gel #1" },
  { km: 5, type: "water", taken: true, label: "Voda" },
  { km: 10, type: "gel", taken: true, label: "Gel #2" },
  { km: 10, type: "electrolyte", taken: true, label: "Izotonický" },
  { km: 15, type: "gel", taken: false, label: "Gel #3" },
  { km: 15, type: "water", taken: false, label: "Voda" },
  { km: 18, type: "gel", taken: false, label: "Gel #4" },
  { km: 21, type: "water", taken: false, label: "Cíl" },
];

export function createBaseRaceData(): RaceData {
  return {
    currentKm: 13.4,
    totalKm: 21.0975,
    pace: 4 * 60 + 52, // 4:52
    plannedPace: PLANNED_PACE,
    heartRate: 162,
    hrZone: 4,
    cadence: 178,
    verticalOscillation: 8.2,
    groundContactTime: 238,
    finishPrediction: 1 * 3600 + 42 * 60 + 30, // 1:42:30
    plannedFinish: 1 * 3600 + 44 * 60, // 1:44:00
    elapsedTime: 13.4 * (4 * 60 + 52),
    latitude: 50.0755,
    longitude: 14.4378,
    splits: generateSplits(13.4),
    gpsStatus: "connected",
    garminStatus: "connected",
    lastUpdate: new Date(),
  };
}

export function applyVariation(data: RaceData): RaceData {
  const rand = (range: number) => (Math.random() - 0.5) * 2 * range;
  const newKm = Math.min(data.currentKm + 0.023, data.totalKm); // ~5s at ~4:52
  const newPace = Math.max(260, Math.min(320, data.pace + Math.round(rand(3))));
  const newHr = Math.max(140, Math.min(185, data.heartRate + Math.round(rand(1))));
  const newCadence = Math.max(160, Math.min(195, data.cadence + Math.round(rand(1))));

  // Recalculate finish prediction based on current pace
  const remainingKm = data.totalKm - newKm;
  const predictedRemaining = remainingKm * newPace;
  const newPrediction = data.elapsedTime + predictedRemaining;

  const splits =
    Math.floor(newKm) > Math.floor(data.currentKm)
      ? [
          ...data.splits,
          {
            km: Math.floor(newKm),
            pace: newPace,
            plannedPace: PLANNED_PACE,
            hr: newHr,
          },
        ]
      : data.splits;

  return {
    ...data,
    currentKm: newKm,
    pace: newPace,
    heartRate: newHr,
    hrZone: newHr < 140 ? 2 : newHr < 155 ? 3 : newHr < 170 ? 4 : 5,
    cadence: newCadence,
    verticalOscillation: Math.round((data.verticalOscillation + rand(0.2)) * 10) / 10,
    groundContactTime: Math.max(200, Math.min(280, data.groundContactTime + Math.round(rand(3)))),
    finishPrediction: Math.round(newPrediction),
    elapsedTime: data.elapsedTime + 5,
    splits,
    lastUpdate: new Date(),
  };
}
