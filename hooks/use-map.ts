"use client";

import { apiRequest } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type {
  Coordinates,
  GeocodeResponse,
  ItineraryStop,
  LocatedStop,
  RoadRouteResponse,
} from "@/lib/type";
import { useQuery } from "@tanstack/react-query";

export function useMapStops(stops: ItineraryStop[]) {
  const places = stops
    .filter(
      (stop) =>
        !Number.isFinite(stop.latitude) || !Number.isFinite(stop.longitude),
    )
    .map((stop) => ({ name: stop.place, area: stop.area || "" }));
  const lookup = useQuery({
    queryKey: queryKeys.maps.places(places),
    enabled: places.length > 0,
    queryFn: async ({ signal }) => {
      const coordinates: (Coordinates | null)[] = [];
      for (let i = 0; i < places.length; i += 10) {
        const result = await apiRequest<GeocodeResponse>("/api/maps/geocode", {
          signal,
          method: "POST",
          body: JSON.stringify({ places: places.slice(i, i + 10) }),
        });
        coordinates.push(...result.coordinates);
      }
      return { coordinates };
    },
    staleTime: (query) =>
      query.state.data?.coordinates.some((point) => point === null)
        ? 60000
        : 86400000,
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
    isLocating: places.length > 0 && (lookup.isPending || lookup.isFetching),
  };
}

export function useMapRoute(stops: ItineraryStop[]) {
  const coordinates = stops
    .filter(
      (stop): stop is LocatedStop =>
        typeof stop.latitude === "number" &&
        Number.isFinite(stop.latitude) &&
        typeof stop.longitude === "number" &&
        Number.isFinite(stop.longitude),
    )
    .map((stop) => ({ latitude: stop.latitude, longitude: stop.longitude }));
  return useQuery({
    queryKey: queryKeys.maps.route(coordinates),
    enabled: coordinates.length > 1,
    queryFn: ({ signal }) =>
      apiRequest<RoadRouteResponse>("/api/maps/route", {
        signal,
        method: "POST",
        body: JSON.stringify({ coordinates }),
      }),
    staleTime: 3600000,
    retry: false,
  });
}
