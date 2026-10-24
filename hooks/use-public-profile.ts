"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { PublicProfileResponse } from "@/lib/type";

export function usePublicProfile(userId: string, kind: "trips" | "posts", page: number, enabled = true) {
  return useQuery({
    enabled,
    queryKey: ["public-profile", userId, { kind, page }],
    queryFn: ({ signal }) => apiRequest<PublicProfileResponse>("/api/users/" + encodeURIComponent(userId) + "?" + new URLSearchParams({ kind, page: String(page) }), { signal }),
    retry: false,
  });
}
