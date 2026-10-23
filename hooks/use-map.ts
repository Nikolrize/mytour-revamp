"use client";

import { useQuery, useQueries } from "@tanstack/react-query";
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
    queryFn: async () => {
      const coordinates: (Coordinates | null)[] = [];
      for (let i = 0; i < places.length; i += 10) {
        const result = await apiRequest<{
          coordinates: (Coordinates | null)[];
        }>("/api/maps/geocode", {
          method: "POST",
          body: JSON.stringify({ places: places.slice(i, i + 10) }),
        });
        coordinates.push(...result.coordinates);
      }
      return { coordinates };
    },
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
      apiRequest<{
        coordinates: [number, number][];
        distanceMeters: number;
        durationSeconds: number;
      }>("/api/maps/route", {
        method: "POST",
        body: JSON.stringify({ coordinates }),
      }),
    staleTime: 3600000,
    retry: false,
  });
}

// Route each day independently; overlap batches so trips over ten stops remain complete.
export function useTripDistance(stops: ItineraryStop[]) {
  const located = useMapStops(stops);
  const days = [...new Set(located.stops.map((stop) => stop.day))];
  const batches = days.flatMap((day) => {
    const daily = located.stops.filter((stop) => stop.day === day);
    const result: ItineraryStop[][] = [];
    for (let i = 0; i < daily.length - 1; i += 9)
      result.push(daily.slice(i, i + 10));
    return result;
  });
  const queries = useQueries({
    queries: batches.map((batch) => {
      const coordinates = batch.map((stop) => ({
        latitude: stop.latitude,
        longitude: stop.longitude,
      }));
      const complete = coordinates.every(
        (point) =>
          Number.isFinite(point.latitude) && Number.isFinite(point.longitude),
      );
      return {
        queryKey: ["map-route", coordinates],
        enabled: complete,
        queryFn: () =>
          apiRequest<{
            distanceMeters: number;
            coordinates: [number, number][];
          }>("/api/maps/route", {
            method: "POST",
            body: JSON.stringify({ coordinates }),
          }),
        staleTime: 3600000,
        retry: false,
      };
    }),
  });
  const ready = queries.every((query) =>
    Number.isFinite(query.data?.distanceMeters),
  );
  return {
    loading: located.isLocating || queries.some((query) => query.isFetching),
    kilometers: ready
      ? queries.reduce(
          (total, query) => total + (query.data?.distanceMeters ?? 0),
          0,
        ) / 1000
      : null,
  };
}
