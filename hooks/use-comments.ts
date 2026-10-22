"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { z } from "zod";
import { apiRequest } from "@/lib/api";
import { commentSchema } from "@/lib/schemas";
import type { TripComment } from "@/lib/type";

export type CommentValues = z.infer<typeof commentSchema>;

export function useTripComments(tripSlug: string) {
  const queryClient = useQueryClient();
  const queryKey = ["trip-comments", tripSlug];
  const commentsQuery = useQuery({
    queryKey,
    queryFn: () =>
      apiRequest<{ comments: TripComment[] }>(
        `/api/trips/${tripSlug}/comments`,
      ),
  });
  const postComment = useMutation({
    mutationFn: (values: CommentValues) =>
      apiRequest<{ comment: TripComment }>(`/api/trips/${tripSlug}/comments`, {
        method: "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: async ({ comment }) => {
      queryClient.setQueryData<{ comments: TripComment[] }>(
        queryKey,
        (current) => ({ comments: [comment, ...(current?.comments ?? [])] }),
      );
      await queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
  return { commentsQuery, postComment };
}
