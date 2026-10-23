"use client";

import type { ItineraryStop } from "@/lib/type";
import { useTripDistance } from "@/hooks/use-map";

export function TripDistance({ stops }: { stops: ItineraryStop[] }) {
  const { kilometers, loading } = useTripDistance(stops);
  return (
    <span>
      {loading
        ? "Calculating distance…"
        : kilometers === null
          ? "Distance unavailable"
          : "about " +
            kilometers.toLocaleString("en-MY", { maximumFractionDigits: 1 }) +
            " km"}
    </span>
  );
}
