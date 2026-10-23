"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { z } from "zod";
import { apiRequest } from "@/lib/api";
import { profileSchema } from "@/lib/schemas";

export type ProfileValues = z.infer<typeof profileSchema>;
export type ProfileRecord = {
  id?: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at?: string;
};

export function useProfile(onUpdated?: () => void) {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ["profile"],
    retry: false,
    queryFn: () => apiRequest<{ profile: ProfileRecord }>("/api/profile"),
  });
  const updateProfile = useMutation({
    mutationFn: (values: ProfileValues) =>
      apiRequest<{ profile: ProfileRecord }>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({
          displayName: values.displayName,
          avatarUrl: values.avatarUrl || null,
          bio: values.bio,
        }),
      }),
    onSuccess: async (result) => {
      queryClient.setQueryData(["profile"], result);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["trips"] }),
        queryClient.invalidateQueries({ queryKey: ["community-posts"] }),
        queryClient.invalidateQueries({ queryKey: ["community-comments"] }),
      ]);
      onUpdated?.();
    },
  });
  const uploadAvatar = useMutation({
    mutationFn: async (photo: File) => {
      if (
        !photo.size ||
        photo.size > 2097152 ||
        !["image/jpeg", "image/png", "image/webp"].includes(photo.type)
      )
        throw new Error("Choose a JPG, PNG, or WebP photo up to 2 MB.");
      const body = new FormData();
      body.set("photo", photo);
      return apiRequest<{ avatarUrl: string }>("/api/profile/avatar", {
        method: "POST",
        body,
      });
    },
  });
  return { profileQuery, updateProfile, uploadAvatar };
}
