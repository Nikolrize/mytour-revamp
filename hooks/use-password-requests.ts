"use client";

import { apiRequest } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type {
  MessageResponse,
  PaginationMeta,
  PasswordRequestsData,
  ResolvePasswordRequestValues,
} from "@/lib/type";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export function usePasswordRequests(
  page = 1,
  enabled = false,
  filters: Record<string, string> = {},
) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.admin.passwordRequestPage(page, filters),
    enabled,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      apiRequest<PaginationMeta & PasswordRequestsData>(
        "/api/admin/password-requests?" +
          new URLSearchParams({ page: String(page), ...filters }),
        { signal },
      ),
    refetchInterval: 60_000,
  });
  const reset = useMutation({
    mutationFn: ({
      id,
      password,
      confirmPassword,
    }: ResolvePasswordRequestValues) =>
      apiRequest<MessageResponse>("/api/admin/password-requests/" + id, {
        method: "PATCH",
        body: JSON.stringify({ password, confirmPassword }),
      }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.admin.passwordRequests }),
  });
  return { query, reset };
}
