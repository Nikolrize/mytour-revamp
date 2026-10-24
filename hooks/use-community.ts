"use client";

import {
  useInfiniteQuery,
  useQuery,
  keepPreviousData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type {
  CommunityPost,
  CommunityComment,
  PaginationMeta,
} from "@/lib/type";
import type { z } from "zod";
import type { communityPostSchema, contentReportSchema } from "@/lib/schemas";

type Page<T> = { nextPage: number | null } & T;
export function useCommunityPosts({
  search = "",
  kind = "all",
  sort = "newest",
  postId = "",
  page = 1,
}: {
  search?: string;
  kind?: string;
  sort?: string;
  postId?: string;
  page?: number;
} = {}) {
  return useQuery({
    queryKey: ["community-posts", { search, kind, sort, postId, page }],
    queryFn: ({ signal }) =>
      apiRequest<PaginationMeta & { posts: CommunityPost[] }>(
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
    mutationFn: ({
      values,
      photos,
    }: {
      values: z.output<typeof communityPostSchema>;
      photos: File[];
    }) => {
      const body = new FormData();
      body.set("content", values.content);
      body.set("tripId", values.tripId);
      photos.forEach((photo) => body.append("photos", photo));
      return apiRequest<{ id: string }>("/api/community/posts", {
        method: "POST",
        body,
      });
    },
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: ["public-profile"] }),
        client.invalidateQueries({ queryKey: ["community-posts"] }),
        client.invalidateQueries({ queryKey: ["admin", "overview"] }),
      ]),
  });
}
export function useCommunityPostActions(postId: string) {
  const client = useQueryClient();
  const refresh = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: ["public-profile"] }),
        client.invalidateQueries({ queryKey: ["community-posts"] }),
      client.invalidateQueries({ queryKey: ["admin", "overview"] }),
    ]);
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
      client.removeQueries({ queryKey: ["community-comments", postId] });
      await refresh();
      await client.invalidateQueries({ queryKey: ["admin", "reports"] });
    },
  });
  return { like, remove };
}
export function useCommunityComments(postId: string) {
  const client = useQueryClient();
  const queryKey = ["community-comments", postId];
  const query = useInfiniteQuery({
    queryKey,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      apiRequest<Page<{ comments: CommunityComment[] }>>(
        `/api/community/posts/${postId}/comments?page=${pageParam}`,
      ),
    getNextPageParam: (page) => page.nextPage ?? undefined,
  });
  const refresh = () =>
    Promise.all([
      client.invalidateQueries({ queryKey }),
      client.invalidateQueries({ queryKey: ["public-profile"] }),
        client.invalidateQueries({ queryKey: ["community-posts"] }),
    ]);
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
    mutationFn: (values: z.infer<typeof contentReportSchema>) =>
      apiRequest("/api/community/posts/" + postId + "/report", {
        method: "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: ["admin", "reports"] }),
        client.invalidateQueries({ queryKey: ["admin", "overview"] }),
      ]),
  });
}
