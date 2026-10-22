"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import type { z } from "zod";
import { apiRequest } from "@/lib/api";
import { tripPlanSchema } from "@/lib/schemas";

export type TripPlanValues = z.infer<typeof tripPlanSchema>;

export function usePlan(onCreated: (id: string) => void) {
  const queryClient = useQueryClient();
  const statesQuery = useQuery({
    queryKey: ["states"],
    queryFn: () =>
      apiRequest<{ states: { id: number; name: string; code: string }[] }>(
        "/api/states",
      ),
  });
  const createTrip = useMutation({
    mutationFn: (values: TripPlanValues) =>
      apiRequest<{ id: string }>("/api/trips", {
        method: "POST",
        body: JSON.stringify({
          title: values.title,
          states: values.states,
          startDate: values.startDate
            ? format(values.startDate, "yyyy-MM-dd")
            : null,
          endDate: values.endDate ? format(values.endDate, "yyyy-MM-dd") : null,
          startTime: values.startTime || null,
          endTime: values.endTime || null,
          description: `${values.style}. Travelling: ${values.travellers.toLowerCase()}. Interests: ${values.interests.join(", ") || "open to exploring"}.`,
          stops: [],
        }),
      }),
    onSuccess: async ({ id }) => {
      await queryClient.invalidateQueries({ queryKey: ["trips"] });
      onCreated(id);
    },
  });
  return { statesQuery, createTrip };
}
