"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { TripPageOptions, TripPageResponse } from "@/lib/type";

// A query key per page/filter combination keeps pages cached independently.
export function useTripPage(options: TripPageOptions = {}, enabled = true) {
  const {
    scope = "mine",
    page = 1,
    pageSize = 12,
    search = "",
    state = "all",
    tags = [],
    sort = "latest",
    status = "all",
    publicOnly = false,
  } = options;
  const filters = {
    page,
    pageSize,
    search,
    state,
    tags,
    sort,
    status,
    publicOnly,
  };
  return useQuery({
    queryKey: ["trips", scope, filters],
    enabled,
    queryFn: ({ signal }) => {
      const params = new URLSearchParams({
        scope,
        page: String(page),
        pageSize: String(pageSize),
        q: search,
        state,
        sort,
        status,
        publicOnly: String(publicOnly),
      });
      tags.forEach((tag) => params.append("tag", tag));
      return apiRequest<TripPageResponse>("/api/trips?" + params, { signal });
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
export function useMyTrips(enabled = true, options: TripPageOptions = {}) {
  return useTripPage({ ...options, scope: "mine" }, enabled);
}
export function usePublicTrips(options: TripPageOptions = {}) {
  return useTripPage({ ...options, scope: "public" });
}
export function useSavedTrips(enabled = true, options: TripPageOptions = {}) {
  return useTripPage({ ...options, scope: "saved" }, enabled);
}

// Read one saved flag instead of downloading the complete Saved collection.
export function useSaveTrip(tripId: string, enabled = true) {
  const queryClient = useQueryClient();
  const key = ["trip-save-status", tripId];
  const savedStatus = useQuery({
    queryKey: key,
    enabled,
    queryFn: ({ signal }) =>
      apiRequest<{ saved: boolean }>(`/api/trips/${tripId}/save`, { signal }),
  });
  const isSaved = savedStatus.data?.saved ?? false;
  const toggleSave = useMutation({
    mutationFn: () =>
      apiRequest<{ saved: boolean }>(`/api/trips/${tripId}/save`, {
        method: isSaved ? "DELETE" : "POST",
      }),
    onSuccess: async (result) => {
      queryClient.setQueryData(key, result);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["trips"] }),
        queryClient.invalidateQueries({ queryKey: ["trip", tripId] }),
        queryClient.invalidateQueries({ queryKey: ["community-posts"] }),
      ]);
    },
  });
  return { isSaved, toggleSave, savedStatus };
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
