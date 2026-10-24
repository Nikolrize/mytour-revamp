"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePasswordResetRequest } from "@/hooks/use-auth";
import { forgotPasswordSchema } from "@/lib/schemas";
import type { ForgotPasswordValues } from "@/lib/type";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

export default function ForgotPasswordPage() {
  const requestReset = usePasswordResetRequest();
  const form = useForm<ForgotPasswordValues>({
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
                  aria-invalid={Boolean(form.formState.errors.email)}
                  aria-describedby={
                    form.formState.errors.email
                      ? "recovery-email-error"
                      : undefined
                  }
                  id="recovery-email"
                  type="email"
                  autoComplete="email"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <FieldError
                    id={"recovery-email-error"}
                    className="text-xs text-destructive"
                  >
                    {form.formState.errors.email.message}
                  </FieldError>
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
            <FieldError role="alert" className="text-sm text-destructive">
              {requestReset.error.message}
            </FieldError>
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
