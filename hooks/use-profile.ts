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
      await queryClient.invalidateQueries({ queryKey: ["trips"] });
      onUpdated?.();
    },
  });
  return { profileQuery, updateProfile };
}
