"use client";

import { useMutation } from "@tanstack/react-query";
import type { z } from "zod";
import { apiRequest } from "@/lib/api";
import { createAuthFormSchema } from "@/lib/schemas";

type AuthValues = z.infer<ReturnType<typeof createAuthFormSchema>>;

export function useAuth(mode: "login" | "signup", onSuccess: () => void) {
  return useMutation({
    mutationFn: (values: AuthValues) =>
      apiRequest(mode === "signup" ? "/api/auth/signup" : "/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: values.email.trim(),
          password: values.password,
          ...(mode === "signup" ? { name: values.name.trim() } : {}),
        }),
      }),
    onSuccess,
  });
}
