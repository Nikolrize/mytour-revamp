"use client";

import { apiRequest } from "@/lib/api";
import {
  refreshCommunityQueries,
  refreshModerationQueries,
} from "@/lib/query-cache";
import { queryKeys } from "@/lib/query-keys";
import type {
  CommunityCommentsData,
  CommunityPageOptions,
  CommunityPostsData,
  ContentReportValues,
  CreateCommunityPostValues,
  CreatedRecordResponse,
  CursorPage,
  PaginationMeta,
} from "@/lib/type";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export function useCommunityPosts({
  search = "",
  kind = "all",
  sort = "newest",
  postId = "",
  page = 1,
}: CommunityPageOptions = {}) {
  return useQuery({
    queryKey: queryKeys.communityPosts.page({
      search,
      kind,
      sort,
      postId,
      page,
    }),
    queryFn: ({ signal }) =>
      apiRequest<PaginationMeta & CommunityPostsData>(
        "/api/community/posts?" +
          new URLSearchParams({
            page: String(page),
            search,
            kind,
            sort,
            ...(postId ? { postId } : {}),
          }),
        { signal },
      ),
    placeholderData: keepPreviousData,
  });
}
export function useCreateCommunityPost() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ values, photos }: CreateCommunityPostValues) => {
      const body = new FormData();
      body.set("content", values.content);
      body.set("tripId", values.tripId);
      photos.forEach((photo) => body.append("photos", photo));
      return apiRequest<CreatedRecordResponse>("/api/community/posts", {
        method: "POST",
        body,
      });
    },
    onSuccess: () => refreshCommunityQueries(client),
  });
}
export function useCommunityPostActions(postId: string) {
  const client = useQueryClient();
  const refresh = () => refreshCommunityQueries(client);
  const like = useMutation({
    mutationFn: (liked: boolean) =>
      apiRequest(`/api/community/posts/${postId}/like`, {
        method: liked ? "POST" : "DELETE",
      }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: () =>
      apiRequest(`/api/community/posts/${postId}`, { method: "DELETE" }),
    onSuccess: async () => {
      client.removeQueries({
        queryKey: queryKeys.communityComments.forPost(postId),
      });
      await refresh();
    },
  });
  return { like, remove };
}
export function useCommunityComments(postId: string) {
  const client = useQueryClient();
  const queryKey = queryKeys.communityComments.forPost(postId);
  const query = useInfiniteQuery({
    queryKey,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      apiRequest<CursorPage<CommunityCommentsData>>(
        `/api/community/posts/${postId}/comments?page=${pageParam}`,
        { signal },
      ),
    getNextPageParam: (page) => page.nextPage ?? undefined,
  });
  const refresh = () => refreshCommunityQueries(client, postId);
  const create = useMutation({
    mutationFn: (content: string) =>
      apiRequest(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (commentId: string) =>
      apiRequest(`/api/community/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
      }),
    onSuccess: refresh,
  });
  return { query, create, remove };
}

export function useReportCommunityPost(postId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (values: ContentReportValues) =>
      apiRequest("/api/community/posts/" + postId + "/report", {
        method: "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: () => refreshModerationQueries(client),
  });
}
