"use client";

import { apiRequest } from "@/lib/api";
import { invalidateQueryKeys, refreshTripQueries } from "@/lib/query-cache";
import { queryKeys } from "@/lib/query-keys";
import type {
  CommentValues,
  PaginationMeta,
  TripCommentResponse,
  TripCommentsData,
} from "@/lib/type";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export function useTripComments(tripSlug: string, page = 1) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.tripComments.forTrip(tripSlug);
  const commentsQuery = useQuery({
    queryKey: queryKeys.tripComments.page(tripSlug, page),
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      apiRequest<PaginationMeta & TripCommentsData>(
        `/api/trips/${tripSlug}/comments?page=${page}`,
        { signal },
      ),
  });
  const postComment = useMutation({
    mutationFn: (values: CommentValues) =>
      apiRequest<TripCommentResponse>(`/api/trips/${tripSlug}/comments`, {
        method: "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: async () => {
      await Promise.all([
        refreshTripQueries(queryClient, tripSlug),
        invalidateQueryKeys(queryClient, [queryKey]),
      ]);
    },
  });
  return { commentsQuery, postComment };
}
