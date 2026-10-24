"use client";

import { apiRequest } from "@/lib/api";
import {
  refreshModerationQueries,
  refreshTripQueries,
  removeTripQueries,
} from "@/lib/query-cache";
import { queryKeys } from "@/lib/query-keys";
import type {
  ContentReportValues,
  CreatedRecordResponse,
  TripDetailsValues,
  TripPageOptions,
  TripPageResponse,
  TripSaveResponse,
} from "@/lib/type";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

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
    queryKey: queryKeys.trips.page(scope, filters),
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

// Read one saved flag instead of downloading the complete Saved collection.
export function useSaveTrip(tripId: string, enabled = true) {
  const queryClient = useQueryClient();
  const key = queryKeys.tripSaves.detail(tripId);
  const savedStatus = useQuery({
    queryKey: key,
    enabled,
    queryFn: ({ signal }) =>
      apiRequest<TripSaveResponse>(`/api/trips/${tripId}/save`, { signal }),
  });
  const isSaved = savedStatus.data?.saved ?? false;
  const toggleSave = useMutation({
    mutationFn: () =>
      apiRequest<TripSaveResponse>(`/api/trips/${tripId}/save`, {
        method: isSaved ? "DELETE" : "POST",
      }),
    onSuccess: async (result) => {
      queryClient.setQueryData(key, result);
      await refreshTripQueries(queryClient, tripId);
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
    onSuccess: async () => refreshTripQueries(queryClient, tripId),
  });
}

export function useTripActions(tripId: string) {
  const queryClient = useQueryClient();
  const refresh = () => refreshTripQueries(queryClient, tripId);
  const copy = useMutation({
    mutationFn: () =>
      apiRequest<CreatedRecordResponse>(`/api/trips/${tripId}/copy`, {
        method: "POST",
      }),
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: (values: TripDetailsValues) =>
      apiRequest(`/api/trips/${tripId}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: () => apiRequest(`/api/trips/${tripId}`, { method: "DELETE" }),
    onSuccess: async () => {
      removeTripQueries(queryClient, tripId);
      await refreshTripQueries(queryClient);
    },
  });
  const report = useMutation({
    mutationFn: (values: ContentReportValues) =>
      apiRequest(`/api/trips/${tripId}/report`, {
        method: "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: () => refreshModerationQueries(queryClient),
  });
  return { copy, update, remove, report };
}
