"use client";

import { apiRequest } from "@/lib/api";
import { refreshTripStops } from "@/lib/query-cache";
import { queryKeys } from "@/lib/query-keys";
import type {
  Coordinates,
  EditTripStopValues,
  StopValues,
  TripStopsResponse,
} from "@/lib/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useTripStops(tripId: string, fetchStops = true) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.tripStops.detail(tripId),
    queryFn: ({ signal }) =>
      apiRequest<TripStopsResponse>(`/api/trips/${tripId}/stops`, { signal }),
    enabled: Boolean(tripId) && fetchStops,
  });
  const refresh = () => refreshTripStops(queryClient, tripId);
  const create = useMutation({
    mutationFn: async ({ mapsUrl, ...values }: StopValues) => {
      const coordinates = await apiRequest<Coordinates>("/api/maps/resolve", {
        method: "POST",
        body: JSON.stringify({ mapsUrl }),
      });
      return apiRequest(`/api/trips/${tripId}/stops`, {
        method: "POST",
        body: JSON.stringify({ ...values, ...coordinates }),
      });
    },
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (stopId: string) =>
      apiRequest(`/api/trips/${tripId}/stops/${stopId}`, { method: "DELETE" }),
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: async ({ stopId, values }: EditTripStopValues) => {
      return apiRequest(`/api/trips/${tripId}/stops/${stopId}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...values,
          startTime: values.startTime || null,
          endTime: values.endTime || null,
        }),
      });
    },
    onSuccess: refresh,
  });
  return { query, create, remove, update };
}
