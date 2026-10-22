"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass, Plus, Route, Share2 } from "lucide-react";
import { ItineraryCard } from "@/components/itinerary-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
              <span className="font-serif italic text-brand-red">trips.</span>
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
        <Card className="rounded-2xl border-brand-line bg-white shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-blue-soft text-brand-blue">
              <Route className="size-5" />
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-2xl font-semibold tracking-tight">
                {myTrips.length}
              </span>
              <span className="text-xs text-muted-foreground">Trips saved</span>
            </span>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-brand-line bg-white shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-yellow-soft text-brand-red">
              <Compass className="size-5" />
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-2xl font-semibold tracking-tight">
                {planningCount}
              </span>
              <span className="text-xs text-muted-foreground">
                Still planning
              </span>
            </span>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-brand-line bg-white shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-red-soft text-brand-red">
              <Share2 className="size-5" />
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-2xl font-semibold tracking-tight">
                {readyCount}
              </span>
              <span className="text-xs text-muted-foreground">Ready to go</span>
            </span>
          </CardContent>
        </Card>
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
          <div className="grid gap-5 md:grid-cols-2">
            {trips.map((trip) => (
              <ItineraryCard
                key={trip.slug}
                itinerary={trip}
                showAuthor={false}
              />
            ))}
          </div>
        ) : (
          <Card className="rounded-3xl border-dashed border-brand-line bg-white/60 shadow-none">
            <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
              <Compass className="size-7 text-muted-foreground" />
              <h2 className="font-medium">Nothing in this list yet</h2>
              <p className="text-sm text-muted-foreground">
                Start planning a trip and it will show up here.
              </p>
              <Button
                nativeButton={false}
                render={<Link href="/plan" />}
                variant="outline"
                className="rounded-full"
              >
                Start a trip <ArrowRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
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
