"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { Itinerary } from "@/lib/type";

export function useMyTrips(enabled = true) {
  return useQuery({
    queryKey: ["trips", "mine"],
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    enabled,
    queryFn: () => apiRequest<{ trips: Itinerary[] }>("/api/trips"),
  });
}

export function usePublicTrips() {
  return useQuery({
    queryKey: ["trips", "public"],
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    queryFn: () =>
      apiRequest<{ trips: Itinerary[] }>("/api/trips?scope=public"),
  });
}

export function useSavedTrips(enabled = true) {
  return useQuery({
    queryKey: ["trips", "saved"],
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    queryFn: () => apiRequest<{ trips: Itinerary[] }>("/api/trips?scope=saved"),
    enabled,
  });
}

export function useSaveTrip(tripId: string, enabled = true) {
  const queryClient = useQueryClient();
  const savedTrips = useSavedTrips(enabled);
  const isSaved =
    savedTrips.data?.trips.some((trip) => trip.slug === tripId) ?? false;
  const toggleSave = useMutation({
    mutationFn: () =>
      apiRequest(`/api/trips/${tripId}/save`, {
        method: isSaved ? "DELETE" : "POST",
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["trips", "saved"] }),
        queryClient.invalidateQueries({ queryKey: ["trips", "public"] }),
      ]);
    },
  });
  return { isSaved, toggleSave, savedTrips };
}

export function useUpdateTripVisibility(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isPublic: boolean) =>
      apiRequest(`/api/trips/${tripId}`, {
        method: "PATCH",
        body: JSON.stringify({ isPublic }),
      }),
    onSuccess: async () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["trip", tripId] }),
        queryClient.invalidateQueries({ queryKey: ["trips"] }),
        queryClient.invalidateQueries({ queryKey: ["community-posts"] }),
      ]),
  });
}

export function useTripActions(tripId: string) {
  const queryClient = useQueryClient();
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] }),
      queryClient.invalidateQueries({ queryKey: ["trips"] }),
      queryClient.invalidateQueries({ queryKey: ["community-posts"] }),
      queryClient.invalidateQueries({ queryKey: ["admin"] }),
    ]);
  };
  const copy = useMutation({
    mutationFn: () =>
      apiRequest<{ id: string }>(`/api/trips/${tripId}/copy`, {
        method: "POST",
      }),
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: (
      values: import("zod").z.infer<
        typeof import("@/lib/schemas").tripDetailsSchema
      >,
    ) =>
      apiRequest(`/api/trips/${tripId}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: () => apiRequest(`/api/trips/${tripId}`, { method: "DELETE" }),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: ["trip", tripId] });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["trips"] }),
        queryClient.invalidateQueries({ queryKey: ["community-posts"] }),
      ]);
    },
  });
  const report = useMutation({
    mutationFn: (
      values: import("zod").z.infer<
        typeof import("@/lib/schemas").tripReportSchema
      >,
    ) =>
      apiRequest(`/api/trips/${tripId}/report`, {
        method: "POST",
        body: JSON.stringify(values),
      }),
  });
  return { copy, update, remove, report };
}
