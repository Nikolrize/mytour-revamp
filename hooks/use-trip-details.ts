"use client";

import { apiRequest } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { TripDetailResponse } from "@/lib/type";
import { useQuery } from "@tanstack/react-query";

export function useTripDetails(tripId: string) {
  return useQuery({
    queryKey: queryKeys.tripDetails.detail(tripId),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    queryFn: ({ signal }) =>
      apiRequest<TripDetailResponse>(`/api/trips/${tripId}`, { signal }),
    enabled: Boolean(tripId),
  });
}
