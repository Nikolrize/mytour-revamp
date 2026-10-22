"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass, Plus, Route, Share2 } from "lucide-react";
import { ItineraryCard } from "@/components/itinerary-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/metric-card";
import { EmptyState } from "@/components/empty-state";
import { myTrips } from "@/lib/data";

const filters = ["All trips", "Planning", "Ready to go", "Completed"];

export function TripLibrary() {
  const [activeFilter, setActiveFilter] = useState("All trips");
  const trips =
    activeFilter === "All trips"
      ? myTrips
      : myTrips.filter((trip) => trip.status === activeFilter);
  const planningCount = myTrips.filter(
    (trip) => trip.status === "Planning",
  ).length;
  const readyCount = myTrips.filter(
    (trip) => trip.status === "Ready to go",
  ).length;

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
              My{" "}
              <span className="text-brand-red">trips.</span>
            </h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Keep your ideas, plans, and favourite routes together.
            </p>
          </div>
          <Button
            nativeButton={false}
            render={<Link href="/plan" />}
            className="h-11 w-fit shrink-0 rounded-full bg-brand-blue px-5 text-white hover:bg-brand-blue-hover"
          >
            <Plus className="size-4" /> Plan a new trip
          </Button>
        </div>
      </header>

      {/* Trip library summary */}
      <section className="grid gap-3 sm:grid-cols-3" aria-label="Trip summary">
        <MetricCard
          label="Trips saved"
          value={myTrips.length}
          icon={Route}
          iconTone="bg-brand-blue-soft text-brand-blue"
          variant="compact"
        />
        <MetricCard
          label="Still planning"
          value={planningCount}
          icon={Compass}
          iconTone="bg-brand-yellow-soft text-brand-red"
          variant="compact"
        />
        <MetricCard
          label="Ready to go"
          value={readyCount}
          icon={Share2}
          iconTone="bg-brand-red-soft text-brand-red"
          variant="compact"
        />
      </section>

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
                onClick={() => setActiveFilter(filter)}
                variant={filter === activeFilter ? "default" : "outline"}
                className={`h-9 rounded-full px-4 text-xs ${filter === activeFilter ? "bg-brand-blue text-white hover:bg-brand-blue-hover" : "border-brand-line text-muted-foreground"}`}
              >
                {filter}
              </Button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {trips.length} {trips.length === 1 ? "trip" : "trips"}
          </span>
        </div>
        {trips.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <ItineraryCard
                key={trip.slug}
                itinerary={trip}
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
              <Button
                nativeButton={false}
                render={<Link href="/plan" />}
                variant="outline"
                className="rounded-full"
              >
                Start a trip <ArrowRight className="size-4" />
              </Button>
            }
          />
        )}
      </section>
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge
          variant="secondary"
          className="rounded-full bg-brand-surface-muted text-muted-foreground"
        >
          Preview
        </Badge>{" "}
        These trips are sample content while your account and trip storage are
        being set up.
      </p>
    </div>
  );
}
