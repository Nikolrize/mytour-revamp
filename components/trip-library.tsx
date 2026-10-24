"use client";

import {
  TripCardGridSkeleton,
  MetricsLoadingSkeleton,
} from "@/components/loading-skeletons";

import { NewPlanMenu } from "@/components/new-plan-menu";

import { useState } from "react";

import { Compass, Route, Share2 } from "lucide-react";
import { ItineraryCard } from "@/components/itinerary-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/metric-card";
import { EmptyState } from "@/components/empty-state";
import { useTripPage } from "@/hooks/use-trips";
import { ItineraryPagination } from "@/components/itinerary-pagination";
import type { Itinerary } from "@/lib/type";

const filters = ["All trips", "Saved", "Planning", "Ongoing", "Completed"];
const emptyTrips: Itinerary[] = [];

export function TripLibrary() {
  const [activeFilter, setActiveFilter] = useState("All trips");
  const [page, setPage] = useState(1);
  const query = useTripPage({
    scope:
      activeFilter === "All trips"
        ? "all"
        : activeFilter === "Saved"
          ? "saved"
          : "mine",
    status:
      activeFilter === "All trips" || activeFilter === "Saved"
        ? "all"
        : (activeFilter as Itinerary["status"]),
    page,
  });
  const trips = query.data?.trips ?? emptyTrips;
  const loading = query.isPending;
  const listError = query.error;
  const total = query.data?.total ?? 0;
  const stats = query.data?.stats;

  return (
    <div className="flex w-full flex-col gap-9 py-10 sm:gap-11 sm:py-14">
      {/* My trips page introduction */}
      <header className="flex flex-col gap-5">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-3">
            <Badge
              variant="outline"
              className="w-fit rounded-full border-brand-line bg-white px-3 py-1 text-brand-blue"
            >
              Your travel notebook
            </Badge>
            <h1 className="text-4xl font-medium tracking-[-0.06em] sm:text-6xl">
              My <span className="text-brand-red">trips.</span>
            </h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Keep your ideas, plans, and favourite routes together.
            </p>
          </div>
          <NewPlanMenu
            label="Plan a new trip"
            className="h-11 w-fit shrink-0 rounded-full bg-brand-blue px-5 text-white hover:bg-brand-blue-hover"
          />
        </div>
      </header>

      {/* Trip library summary */}
      {loading ? (
        <MetricsLoadingSkeleton count={3} />
      ) : (
        <section
          className="grid gap-3 sm:grid-cols-3"
          aria-label="Trip summary"
        >
          <MetricCard
            label="Trips saved"
            value={stats?.saved ?? 0}
            icon={Route}
            iconTone="bg-brand-blue-soft text-brand-blue"
            variant="compact"
          />
          <MetricCard
            label="Still planning"
            value={stats?.planning ?? 0}
            icon={Compass}
            iconTone="bg-brand-yellow-soft text-brand-red"
            variant="compact"
          />
          <MetricCard
            label="Ongoing"
            value={stats?.ongoing ?? 0}
            icon={Share2}
            iconTone="bg-brand-red-soft text-brand-red"
            variant="compact"
          />
        </section>
      )}

      {/* Saved itinerary collection */}
      <section className="flex flex-col gap-6" aria-label="Saved itineraries">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter trips"
          >
            {filters.map((filter) => (
              <Button
                key={filter}
                onClick={() => {
                  setActiveFilter(filter);
                  setPage(1);
                }}
                variant={filter === activeFilter ? "default" : "outline"}
                className={`h-9 rounded-full px-4 text-xs ${filter === activeFilter ? "bg-brand-blue text-white hover:bg-brand-blue-hover" : "border-brand-line text-muted-foreground"}`}
              >
                {filter}
              </Button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {total} {total === 1 ? "trip" : "trips"}
          </span>
        </div>
        {loading ? (
          <TripCardGridSkeleton />
        ) : listError ? (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 p-5 text-sm text-destructive"
          >
            {listError.message}
          </p>
        ) : trips.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <ItineraryCard
                key={trip.slug}
                itinerary={trip}
                isSaved={Boolean(trip.isSaved)}
                showAuthor={false}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Compass}
            title="Nothing in this list yet"
            description="Start planning a trip and it will show up here."
            className="p-10"
            action={
              <NewPlanMenu label="Start a trip" className="rounded-full" />
            }
          />
        )}
        {query.data && !listError && (
          <ItineraryPagination
            page={query.data.page}
            totalPages={query.data.totalPages}
            busy={query.isFetching}
            onPageChange={setPage}
          />
        )}
      </section>
    </div>
  );
}
