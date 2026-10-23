"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { Itinerary } from "@/lib/type";

export function useTripDetails(tripId: string) {
  return useQuery({
    queryKey: ["trip", tripId],
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    queryFn: () =>
      apiRequest<{ trip: Itinerary; isOwner: boolean }>(`/api/trips/${tripId}`),
    enabled: Boolean(tripId),
  });
}
