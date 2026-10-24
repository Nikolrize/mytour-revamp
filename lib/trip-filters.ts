import type { Itinerary } from "@/lib/type";

export function getTripStates(trip: Itinerary): string[] {
  return trip.location
    .split(",")
    .map((state) => state.trim())
    .filter((state) => state && state !== "Malaysia");
}
