"use client";

import { apiRequest } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { PublicProfileResponse } from "@/lib/type";
import { useQuery } from "@tanstack/react-query";

export function usePublicProfile(
  userId: string,
  kind: "trips" | "posts",
  page: number,
  enabled = true,
) {
  return useQuery({
    enabled,
    queryKey: queryKeys.publicProfiles.page(userId, kind, page),
    queryFn: ({ signal }) =>
      apiRequest<PublicProfileResponse>(
        "/api/users/" +
          encodeURIComponent(userId) +
          "?" +
          new URLSearchParams({ kind, page: String(page) }),
        { signal },
      ),
    retry: false,
  });
}
