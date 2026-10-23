"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { profileSchema } from "@/lib/schemas";
import { useProfile } from "@/hooks/use-profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Values = z.infer<typeof profileSchema>;
const blank: Values = { displayName: "", avatarUrl: "", bio: "" };

export default function AdminProfilePage() {
  const { profileQuery, updateProfile } = useProfile();
  const form = useForm<Values>({
    resolver: zodResolver(profileSchema),
    defaultValues: blank,
  });
  useEffect(() => {
    if (profileQuery.data?.profile) {
      const profile = profileQuery.data.profile;
      form.reset({
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url ?? "",
        bio: profile.bio ?? "",
      });
    }
  }, [form, profileQuery.data]);

  const displayName =
    useWatch({ control: form.control, name: "displayName" }) ||
    profileQuery.data?.profile.display_name ||
    "Administrator";
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Badge
          variant="outline"
          className="w-fit rounded-full border-brand-line bg-white text-brand-blue"
        >
          Account
        </Badge>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
          Admin profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your administrator account details.
        </p>
      </header>
      <Card className="overflow-hidden rounded-2xl border-brand-line bg-white shadow-none">
        <div className="h-28 bg-brand-blue-soft" />
        <CardContent className="flex items-end gap-4 p-5 sm:px-7 sm:pb-7">
          <div className="-mt-12 grid size-20 shrink-0 place-items-center rounded-2xl border-4 border-white bg-brand-blue text-2xl font-semibold text-white">
            {initials}
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">{displayName}</h2>
            <p className="text-sm text-muted-foreground">
              Signed-in administrator
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl border-brand-line bg-white shadow-none">
        <CardContent className="flex flex-col gap-6 p-5 sm:p-7">
          <div>
            <h2 className="text-lg font-semibold">Personal details</h2>
            <p className="text-sm text-muted-foreground">
              These details are shown on your profile and shared trips.
            </p>
          </div>
          {profileQuery.isPending ? (
            <p className="text-sm text-muted-foreground">Loading profile…</p>
          ) : profileQuery.error ? (
            <p role="alert" className="text-sm text-destructive">
              {profileQuery.error.message}
            </p>
          ) : (
            <form
              onSubmit={form.handleSubmit((values) =>
                updateProfile.mutate(values),
              )}
              className="grid gap-5 sm:grid-cols-2"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="admin-name">Display name</Label>
                <Input
                  id="admin-name"
                  {...form.register("displayName")}
                  className="h-11 rounded-xl border-brand-line"
                />
                {form.formState.errors.displayName && (
                  <span className="text-xs text-destructive">
                    {form.formState.errors.displayName.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="admin-avatar">Avatar image URL</Label>
                <Input
                  id="admin-avatar"
                  type="url"
                  {...form.register("avatarUrl")}
                  className="h-11 rounded-xl border-brand-line"
                />
                {form.formState.errors.avatarUrl && (
                  <span className="text-xs text-destructive">
                    {form.formState.errors.avatarUrl.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="admin-bio">Bio</Label>
                <Textarea id="admin-bio" {...form.register("bio")} />
                {form.formState.errors.bio && (
                  <span className="text-xs text-destructive">
                    {form.formState.errors.bio.message}
                  </span>
                )}
              </div>
              {updateProfile.error && (
                <p
                  role="alert"
                  className="text-sm text-destructive sm:col-span-2"
                >
                  {updateProfile.error.message}
                </p>
              )}
              <div className="flex justify-end border-t border-brand-line pt-5 sm:col-span-2">
                <Button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="h-10 rounded-full bg-brand-blue px-5 text-white hover:bg-brand-blue-hover"
                >
                  {updateProfile.isPending ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
