"use client";

import { apiRequest } from "@/lib/api";
import { refreshProfileQueries } from "@/lib/query-cache";
import { queryKeys } from "@/lib/query-keys";
import type {
  AvatarUploadResponse,
  MessageResponse,
  ProfileResponse,
  ProfileValues,
  ResetPasswordValues,
} from "@/lib/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useProfile(onUpdated?: () => void) {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    retry: false,
    queryFn: ({ signal }) =>
      apiRequest<ProfileResponse>("/api/profile", { signal }),
  });
  const updateProfile = useMutation({
    mutationFn: (values: ProfileValues) =>
      apiRequest<ProfileResponse>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({
          displayName: values.displayName,
          avatarUrl: values.avatarUrl || null,
          bio: values.bio,
        }),
      }),
    onSuccess: async (result) => {
      queryClient.setQueryData(queryKeys.profile, result);
      await refreshProfileQueries(queryClient);
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
      return apiRequest<AvatarUploadResponse>("/api/profile/avatar", {
        method: "POST",
        body,
      });
    },
  });
  return { profileQuery, updateProfile, uploadAvatar };
}

// Password updates use their own action so saving a bio cannot change credentials.
export function useChangePassword() {
  return useMutation({
    mutationFn: (values: ResetPasswordValues) =>
      apiRequest<MessageResponse>("/api/profile/password", {
        method: "POST",
        body: JSON.stringify(values),
      }),
  });
}
