"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { resetPasswordSchema } from "@/lib/schemas";
import { useChangePassword } from "@/hooks/use-profile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Separate form avoids changing the password when saving normal profile details.
export function ChangePasswordForm() {
  const change = useChangePassword();
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver:zodResolver(resetPasswordSchema),defaultValues:{password:"",confirmPassword:""},
  });
  return <form className="flex flex-col gap-4" onSubmit={form.handleSubmit((values) => change.mutate(values,{onSuccess:() => form.reset()}))}>
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2"><Label htmlFor="profile-new-password">New password</Label><Input id="profile-new-password" type="password" autoComplete="new-password" maxLength={128} disabled={change.isPending} {...form.register("password")} aria-invalid={Boolean(form.formState.errors.password)} />
        {form.formState.errors.password && <p role="alert" className="text-xs text-destructive">{form.formState.errors.password.message}</p>}</div>
      <div className="flex flex-col gap-2"><Label htmlFor="profile-confirm-password">Confirm new password</Label><Input id="profile-confirm-password" type="password" autoComplete="new-password" maxLength={128} disabled={change.isPending} {...form.register("confirmPassword")} aria-invalid={Boolean(form.formState.errors.confirmPassword)} />
        {form.formState.errors.confirmPassword && <p role="alert" className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>}</div>
    </div>
    {change.error && <p role="alert" className="text-sm text-destructive">{change.error.message}</p>}
    {change.isSuccess && <p role="status" className="text-sm text-brand-blue">{change.data.message}</p>}
    <div className="flex justify-end"><Button type="submit" disabled={change.isPending} className="rounded-full">{change.isPending ? "Updating password…" : "Update password"}</Button></div>
  </form>;
}
