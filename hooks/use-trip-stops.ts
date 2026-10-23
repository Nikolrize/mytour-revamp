"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export type StopValues = {
  title: string;
  description: string;
  day: number;
  startTime: string;
  endTime: string;
  mapsUrl: string;
};

export function useTripStops(tripId: string, fetchStops = true) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["trip-stops", tripId],
    queryFn: () =>
      apiRequest<{ stops: Record<string, unknown>[] }>(
        `/api/trips/${tripId}/stops`,
      ),
    enabled: Boolean(tripId) && fetchStops,
  });
  const refresh = async () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["trip-stops", tripId] }),
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] }),
      queryClient.invalidateQueries({ queryKey: ["trips"] }),
      queryClient.invalidateQueries({ queryKey: ["community-posts"] }),
    ]);
  const create = useMutation({
    mutationFn: async ({ mapsUrl, ...values }: StopValues) => {
      const coordinates = await apiRequest<{
        latitude: number;
        longitude: number;
      }>("/api/maps/resolve", {
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
    mutationFn: async ({
      stopId,
      values,
    }: {
      stopId: string;
      values: import("zod").z.infer<
        typeof import("@/lib/schemas").editStopSchema
      >;
    }) => {
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
