"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { z } from "zod";
import { apiRequest } from "@/lib/api";
import { commentSchema } from "@/lib/schemas";
import type { TripComment, PaginationMeta } from "@/lib/type";

export type CommentValues = z.infer<typeof commentSchema>;

export function useTripComments(tripSlug: string, page = 1) {
  const queryClient = useQueryClient();
  const queryKey = ["trip-comments", tripSlug];
  const commentsQuery = useQuery({
    queryKey: [...queryKey, page],
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      apiRequest<PaginationMeta & { comments: TripComment[] }>(
        `/api/trips/${tripSlug}/comments?page=${page}`,
        { signal },
      ),
  });
  const postComment = useMutation({
    mutationFn: (values: CommentValues) =>
      apiRequest<{ comment: TripComment }>(`/api/trips/${tripSlug}/comments`, {
        method: "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        queryClient.invalidateQueries({ queryKey: ["trips"] }),
        queryClient.invalidateQueries({ queryKey: ["trip", tripSlug] }),
      ]);
    },
  });
  return { commentsQuery, postComment };
}
