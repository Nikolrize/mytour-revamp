"use client";

import { ItineraryCard } from "@/components/itinerary-card";
import { usePublicTrips } from "@/hooks/use-trips";

export function CommunityTripList() {
  const { data, isPending, error } = usePublicTrips();
  const trips = data?.trips ?? [];

  if (isPending)
    return (
      <p className="text-sm text-muted-foreground">Loading shared trips…</p>
    );
  if (error)
    return (
      <p role="alert" className="text-sm text-destructive">
        {error.message}
      </p>
    );
  if (!trips.length)
    return (
      <p className="rounded-2xl border border-dashed border-brand-line p-10 text-center text-sm text-muted-foreground">
        No shared trips yet. Be the first to share one.
      </p>
    );

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => (
        <ItineraryCard key={trip.slug} itinerary={trip} />
      ))}
    </div>
  );
}
