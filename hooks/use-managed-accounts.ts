"use client";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { z } from "zod";
import { apiRequest } from "@/lib/api";
import type { ManagedAccount, PaginationMeta } from "@/lib/type";
import type {
  adminAccountCreateSchema,
  adminAccountEditSchema,
} from "@/lib/schemas";

export function useManagedAccounts(
  options: {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: string;
    status?: string;
    accountRole?: string;
    sort?: string;
  } = {},
  enabled = false,
) {
  const client = useQueryClient();
  const refresh = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: ["admin", "users"] }),
      client.invalidateQueries({ queryKey: ["admin", "password-requests"] }),
      client.invalidateQueries({ queryKey: ["admin-account"] }),
      client.invalidateQueries({ queryKey: ["admin", "overview"] }),
      client.invalidateQueries({ queryKey: ["profile"] }),
      client.invalidateQueries({ queryKey: ["trips"] }),
      client.invalidateQueries({ queryKey: ["community-posts"] }),
    ]);
  const query = useQuery({
    queryKey: ["admin", "users", options],
    enabled,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      apiRequest<PaginationMeta & { users: ManagedAccount[] }>(
        "/api/admin/users?" +
          new URLSearchParams(
            Object.entries(options).map(([key, value]) => [key, String(value)]),
          ),
        { signal },
      ),
  });
  const create = useMutation({
    mutationFn: (values: z.infer<typeof adminAccountCreateSchema>) =>
      apiRequest("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: refresh,
  });
  const edit = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: z.infer<typeof adminAccountEditSchema>;
    }) =>
      apiRequest("/api/admin/users/" + id, {
        method: "PATCH",
        body: JSON.stringify(values),
      }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: string) =>
      apiRequest("/api/admin/users/" + id, { method: "DELETE" }),
    onSuccess: refresh,
  });
  const setStatus = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "active" | "inactive";
    }) =>
      apiRequest("/api/admin/users/" + id + "/status", {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: refresh,
    onError: refresh,
  });
  return { query, create, edit, remove, setStatus };
}

export function useManagedAccount(id: string, enabled: boolean) {
  return useQuery({
    queryKey: ["admin-account", id],
    enabled,
    queryFn: () => apiRequest<{ email: string }>("/api/admin/users/" + id),
    staleTime: 0,
    retry: false,
  });
}
