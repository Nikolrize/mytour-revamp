"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { PasswordResetRequest, PaginationMeta } from "@/lib/type";

export function usePasswordRequests(page = 1, enabled = false) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["admin", "password-requests", page],
    enabled,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      apiRequest<PaginationMeta & { requests: PasswordResetRequest[] }>(
        "/api/admin/password-requests?page=" + page,
        { signal },
      ),
    refetchInterval: 60_000,
  });
  const reset = useMutation({
    mutationFn: ({
      id,
      password,
      confirmPassword,
    }: {
      id: string;
      password: string;
      confirmPassword: string;
    }) =>
      apiRequest<{ message: string }>("/api/admin/password-requests/" + id, {
        method: "PATCH",
        body: JSON.stringify({ password, confirmPassword }),
      }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["admin", "password-requests"] }),
  });
  return { query, reset };
}
