"use client";

import { apiRequest } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type {
  AuthResponse,
  AuthValues,
  ForgotPasswordValues,
  MessageResponse,
  ProfileResponse,
} from "@/lib/type";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAuth(
  mode: "login" | "signup",
  onSuccess: (redirectTo: string) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: AuthValues) =>
      apiRequest<AuthResponse>(
        mode === "signup" ? "/api/auth/signup" : "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email: values.email.trim(),
            password: values.password,
            ...(mode === "signup" ? { name: values.name.trim() } : {}),
          }),
        },
      ),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries();
      onSuccess(result.redirectTo === "/admin" ? "/admin" : "/trips");
    },
  });
}

export function useSignOut(onSuccess: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest("/api/auth/signout", { method: "POST" }),
    onSuccess: async () => {
      await queryClient.cancelQueries();
      queryClient.clear();
      queryClient.setQueryData<ProfileResponse>(queryKeys.profile, {
        profile: null,
      });
      onSuccess();
    },
  });
}

// Password reset requests are reviewed by an administrator.
export function usePasswordResetRequest() {
  return useMutation({
    mutationFn: (values: ForgotPasswordValues) =>
      apiRequest<MessageResponse>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(values),
      }),
  });
}
