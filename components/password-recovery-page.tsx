"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { forgotPasswordSchema } from "@/lib/schemas";
import { usePasswordResetRequest } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordRecoveryPage() {
  const requestReset = usePasswordResetRequest();
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });
  return (
    <div className="flex w-full justify-center py-10 sm:py-16">
      <Card className="w-full max-w-md rounded-3xl border-brand-line bg-white">
        {/* Administrator-assisted password recovery */}
        <CardHeader>
          <CardTitle className="text-2xl">Forgot your password?</CardTitle>
          <CardDescription>
            Enter your account email to ask an administrator to reset your
            password.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {requestReset.isSuccess ? (
            <p
              role="status"
              className="rounded-xl bg-brand-blue-soft p-4 text-sm text-brand-blue"
            >
              {requestReset.data.message}
            </p>
          ) : (
            <form
              className="flex flex-col gap-4"
              onSubmit={form.handleSubmit((values) =>
                requestReset.mutate(values),
              )}
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="recovery-email">Email address</Label>
                <Input
                  id="recovery-email"
                  type="email"
                  autoComplete="email"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={requestReset.isPending}>
                {requestReset.isPending
                  ? "Submitting…"
                  : "Request password reset"}
              </Button>
            </form>
          )}
          {requestReset.error && (
            <p role="alert" className="text-sm text-destructive">
              {requestReset.error.message}
            </p>
          )}
          <Link
            href="/login"
            className="text-center text-sm font-medium text-brand-blue hover:underline"
          >
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
