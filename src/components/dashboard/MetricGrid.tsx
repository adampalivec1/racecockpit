"use client";

import { RaceData } from "@/lib/types";
import { buildMetricCards } from "@/lib/raceLogic";
import { MetricCard } from "./MetricCard";

interface Props {
  data: RaceData;
}

export function MetricGrid({ data }: Props) {
  const cards = buildMetricCards(data);
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <MetricCard key={card.label} metric={card} />
      ))}
    </div>
  );
}
