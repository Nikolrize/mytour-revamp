"use client";

import { apiRequest } from "@/lib/api";
import { refreshAccountQueries } from "@/lib/query-cache";
import { queryKeys } from "@/lib/query-keys";
import type {
  AccountEmailResponse,
  AdminAccountCreateValues,
  EditManagedAccountValues,
  ManagedAccountPageOptions,
  ManagedAccountsData,
  PaginationMeta,
  UpdateAccountStatusValues,
} from "@/lib/type";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export function useManagedAccounts(
  options: ManagedAccountPageOptions = {},
  enabled = false,
) {
  const client = useQueryClient();
  const refresh = () => refreshAccountQueries(client);
  const query = useQuery({
    queryKey: queryKeys.admin.users(options),
    enabled,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      apiRequest<PaginationMeta & ManagedAccountsData>(
        "/api/admin/users?" +
          new URLSearchParams(
            Object.entries(options).map(([key, value]) => [key, String(value)]),
          ),
        { signal },
      ),
  });
  const create = useMutation({
    mutationFn: (values: AdminAccountCreateValues) =>
      apiRequest("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: refresh,
  });
  const edit = useMutation({
    mutationFn: ({ id, values }: EditManagedAccountValues) =>
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
    mutationFn: ({ id, status }: UpdateAccountStatusValues) =>
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
    queryKey: queryKeys.admin.account(id),
    enabled,
    queryFn: ({ signal }) =>
      apiRequest<AccountEmailResponse>("/api/admin/users/" + id, { signal }),
    staleTime: 0,
    retry: false,
  });
}
