"use client";

import { LoadingBlock } from "@/components/loading-skeletons";
import { PasswordFields } from "@/components/password-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useManagedAccount,
  useManagedAccounts,
} from "@/hooks/use-managed-accounts";
import {
  adminAccountCreateSchema,
  adminAccountEditSchema,
} from "@/lib/schemas";
import type {
  AddAccountDialogProps,
  AdminAccountCreateValues,
  AdminAccountEditValues,
  EditAccountDialogProps,
} from "@/lib/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export function AddAccountDialog({ role }: AddAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const { create } = useManagedAccounts();
  const form = useForm<AdminAccountCreateValues>({
    resolver: zodResolver(adminAccountCreateSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role,
    },
  });
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!create.isPending) {
          setOpen(value);
          if (value) {
            form.reset({
              displayName: "",
              email: "",
              password: "",
              confirmPassword: "",
              role,
            });
            create.reset();
          }
        }
      }}
    >
      <DialogTrigger render={<Button className="rounded-full" />}>
        <UserPlus className="size-4" />
        {role === "admin" ? "Add admin" : "Add client"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {role === "admin" ? "Add admin" : "Add client"}
          </DialogTitle>
          <DialogDescription>
            Create a login account with {role} access.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit((values) =>
            create.mutate(values, { onSuccess: () => setOpen(false) }),
          )}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor={"new-name-" + role}>Name</Label>
            <Input
              aria-invalid={Boolean(form.formState.errors.displayName)}
              id={"new-name-" + role}
              maxLength={60}
              disabled={create.isPending}
              {...form.register("displayName")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={"new-email-" + role}>Email</Label>
            <Input
              aria-invalid={Boolean(form.formState.errors.email)}
              id={"new-email-" + role}
              type="email"
              autoComplete="off"
              disabled={create.isPending}
              {...form.register("email")}
            />
          </div>
          <PasswordFields
            idPrefix={"new-account-" + role}
            password={form.register("password")}
            confirmation={form.register("confirmPassword")}
            passwordError={form.formState.errors.password?.message}
            confirmError={form.formState.errors.confirmPassword?.message}
            passwordLabel="Password"
            confirmLabel="Confirm password"
            disabled={create.isPending}
          />
          {Object.entries(form.formState.errors)
            .filter(([key]) => key !== "password" && key !== "confirmPassword")
            .map(([key, error]) => (
              <FieldError
                key={key}
                role="alert"
                className="text-sm text-destructive"
              >
                {error.message}
              </FieldError>
            ))}
          {create.error && (
            <FieldError role="alert" className="text-sm text-destructive">
              {create.error.message}
            </FieldError>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Creating…" : "Create account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditAccountDialog({ account }: EditAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const { edit } = useManagedAccounts();
  const details = useManagedAccount(account.id, open);
  const defaults = {
    displayName: account.display_name,
    email: "",
    password: "",
    confirmPassword: "",
  };
  const form = useForm<AdminAccountEditValues>({
    resolver: zodResolver(adminAccountEditSchema),
    defaultValues: defaults,
  });
  useEffect(() => {
    if (open && details.data && !form.getFieldState("email").isDirty) {
      form.setValue("email", details.data.email);
    }
  }, [open, details.data, form]);
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!edit.isPending) {
          setOpen(value);
          if (value) {
            form.reset(defaults);
            edit.reset();
          }
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-brand-blue"
            aria-label={"Edit " + account.display_name}
          />
        }
      >
        <Pencil className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit account</DialogTitle>
          <DialogDescription>
            Update account details. The role stays{" "}
            {account.role === "master_admin" ? "Master admin" : account.role}.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit((values) =>
            edit.mutate(
              { id: account.id, values },
              { onSuccess: () => setOpen(false) },
            ),
          )}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor={"edit-name-" + account.id}>User name</Label>
            <Input
              aria-invalid={Boolean(form.formState.errors.displayName)}
              id={"edit-name-" + account.id}
              maxLength={60}
              disabled={edit.isPending}
              {...form.register("displayName")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={"edit-email-" + account.id}>Email</Label>
            {details.isPending ? (
              <LoadingBlock label="Loading login details">
                <Skeleton className="h-10 w-full rounded-md" />
              </LoadingBlock>
            ) : (
              <Input
                aria-invalid={Boolean(form.formState.errors.email)}
                id={"edit-email-" + account.id}
                type="email"
                autoComplete="off"
                disabled={edit.isPending || details.isPending}
                {...form.register("email")}
              />
            )}
          </div>
          <PasswordFields
            idPrefix={"edit-account-" + account.id}
            password={form.register("password")}
            confirmation={form.register("confirmPassword")}
            passwordError={form.formState.errors.password?.message}
            confirmError={form.formState.errors.confirmPassword?.message}
            description="Leave blank to keep the current password. New passwords need at least 8 characters."
            disabled={edit.isPending}
          />
          {details.error && (
            <FieldError role="alert" className="text-sm text-destructive">
              {details.error.message}
            </FieldError>
          )}
          {Object.entries(form.formState.errors)
            .filter(([key]) => key !== "password" && key !== "confirmPassword")
            .map(([key, error]) => (
              <FieldError
                key={key}
                role="alert"
                className="text-sm text-destructive"
              >
                {error.message}
              </FieldError>
            ))}
          {edit.error && (
            <FieldError role="alert" className="text-sm text-destructive">
              {edit.error.message}
            </FieldError>
          )}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                edit.isPending || details.isPending || Boolean(details.error)
              }
            >
              {edit.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
