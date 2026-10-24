"use client";

import { apiRequest } from "@/lib/api";
import {
  refreshModerationQueries,
  refreshTripQueries,
  removeTripQueries,
} from "@/lib/query-cache";
import { queryKeys } from "@/lib/query-keys";
import type {
  AdminOverviewResponse,
  AdminRecordActionValues,
  AdminRecordCollections,
  AdminRecordKind,
  AdminReportResponse,
  PaginationMeta,
} from "@/lib/type";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export function useAdminOverview() {
  return useQuery({
    queryKey: queryKeys.admin.overview,
    queryFn: ({ signal }) =>
      apiRequest<AdminOverviewResponse>("/api/admin/overview", { signal }),
  });
}

export function useAdminRecords(
  kind: AdminRecordKind,
  page = 1,
  search = "",
  pageSize = 12,
  filters: Record<string, string> = {},
) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.admin.page(kind, { page, search, pageSize, filters }),
    queryFn: ({ signal }) =>
      apiRequest<PaginationMeta & AdminRecordCollections>(
        "/api/admin/" +
          kind +
          "?" +
          new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
            search,
            ...filters,
          }),
        { signal },
      ),
    placeholderData: keepPreviousData,
  });
  const action = useMutation({
    mutationFn: ({ item }: AdminRecordActionValues) => {
      if ("slug" in item)
        return apiRequest(`/api/admin/trips/${item.slug}`, {
          method: "PATCH",
          body: JSON.stringify({ isPublic: !item.isPublic }),
        });
      return apiRequest(`/api/admin/reports/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: item.status === "open" ? "resolved" : "open",
          targetType: item.targetType,
        }),
      });
    },
    onSuccess: async (_, { item }) => {
      if ("slug" in item) await refreshTripQueries(queryClient, item.slug);
      else await refreshModerationQueries(queryClient);
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/admin/trips/${id}`, { method: "DELETE" }),
    onSuccess: async (_, id) => {
      removeTripQueries(queryClient, id);
      await refreshTripQueries(queryClient);
    },
  });
  return { query, action, remove };
}

export function useAdminReportDetail(
  id: string,
  targetType: "trip" | "post",
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.admin.report(targetType, id),
    enabled: enabled && Boolean(id),
    queryFn: ({ signal }) =>
      apiRequest<AdminReportResponse>(
        "/api/admin/reports/" +
          encodeURIComponent(id) +
          "?targetType=" +
          targetType,
        { signal },
      ),
    retry: false,
  });
}
