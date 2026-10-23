"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export type AdminKind = "users" | "trips" | "reports";

export function useAdminOverview() {
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => apiRequest<Record<string, number>>("/api/admin/overview"),
  });
}

export function useAdminRecords(kind: AdminKind) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["admin", kind],
    queryFn: async () =>
      (
        await apiRequest<Record<string, Record<string, unknown>[]>>(
          `/api/admin/${kind}`,
        )
      )[kind],
  });
  const action = useMutation({
    mutationFn: async ({ item }: { item?: Record<string, unknown> }) => {
      if (!item) throw new Error("Could not find the selected record.");
      if (kind === "users")
        return apiRequest(`/api/admin/users/${String(item.id)}`, {
          method: "PATCH",
          body: JSON.stringify({
            isAdmin: !(
              Array.isArray(item.roles) && item.roles.includes("admin")
            ),
          }),
        });
      if (kind === "trips")
        return apiRequest(`/api/admin/trips/${String(item.slug)}`, {
          method: "PATCH",
          body: JSON.stringify({ isPublic: !Boolean(item.isPublic) }),
        });
      if (kind === "reports" && item.status === "open")
        return apiRequest(`/api/admin/reports/${String(item.id)}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "resolved" }),
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
  return { query, action };
}
