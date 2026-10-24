"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { z } from "zod";
import { apiRequest } from "@/lib/api";
import { createAuthFormSchema } from "@/lib/schemas";

type AuthValues = z.infer<ReturnType<typeof createAuthFormSchema>>;

export function useAuth(
  mode: "login" | "signup",
  onSuccess: (redirectTo: string) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: AuthValues) =>
      apiRequest<{ redirectTo?: string }>(
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
      queryClient.setQueryData(["profile"], { profile: null });
      onSuccess();
    },
  });
}

// Password reset requests are reviewed by an administrator.
export function usePasswordResetRequest() {
  return useMutation({
    mutationFn: (values: { email: string }) =>
      apiRequest<{ message: string }>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(values),
      }),
  });
}
