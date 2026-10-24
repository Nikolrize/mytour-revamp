"use client";

import { apiRequest } from "@/lib/api";
import { refreshTripQueries } from "@/lib/query-cache";
import { queryKeys } from "@/lib/query-keys";
import type {
  Coordinates,
  CreateTripValues,
  CreatedRecordResponse,
  GeneratedStop,
  GeneratedStopsResponse,
  StatesResponse,
  StopValues,
  TripPlanValues,
} from "@/lib/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export function usePlan(onCreated: (id: string) => void) {
  const queryClient = useQueryClient();
  const statesQuery = useQuery({
    queryKey: queryKeys.states,
    queryFn: ({ signal }) =>
      apiRequest<StatesResponse>("/api/states", { signal }),
  });
  const generateItinerary = useMutation({
    mutationFn: (values: TripPlanValues) =>
      apiRequest<GeneratedStopsResponse>("/api/ai/itinerary", {
        method: "POST",
        body: JSON.stringify({
          title: values.title,
          description: values.description?.trim() || "",
          states: values.states,
          startDate: values.startDate
            ? format(values.startDate, "yyyy-MM-dd")
            : null,
          endDate: values.endDate ? format(values.endDate, "yyyy-MM-dd") : null,
          days:
            values.startDate && values.endDate
              ? Math.max(
                  1,
                  Math.round(
                    (values.endDate.getTime() - values.startDate.getTime()) /
                      86400000,
                  ) + 1,
                )
              : 3,
          startTime: values.startTime || null,
          endTime: values.endTime || null,
          travellers: values.travellers,
          style: values.style,
          interests: values.interests,
        }),
      }),
  });
  const createTrip = useMutation({
    mutationFn: ({ values, stops }: CreateTripValues) =>
      apiRequest<CreatedRecordResponse>("/api/trips", {
        method: "POST",
        body: JSON.stringify({
          title: values.title,
          description: values.description?.trim() || "",
          states: values.states,
          startDate: values.startDate
            ? format(values.startDate, "yyyy-MM-dd")
            : null,
          endDate: values.endDate ? format(values.endDate, "yyyy-MM-dd") : null,
          startTime: values.startTime || null,
          endTime: values.endTime || null,
          interests: values.interests,
          stops,
        }),
      }),
    onSuccess: async ({ id }) => {
      await refreshTripQueries(queryClient);
      onCreated(id);
    },
  });
  const resolveStop = useMutation({
    mutationFn: async (values: StopValues): Promise<GeneratedStop> => {
      const coordinates = await apiRequest<Coordinates>("/api/maps/resolve", {
        method: "POST",
        body: JSON.stringify({ mapsUrl: values.mapsUrl }),
      });
      return {
        title: values.title,
        description: values.description,
        day: values.day,
        date: null,
        startTime: values.startTime,
        endTime: values.endTime,
        area: "",
        ...coordinates,
      };
    },
  });
  return { statesQuery, generateItinerary, createTrip, resolveStop };
}
