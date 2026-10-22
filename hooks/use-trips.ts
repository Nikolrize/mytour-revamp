"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { Itinerary } from "@/lib/type";

export function useMyTrips() {
  return useQuery({
    queryKey: ["trips", "mine"],
    queryFn: () => apiRequest<{ trips: Itinerary[] }>("/api/trips"),
  });
}

export function usePublicTrips() {
  return useQuery({
    queryKey: ["trips", "public"],
    queryFn: () =>
      apiRequest<{ trips: Itinerary[] }>("/api/trips?scope=public"),
  });
}
