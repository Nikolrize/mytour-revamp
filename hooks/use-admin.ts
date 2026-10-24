"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { PaginationMeta } from "@/lib/type";
import { apiRequest } from "@/lib/api";

export type AdminKind = "users" | "trips" | "reports";

export function useAdminOverview() {
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => apiRequest<Record<string, number>>("/api/admin/overview"),
  });
}

export function useAdminRecords(
  kind: AdminKind,
  page = 1,
  search = "",
  pageSize = 12,
) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["admin", kind, { page, search, pageSize }],
    queryFn: ({ signal }) =>
      apiRequest<
        PaginationMeta & {
          users?: Record<string, unknown>[];
          trips?: Record<string, unknown>[];
          reports?: Record<string, unknown>[];
        }
      >(
        "/api/admin/" +
          kind +
          "?" +
          new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
            search,
          }),
        { signal },
      ),
    placeholderData: keepPreviousData,
  });
  const action = useMutation({
    mutationFn: async ({ item }: { item?: Record<string, unknown> }) => {
      if (!item) throw new Error("Could not find the selected record.");
      if (kind === "trips")
        return apiRequest(`/api/admin/trips/${String(item.slug)}`, {
          method: "PATCH",
          body: JSON.stringify({ isPublic: !Boolean(item.isPublic) }),
        });
      if (kind === "reports")
        return apiRequest(`/api/admin/reports/${String(item.id)}`, {
          method: "PATCH",
          body: JSON.stringify({
            status: item.status === "open" ? "resolved" : "open",
            targetType: item.targetType ?? "trip",
          }),
        });
      throw new Error("This item has no available action.");
    },
    onSuccess: async () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", kind] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "overview"] }),
        queryClient.invalidateQueries({ queryKey: ["trips"] }),
        queryClient.invalidateQueries({ queryKey: ["community-posts"] }),
        queryClient.invalidateQueries({ queryKey: ["profile"] }),
      ]),
  });
  const remove = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/admin/trips/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin"] }),
        queryClient.invalidateQueries({ queryKey: ["trips"] }),
        queryClient.invalidateQueries({ queryKey: ["trip"] }),
        queryClient.invalidateQueries({ queryKey: ["community-posts"] }),
        queryClient.invalidateQueries({ queryKey: ["profile"] }),
      ]);
    },
  });
  return { query, action, remove };
}
