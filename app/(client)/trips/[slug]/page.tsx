"use client";

import { ConfirmAction } from "@/components/confirm-action";
import { TripStatusBadge } from "@/components/trip-status-badge";
import { TripStateCover } from "@/components/trip-state-cover";
import { TripTags } from "@/components/trip-tags";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Star,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TripComments } from "@/components/trip-comments";
import { getInitials } from "@/lib/utils";
import { useTripDetails } from "@/hooks/use-trip-details";
import { useSaveTrip, useUpdateTripVisibility } from "@/hooks/use-trips";
import { RouteMap } from "@/components/route-map";
import { TripStopEditor } from "@/components/trip-stop-editor";
import { TripActions } from "@/components/trip-actions";
import { TripStopManager } from "@/components/trip-stop-manager";
import { useTripStops } from "@/hooks/use-trip-stops";

export default function TripDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50svh] w-full items-center justify-center text-sm text-muted-foreground">
          Loading trip…
        </div>
      }
    >
      <TripDetailRoute />
    </Suspense>
  );
}

function TripDetailRoute() {
  const { slug } = useParams<{ slug: string }>();
  return <TripDetailContent key={slug} />;
}

function TripDetailContent() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { profileQuery } = useProfile();
  const signedIn = Boolean(profileQuery.data?.profile);
  const isAdmin =
    profileQuery.data?.profile?.role === "admin" ||
    profileQuery.data?.profile?.role === "master_admin";
  const tripQuery = useTripDetails(slug);
  const trip = tripQuery.data?.trip;
  const isOwner = tripQuery.data?.isOwner ?? false;
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const isEditing = isOwner && editingTripId === slug;
  const saved = useSaveTrip(
    slug,
    Boolean(signedIn && !isAdmin && trip && trip.isPublic && !isOwner),
  );
  const visibility = useUpdateTripVisibility(slug);
  const { remove } = useTripStops(slug, false);

  if (tripQuery.isPending) {
    return (
      <div className="flex min-h-[50svh] w-full items-center justify-center text-sm text-muted-foreground">
        Loading trip…
      </div>
    );
  }
  if (tripQuery.error || !trip) {
    return (
      <div className="flex min-h-[50svh] w-full flex-col items-center justify-center gap-3 text-center">
        <h1 className="text-2xl font-semibold">Trip not found</h1>
        <p className="text-sm text-muted-foreground">
          {tripQuery.error?.message ??
            "This trip may have been removed or is private."}
        </p>
        <Link
          href="/explore"
          className="text-sm font-medium text-brand-blue hover:underline"
        >
          Back to Explore
        </Link>
      </div>
    );
  }

  const groupedStops = trip.stops.reduce<Record<number, typeof trip.stops>>(
    (groups, stop) => {
      groups[stop.day] ??= [];
      groups[stop.day].push(stop);
      return groups;
    },
    {},
  );

  return (
    <div className="flex w-full flex-col gap-8 py-8 sm:gap-10 sm:py-12">
      {/* Trip detail heading */}
      <div className="flex flex-col gap-5">
        <Link
          href={
            isAdmin ? "/admin/trips" : trip.isPublic ? "/explore" : "/trips"
          }
          className="flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-blue"
        >
          <ArrowLeft className="size-4" /> Back to{" "}
          {isAdmin ? "Manage trips" : trip.isPublic ? "Explore" : "my trips"}
        </Link>
        <div className="relative flex min-h-[40svh] flex-col justify-end overflow-hidden rounded-[28px] bg-brand-blue-deep p-6 text-white sm:min-h-[46svh] sm:p-10">
          <TripStateCover trip={trip} />
          <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
          <div className="relative flex flex-col gap-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="flex max-w-2xl flex-col gap-2">
                <p className="flex items-center gap-1.5 text-sm text-white/75">
                  <MapPin className="size-4" /> {trip.location}, Malaysia
                </p>
                <h1 className="text-4xl font-medium tracking-[-0.06em] sm:text-6xl">
                  {trip.title}
                </h1>
                {trip.note && (
                  <p className="text-sm text-white/80 sm:text-base">
                    {trip.note}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {isOwner ? (
                  <ConfirmAction
                    title={
                      trip.isPublic
                        ? "Are you sure you want to make this trip private?"
                        : "Are you sure you want to publish this trip?"
                    }
                    description={
                      trip.isPublic
                        ? "This trip will disappear from Explore and will no longer be available through community post attachments."
                        : "Your itinerary and description will be visible in Explore. Other travellers can view, save, and copy it."
                    }
                    actionLabel={
                      trip.isPublic ? "Make private" : "Publish in Explore"
                    }
                    onConfirm={() => visibility.mutateAsync(!trip.isPublic)}
                    pending={visibility.isPending}
                    error={visibility.error?.message}
                    variant="default"
                    className="h-11 rounded-full bg-brand-yellow px-5 font-semibold text-foreground shadow-md hover:bg-brand-yellow-hover"
                  >
                    {trip.isPublic ? "Make private" : "Publish in Explore"}
                  </ConfirmAction>
                ) : trip.isPublic && !isAdmin ? (
                  <Button
                    variant="outline"
                    disabled={
                      profileQuery.isPending ||
                      (signedIn && saved.savedStatus.isPending) ||
                      saved.toggleSave.isPending
                    }
                    onClick={() =>
                      signedIn
                        ? saved.toggleSave.mutate()
                        : router.push("/login")
                    }
                    className="h-10 rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  >
                    {saved.toggleSave.isPending
                      ? saved.isSaved
                        ? "Removing…"
                        : "Saving…"
                      : saved.isSaved
                        ? "Saved"
                        : "Save trip"}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interest tags and editing controls share the toolbar. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
          aria-label="Trip interests"
        >
          <TripTags interests={trip.interests} limit={3} />
        </div>
        <div className="shrink-0">
          <TripActions
            key={slug}
            trip={trip}
            isOwner={isOwner}
            isEditing={isEditing}
            onEditingChange={(enabled) =>
              setEditingTripId(enabled ? slug : null)
            }
          />
        </div>
      </div>
      {isEditing && (
        <p
          role="status"
          className="rounded-xl bg-brand-blue-soft px-4 py-3 text-sm text-brand-blue"
        >
          Editing trip. Save each change with its action button, then choose
          Done editing to return to view mode.
        </p>
      )}

      {/* Trip overview and day-by-day itinerary */}
      <div className="grid items-start gap-6 md:grid-cols-2">
        <section className="flex flex-col gap-6" aria-label="Daily itinerary">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-medium tracking-tight">
                The itinerary
              </h2>
              <p className="text-sm text-muted-foreground">
                A flexible route with room for the unexpected.
              </p>
            </div>
            <Badge
              variant="outline"
              className="rounded-full border-brand-line bg-white px-3 py-1 text-brand-blue"
            >
              {trip.stops.length} stops
            </Badge>
          </div>
          {Object.entries(groupedStops).map(([day, stops]) => (
            <Card
              key={day}
              className="rounded-[22px] border-brand-line bg-white shadow-none"
            >
              <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-brand-line pb-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-xl bg-brand-blue-soft text-brand-blue">
                      <CalendarDays className="size-4" />
                    </span>
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                        Day {day}
                      </p>
                      <p className="font-semibold">{stops[0]?.area}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {stops.length} stops
                  </span>
                </div>
                <div className="relative flex flex-col gap-5">
                  {stops.map((stop, index) => (
                    <div
                      key={stop.id ?? `${day}-${stop.place}-${index}`}
                      className="relative grid grid-cols-[34px_1fr] gap-x-3"
                    >
                      <span
                        className={`relative z-10 grid size-[34px] place-items-center rounded-full ${index === 1 ? "bg-brand-red-soft text-brand-red" : "bg-brand-blue-soft text-brand-blue"}`}
                      >
                        <MapPin className="size-4" />
                      </span>
                      {index < stops.length - 1 && (
                        <span
                          className="absolute top-8 bottom-[-20px] left-[16px] border-l border-dashed border-brand-line"
                          aria-hidden="true"
                        />
                      )}
                      <div className="flex flex-col gap-1">
                        <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <Clock3 className="size-3.5" /> {stop.time}{" "}
                          <span className="px-1">·</span> {stop.area}
                        </p>
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-medium">{stop.place}</h3>
                          <div className="flex shrink-0 items-center">
                            {isEditing && stop.id && (
                              <TripStopEditor tripId={slug} stop={stop} />
                            )}
                            {isEditing && stop.id && (
                              <ConfirmAction
                                title={`Are you sure you want to remove ${stop.place}?`}
                                description="This stop will be removed from your itinerary and route map."
                                actionLabel="Remove stop"
                                onConfirm={() => remove.mutateAsync(stop.id!)}
                                pending={remove.isPending}
                                error={remove.error?.message}
                                variant="ghost"
                                size="icon"
                                ariaLabel={`Remove ${stop.place}`}
                                className="size-9 shrink-0 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                                destructive
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </ConfirmAction>
                            )}
                          </div>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {stop.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Trip metadata and route preview */}
        <aside className="flex min-w-0 flex-col gap-4">
          <Card className="rounded-[22px] border-brand-line bg-white shadow-none">
            <CardContent className="flex flex-col gap-5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold">Trip overview</h2>
                <TripStatusBadge status={trip.status} />
              </div>
              <div className="flex flex-col gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="size-4" /> Duration
                  </span>
                  <span className="font-medium">{trip.days}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-4" /> Destination
                  </span>
                  <span className="font-medium">{trip.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Star className="size-4" /> Community rating
                  </span>
                  <span className="font-medium">{trip.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 border-t border-brand-line pt-4">
                <Avatar className="size-9 shrink-0">
                  {trip.authorAvatar && (
                    <AvatarImage src={trip.authorAvatar} alt={trip.author} />
                  )}
                  <AvatarFallback className="bg-brand-yellow-soft text-sm font-semibold text-brand-red-deep">
                    {getInitials(trip.author)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{trip.author}</p>
                  <p className="text-xs text-muted-foreground">Trip creator</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden rounded-[22px] border-brand-line bg-white shadow-none">
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Route overview</h2>
                <Badge
                  variant="secondary"
                  className="rounded-full bg-brand-blue-soft text-brand-blue"
                >
                  Preview
                </Badge>
              </div>
              <RouteMap stops={trip.stops} />
              <p className="text-xs leading-5 text-muted-foreground">
                {trip.stops.length} planned stops across{" "}
                {Object.keys(groupedStops).length} days. Stop order is a guide,
                not a schedule.
              </p>
            </CardContent>
          </Card>

          {/* Traveller feedback below the route preview */}
          {trip.isPublic && (
            <Card className="rounded-[22px] border-brand-line bg-white shadow-none">
              <CardContent className="p-5">
                <TripComments
                  tripSlug={trip.slug}
                  canReview={!isOwner && !isAdmin}
                />
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
      {visibility.error && (
        <p role="alert" className="text-right text-xs text-destructive">
          {visibility.error.message}
        </p>
      )}
      {saved.toggleSave.error && (
        <p role="alert" className="text-right text-xs text-destructive">
          {saved.toggleSave.error.message}
        </p>
      )}
      {remove.error && (
        <p role="alert" className="text-sm text-destructive">
          {remove.error.message}
        </p>
      )}
      {isEditing && <TripStopManager tripId={slug} />}
    </div>
  );
}
