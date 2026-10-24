"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Pencil, UserPlus } from "lucide-react";
import {
  adminAccountCreateSchema,
  adminAccountEditSchema,
} from "@/lib/schemas";
import type { ManagedAccount } from "@/lib/type";
import {
  useManagedAccounts,
  useManagedAccount,
} from "@/hooks/use-managed-accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function AddAccountDialog({ role }: { role: "admin" | "client" }) {
  const [open, setOpen] = useState(false);
  const { create } = useManagedAccounts();
  const form = useForm<z.infer<typeof adminAccountCreateSchema>>({
    resolver: zodResolver(adminAccountCreateSchema),
    defaultValues: { displayName: "", email: "", password: "", role },
  });
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!create.isPending) {
          setOpen(value);
          if (value) {
            form.reset({ displayName: "", email: "", password: "", role });
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
              id={"new-name-" + role}
              maxLength={60}
              disabled={create.isPending}
              {...form.register("displayName")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={"new-email-" + role}>Email</Label>
            <Input
              id={"new-email-" + role}
              type="email"
              autoComplete="off"
              disabled={create.isPending}
              {...form.register("email")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={"new-password-" + role}>Password</Label>
            <Input
              id={"new-password-" + role}
              type="password"
              autoComplete="new-password"
              disabled={create.isPending}
              {...form.register("password")}
            />
          </div>
          {Object.entries(form.formState.errors).map(([key, error]) => (
            <p key={key} role="alert" className="text-sm text-destructive">
              {error.message}
            </p>
          ))}
          {create.error && (
            <p role="alert" className="text-sm text-destructive">
              {create.error.message}
            </p>
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

export function EditAccountDialog({ account }: { account: ManagedAccount }) {
  const [open, setOpen] = useState(false);
  const { edit } = useManagedAccounts();
  const details = useManagedAccount(account.id, open);
  const defaults = {
    displayName: account.display_name,
    email: "",
    password: "",
    confirmPassword: "",
  };
  const form = useForm<z.infer<typeof adminAccountEditSchema>>({
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
              id={"edit-name-" + account.id}
              maxLength={60}
              disabled={edit.isPending}
              {...form.register("displayName")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={"edit-email-" + account.id}>Email</Label>
            <Input
              id={"edit-email-" + account.id}
              type="email"
              autoComplete="off"
              disabled={edit.isPending || details.isPending}
              {...form.register("email")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={"edit-password-" + account.id}>New password</Label>
            <Input
              id={"edit-password-" + account.id}
              type="password"
              autoComplete="new-password"
              disabled={edit.isPending}
              {...form.register("password")}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to keep the current password. New passwords need at
              least 8 characters.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={"edit-confirm-password-" + account.id}>
              Confirm new password
            </Label>
            <Input
              id={"edit-confirm-password-" + account.id}
              type="password"
              autoComplete="new-password"
              disabled={edit.isPending}
              {...form.register("confirmPassword")}
            />
          </div>
          {details.isPending && (
            <p className="text-sm text-muted-foreground">
              Loading login details…
            </p>
          )}
          {details.error && (
            <p role="alert" className="text-sm text-destructive">
              {details.error.message}
            </p>
          )}
          {Object.entries(form.formState.errors).map(([key, error]) => (
            <p key={key} role="alert" className="text-sm text-destructive">
              {error.message}
            </p>
          ))}
          {edit.error && (
            <p role="alert" className="text-sm text-destructive">
              {edit.error.message}
            </p>
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
