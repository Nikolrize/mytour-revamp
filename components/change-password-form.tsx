"use client";

import { PasswordFields } from "@/components/password-fields";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { useChangePassword } from "@/hooks/use-profile";
import { resetPasswordSchema } from "@/lib/schemas";
import type { ResetPasswordValues } from "@/lib/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Separate form avoids changing the password when saving normal profile details.
export function ChangePasswordForm() {
  const change = useChangePassword();
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit((values) =>
        change.mutate(values, { onSuccess: () => form.reset() }),
      )}
    >
      <PasswordFields
        idPrefix="profile"
        password={form.register("password")}
        confirmation={form.register("confirmPassword")}
        disabled={change.isPending}
        passwordError={form.formState.errors.password?.message}
        confirmError={form.formState.errors.confirmPassword?.message}
      />
      {change.error && (
        <FieldError role="alert" className="text-sm text-destructive">
          {change.error.message}
        </FieldError>
      )}
      {change.isSuccess && (
        <p role="status" className="text-sm text-brand-blue">
          {change.data.message}
        </p>
      )}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={change.isPending}
          className="rounded-full"
        >
          {change.isPending ? "Updating password…" : "Update password"}
        </Button>
      </div>
    </form>
  );
}
