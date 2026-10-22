"use client";

import { useQuery } from "@tanstack/react-query";
import type { Destination } from "@/lib/type";
import { apiRequest } from "@/lib/api";

export function useDestinations() {
  const query = useQuery({
    queryKey: ["destinations"],
    queryFn: () =>
      apiRequest<{ destinations: Destination[] }>("/api/destinations"),
  });
  return {
    destinations: query.data?.destinations ?? [],
    loading: query.isPending,
    error: query.error?.message ?? "",
  };
}
