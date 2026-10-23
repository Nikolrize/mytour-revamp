"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { ItineraryStop } from "@/lib/type";

type Coordinates = { latitude: number; longitude: number };
export function useMapStops(stops: ItineraryStop[]) {
  const places = stops
    .filter(
      (stop) =>
        !Number.isFinite(stop.latitude) || !Number.isFinite(stop.longitude),
    )
    .map((stop) => ({ name: stop.place, area: stop.area || "" }));
  const lookup = useQuery({
    queryKey: ["map-places", places],
    enabled: places.length > 0,
    queryFn: () =>
      apiRequest<{ coordinates: (Coordinates | null)[] }>("/api/maps/geocode", {
        method: "POST",
        body: JSON.stringify({ places }),
      }),
    staleTime: 86400000,
    retry: false,
  });
  let missingIndex = 0;
  const mappedStops = stops.map((stop) => {
    if (Number.isFinite(stop.latitude) && Number.isFinite(stop.longitude))
      return stop;
    const coordinates = lookup.data?.coordinates[missingIndex++];
    return coordinates ? { ...stop, ...coordinates } : stop;
  });
  return {
    stops: mappedStops,
    isLocating: places.length > 0 && lookup.isPending,
  };
}

export function useMapRoute(stops: ItineraryStop[]) {
  const coordinates = stops
    .filter(
      (stop) =>
        Number.isFinite(stop.latitude) && Number.isFinite(stop.longitude),
    )
    .map((stop) => ({ latitude: stop.latitude!, longitude: stop.longitude! }));
  return useQuery({
    queryKey: ["map-route", coordinates],
    enabled: coordinates.length > 1,
    queryFn: () =>
      apiRequest<{ coordinates: [number, number][] }>("/api/maps/route", {
        method: "POST",
        body: JSON.stringify({ coordinates }),
      }),
    staleTime: 3600000,
    retry: false,
  });
}
