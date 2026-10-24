"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ArrowRight, CalendarDays, Check, Pencil, Route } from "lucide-react";
import { ItineraryCard } from "@/components/itinerary-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TravelerProfile } from "@/lib/type";
import { getInitials } from "@/lib/utils";
import { profileSchema } from "@/lib/schemas";
import { useMyTrips } from "@/hooks/use-trips";
import { useProfile } from "@/hooks/use-profile";

type ProfileFormValues = z.infer<typeof profileSchema>;

const emptyProfile: TravelerProfile = {
  name: "Traveller",
  username: "",
  location: "Malaysia",
  bio: "",
  avatar: "",
  coverImage: "",
  joined: "",
  interests: [],
  tripsPlanned: 0,
  tripsShared: 0,
  placesExplored: 0,
};

export function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const { profileQuery, updateProfile, uploadAvatar } = useProfile(() =>
    setEditing(false),
  );
  const tripsQuery = useMyTrips(true, { pageSize: 3 });
  const profile = useMemo(() => {
    const record = profileQuery.data?.profile;
    return record
      ? {
          ...emptyProfile,
          name: record.display_name || "Traveller",
          avatar: record.avatar_url || "",
          bio: record.bio || "",
          joined: record.created_at
            ? new Date(record.created_at).getFullYear().toString()
            : "",
        }
      : emptyProfile;
  }, [profileQuery.data]);
  const myTrips = tripsQuery.data?.trips ?? [];
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: "", avatarUrl: "", bio: "" },
  });
  const avatarUrl = useWatch({ control: form.control, name: "avatarUrl" });
  const bio = useWatch({ control: form.control, name: "bio" });
  function cancelEdit() {
    form.reset({
      displayName: profile.name,
      avatarUrl: profile.avatar,
      bio: profile.bio,
    });
    setEditing(false);
  }

  const initials = getInitials(profile.name);
  const loading = profileQuery.isPending || tripsQuery.isPending;
  const error =
    profileQuery.error?.message ||
    tripsQuery.error?.message ||
    updateProfile.error?.message ||
    uploadAvatar.error?.message;

  return (
    <div className="flex w-full flex-col gap-8 py-10 sm:gap-10 sm:py-14">
      {/* Profile page heading */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2">
          <Badge
            variant="outline"
            className="w-fit rounded-full border-brand-line bg-white px-3 py-1 text-brand-blue"
          >
            Your MYTOUR space
          </Badge>
          <h1 className="text-4xl font-medium tracking-[-0.06em] sm:text-5xl">
            Your <span className="text-brand-red">profile.</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Keep your travel story and favourite trips in one place.
          </p>
        </div>
        {!editing && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-10 rounded-full border-brand-line bg-white px-4"
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
              <Pencil className="size-4" /> Edit profile
            </Button>
          </div>
        )}
      </header>

      {/* Profile details and travel summary share a row. */}
      <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(17rem,1fr)]">
        {/* Profile identity card */}
        <Card className="h-full overflow-hidden rounded-[26px] border-brand-line bg-white p-0 shadow-sm">
          <CardContent className="flex h-full flex-col gap-5 p-5 sm:p-7">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <Avatar className="size-36 shrink-0 border-4 border-white ring-2 ring-brand-blue-soft sm:size-48">
                <AvatarImage
                  src={editing ? avatarUrl || profile.avatar : profile.avatar}
                  alt={profile.name}
                />
                <AvatarFallback className="bg-brand-yellow-soft text-4xl font-semibold text-brand-red-deep sm:text-5xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col gap-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {profile.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  MYTOUR traveller
                </p>
              </div>
            </div>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="size-4" /> Member since {profile.joined}
            </p>
            {profile.bio && (
              <div className="flex flex-col gap-2 border-t border-brand-line pt-4">
                <h3 className="text-sm font-semibold">Bio</h3>
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                  {profile.bio}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="h-full rounded-[24px] border-brand-line bg-white shadow-sm">
          <CardContent className="flex flex-col gap-5 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Travel so far</h2>
              <Route className="size-4 text-brand-blue" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col gap-1 rounded-xl bg-brand-surface-muted p-3">
                <span className="text-xl font-semibold">
                  {tripsQuery.data?.stats?.planned ?? 0}
                </span>
                <span className="text-[10px] text-muted-foreground">trips</span>
              </div>
              <div className="flex flex-col gap-1 rounded-xl bg-brand-surface-muted p-3">
                <span className="text-xl font-semibold">
                  {tripsQuery.data?.stats?.shared ?? 0}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  shared
                </span>
              </div>
              <div className="flex flex-col gap-1 rounded-xl bg-brand-surface-muted p-3">
                <span className="text-xl font-semibold">
                  {tripsQuery.data?.stats?.places ?? 0}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  places
                </span>
              </div>
            </div>
            <Button
              nativeButton={false}
              render={<Link href="/explore" />}
              variant="outline"
              className="h-10 rounded-full border-brand-line bg-white text-brand-blue"
            >
              Explore itineraries <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {updateProfile.isSuccess && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl border border-brand-blue-soft bg-brand-blue-soft px-4 py-3 text-sm text-brand-blue"
        >
          <Check className="size-4" /> Profile changes saved.
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {/* Editable profile information */}
      {editing ? (
        <Card className="rounded-[24px] border-brand-line bg-white shadow-sm">
          <CardContent className="p-5 sm:p-7">
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
                    id="profile-name"
                    {...form.register("displayName")}
                    maxLength={60}
                    required
                    className="h-11 rounded-xl border-brand-line px-3"
                  />
                  {form.formState.errors.displayName && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.displayName.message}
                    </p>
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
                    <p className="text-xs text-destructive">
                      {form.formState.errors.bio.message}
                    </p>
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
        <div className="flex flex-col gap-6">
          {/* Recent trips span the full width below the summary. */}
          <section className="flex flex-col gap-4" aria-label="Recent trips">
            <div className="flex items-end justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold tracking-tight">
                  Recent trips
                </h2>
                <p className="text-sm text-muted-foreground">
                  A few routes from your travel notebook.
                </p>
              </div>
              <Link
                href="/trips"
                className="flex shrink-0 items-center gap-1 text-sm font-medium text-brand-blue hover:underline"
              >
                See all <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {myTrips.slice(0, 3).map((trip) => (
                <ItineraryCard
                  key={trip.slug}
                  itinerary={trip}
                  showAuthor={false}
                />
              ))}
            </div>
            {loading && (
              <p className="text-sm text-muted-foreground">
                Loading your trips…
              </p>
            )}
            {!loading && !myTrips.length && (
              <p className="rounded-xl border border-dashed border-brand-line p-6 text-sm text-muted-foreground">
                You have not planned a trip yet.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
