"use client";

import { ChangePasswordDialog } from "@/components/change-password-dialog";
import { ProfileLoadingSkeleton } from "@/components/loading-skeletons";
import { ProfileActivity } from "@/components/profile-activity";
import { ProfileStats } from "@/components/profile-stats";
import { TravellerProfileCard } from "@/components/traveller-profile-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfile } from "@/hooks/use-profile";
import { usePublicProfile } from "@/hooks/use-public-profile";
import { useMyTrips } from "@/hooks/use-trips";
import { profileSchema } from "@/lib/schemas";
import type { ProfileActivityKind, ProfileValues } from "@/lib/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Pencil } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [kind, setKind] = useState<ProfileActivityKind>("recent");
  const [page, setPage] = useState(1);
  const { profileQuery, updateProfile, uploadAvatar } = useProfile(() =>
    setEditing(false),
  );
  const tripsQuery = useMyTrips(true, {
    pageSize: kind === "recent" ? 12 : 1,
    page: kind === "recent" ? page : 1,
  });
  const record = profileQuery.data?.profile;
  const activity = usePublicProfile(
    record?.id ?? "",
    kind === "posts" ? "posts" : "trips",
    page,
    Boolean(record?.id) && kind !== "recent",
  );
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: "", avatarUrl: "", bio: "" },
  });
  const avatarUrl = useWatch({ control: form.control, name: "avatarUrl" });
  const bio = useWatch({ control: form.control, name: "bio" });
  const profile = {
    name: record?.display_name ?? "",
    avatar: record?.avatar_url ?? "",
    bio: record?.bio ?? "",
  };
  function cancelEdit() {
    form.reset({
      displayName: profile.name,
      avatarUrl: profile.avatar,
      bio: profile.bio,
    });
    setEditing(false);
  }
  const error =
    profileQuery.error?.message ||
    tripsQuery.error?.message ||
    updateProfile.error?.message ||
    uploadAvatar.error?.message;
  if (profileQuery.isPending || tripsQuery.isPending)
    return <ProfileLoadingSkeleton />;
  if (!record)
    return (
      <FieldError role="alert" className="py-10 text-sm text-destructive">
        {error || "Could not load your profile."}
      </FieldError>
    );
  return (
    <div className="flex w-full flex-col gap-8 py-10 sm:py-14">
      {/* Personal identity uses the same layout as public traveller profiles. */}
      <TravellerProfileCard
        name={profile.name}
        avatar={editing ? avatarUrl || profile.avatar : profile.avatar}
        bio={profile.bio}
        createdAt={record.created_at}
        action={
          !editing && (
            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  form.reset({
                    displayName: profile.name,
                    avatarUrl: profile.avatar,
                    bio: profile.bio,
                  });
                  updateProfile.reset();
                  uploadAvatar.reset();
                  setEditing(true);
                }}
              >
                <Pencil className="size-4" />
                Edit profile
              </Button>
              <ChangePasswordDialog />
            </div>
          )
        }
      >
        {/* Personal statistics include your private trips; public profiles do not. */}
        <ProfileStats
          items={[
            {
              label: "Trips planned",
              value: tripsQuery.data?.stats?.planned ?? 0,
            },
            {
              label: "Shared itineraries",
              value: tripsQuery.data?.stats?.shared ?? 0,
            },
            {
              label: "Places explored",
              value: tripsQuery.data?.stats?.places ?? 0,
            },
          ]}
        />
      </TravellerProfileCard>
      {updateProfile.isSuccess && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl bg-brand-blue-soft px-4 py-3 text-sm text-brand-blue"
        >
          <Check className="size-4" />
          Profile changes saved.
        </p>
      )}
      {error && (
        <FieldError
          role="alert"
          className="rounded-xl border border-destructive/30 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </FieldError>
      )}
      {/* The editor retains photo upload, validation, save and cancel actions. */}
      {editing ? (
        <Card className="rounded-[24px] border-brand-line bg-white shadow-sm">
          <CardContent className="flex flex-col gap-6 p-5 sm:p-7">
            <form
              onSubmit={form.handleSubmit((values) =>
                updateProfile.mutate(values),
              )}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold tracking-tight">
                  Edit your profile
                </h2>
                <p className="text-sm text-muted-foreground">
                  Add the details you want other travellers to see.
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="profile-name">Name</Label>
                  <Input
                    aria-invalid={Boolean(form.formState.errors.displayName)}
                    aria-describedby={
                      form.formState.errors.displayName
                        ? "profile-name-error"
                        : undefined
                    }
                    id="profile-name"
                    {...form.register("displayName")}
                    maxLength={60}
                    required
                    className="h-11 rounded-xl border-brand-line px-3"
                  />
                  {form.formState.errors.displayName && (
                    <FieldError
                      id={"profile-name-error"}
                      className="text-xs text-destructive"
                    >
                      {form.formState.errors.displayName.message}
                    </FieldError>
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="profile-avatar">Profile photo</Label>
                  <Input
                    id="profile-avatar"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploadAvatar.isPending || updateProfile.isPending}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (file)
                        uploadAvatar.mutate(file, {
                          onSuccess: ({ avatarUrl }) =>
                            form.setValue("avatarUrl", avatarUrl, {
                              shouldDirty: true,
                              shouldValidate: true,
                            }),
                        });
                    }}
                    className="rounded-xl border-brand-line"
                  />
                  <p className="text-xs text-muted-foreground">
                    {uploadAvatar.isPending
                      ? "Uploading photo…"
                      : "JPG, PNG, or WebP, up to 2 MB. Save your profile to apply the photo."}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="profile-bio">Bio</Label>
                  <Textarea
                    aria-invalid={Boolean(form.formState.errors.bio)}
                    aria-describedby={
                      form.formState.errors.bio
                        ? "profile-bio-error"
                        : undefined
                    }
                    id="profile-bio"
                    {...form.register("bio")}
                    maxLength={240}
                    rows={3}
                    className="rounded-xl border-brand-line px-3"
                    placeholder="What do you love about travelling?"
                  />
                  <p className="text-right text-xs text-muted-foreground">
                    {(bio ?? "").length}/240
                  </p>
                  {form.formState.errors.bio && (
                    <FieldError
                      id={"profile-bio-error"}
                      className="text-xs text-destructive"
                    >
                      {form.formState.errors.bio.message}
                    </FieldError>
                  )}
                </div>
              </div>
              <div className="flex flex-col-reverse gap-2 border-t border-brand-line pt-5 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadAvatar.isPending || updateProfile.isPending}
                  onClick={cancelEdit}
                  className="h-10 rounded-full border-brand-line bg-white px-5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateProfile.isPending || uploadAvatar.isPending}
                  className="h-10 rounded-full bg-brand-blue px-5 text-white hover:bg-brand-blue-hover"
                >
                  <Check className="size-4" />{" "}
                  {updateProfile.isPending ? "Saving…" : "Save profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <ProfileActivity
          kind={kind}
          onKindChange={(value) => {
            setKind(value);
            setPage(1);
          }}
          page={page}
          onPageChange={setPage}
          data={activity.data}
          recentData={tripsQuery.data}
          includeRecent
          pending={
            kind === "recent" ? tripsQuery.isPending : activity.isPending
          }
          fetching={
            kind === "recent" ? tripsQuery.isFetching : activity.isFetching
          }
          error={kind === "recent" ? tripsQuery.error : activity.error}
        />
      )}
    </div>
  );
}
