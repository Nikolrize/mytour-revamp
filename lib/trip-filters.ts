import type { Itinerary, TripFilters } from "@/lib/type";

export function getTripStates(trip: Itinerary): string[] {
  return trip.location
    .split(",")
    .map((state) => state.trim())
    .filter((state) => state && state !== "Malaysia");
}

export function filterTrips(
  trips: Itinerary[],
  filters: TripFilters,
): Itinerary[] {
  const search = filters.search.trim().toLowerCase();
  const result = trips.filter((trip) => {
    const matchesState =
      filters.state === "all" || getTripStates(trip).includes(filters.state);
    const matchesTags = filters.tags.every((tag) =>
      trip.interests?.includes(tag),
    );
    const matchesSearch =
      `${trip.title} ${trip.location} ${trip.description} ${(trip.interests ?? []).join(" ")}`
        .toLowerCase()
        .includes(search);
    return matchesState && matchesTags && matchesSearch;
  });
  if (filters.sort === "saved") result.sort((a, b) => b.saves - a.saves);
  if (filters.sort === "rating")
    result.sort((a, b) => Number(b.rating) - Number(a.rating));
  return result;
}
