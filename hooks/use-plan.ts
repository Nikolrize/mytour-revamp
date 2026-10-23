"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import type { z } from "zod";
import { apiRequest } from "@/lib/api";
import type { StopValues } from "@/hooks/use-trip-stops";
import { tripPlanSchema } from "@/lib/schemas";

export type TripPlanValues = z.infer<typeof tripPlanSchema>;
export type GeneratedStop = {
  destinationId?: string;
  title: string;
  description: string;
  day: number;
  date: string | null;
  startTime: string;
  endTime: string;
  latitude: number | null;
  longitude: number | null;
  area: string;
};

export function usePlan(onCreated: (id: string) => void) {
  const queryClient = useQueryClient();
  const statesQuery = useQuery({
    queryKey: ["states"],
    queryFn: () =>
      apiRequest<{ states: { id: number; name: string; code: string }[] }>(
        "/api/states",
      ),
  });
  const generateItinerary = useMutation({
    mutationFn: (values: TripPlanValues) =>
      apiRequest<{ stops: GeneratedStop[] }>("/api/ai/itinerary", {
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
    mutationFn: ({
      values,
      stops,
    }: {
      values: TripPlanValues;
      stops: GeneratedStop[];
    }) =>
      apiRequest<{ id: string }>("/api/trips", {
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
      await queryClient.invalidateQueries({ queryKey: ["trips"] });
      onCreated(id);
    },
  });
  const resolveStop = useMutation({
    mutationFn: async (values: StopValues): Promise<GeneratedStop> => {
      const coordinates = await apiRequest<{
        latitude: number;
        longitude: number;
      }>("/api/maps/resolve", {
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
