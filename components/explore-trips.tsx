"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { usePublicTrips } from "@/hooks/use-trips";
import { tripInterestOptions } from "@/lib/data";
import type { TripFilters } from "@/lib/type";
import { filterTrips, getTripStates } from "@/lib/trip-filters";
import { ItineraryCard } from "@/components/itinerary-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function ExploreTrips({ embedded = false }: { embedded?: boolean }) {
  const trips = usePublicTrips();
  const [search, setSearch] = useState("");
  const [state, setState] = useState("all");
  const [tags, setTags] = useState<string[]>([]);
  const [sort, setSort] = useState<TripFilters["sort"]>("latest");
  const states = useMemo(
    () =>
      [...new Set((trips.data?.trips ?? []).flatMap(getTripStates))].sort(
        (a, b) => a.localeCompare(b),
      ),
    [trips.data],
  );
  const filtered = useMemo(
    () => filterTrips(trips.data?.trips ?? [], { search, state, tags, sort }),
    [trips.data, search, state, tags, sort],
  );
  const hasFilters = Boolean(search.trim() || state !== "all" || tags.length);
  function resetFilters() {
    setSearch("");
    setState("all");
    setTags([]);
  }

  return (
    <div
      className={`flex w-full flex-col gap-5 ${embedded ? "" : "py-10 sm:gap-6 sm:py-14"}`}
    >
      {/* Shared itinerary introduction; the homepage supplies its own heading. */}
      {!embedded && (
        <header className="flex flex-col gap-4">
          <Badge
            variant="outline"
            className="w-fit rounded-full border-brand-line bg-white text-brand-blue"
          >
            Shared plans, new possibilities
          </Badge>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex max-w-2xl flex-col gap-3">
              <h1 className="text-4xl font-medium tracking-[-0.06em] sm:text-6xl">
                Explore your kind of{" "}
                <span className="text-brand-red">Malaysia.</span>
              </h1>
              <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                Browse itineraries shared by travellers. Find a route you love
                and make it your own.
              </p>
            </div>
          </div>
        </header>
      )}

      {/* Search, state selection, sorting, and independent interest tags. */}
      <div className="flex flex-col gap-4 rounded-2xl border border-brand-line bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Label htmlFor="trip-browser-search">Search trips</Label>
            <div className="flex items-center gap-2 rounded-xl border border-brand-line px-3">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <Input
                id="trip-browser-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Trip name, state, or interest"
                className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:w-[40%]">
            <div className="flex min-w-0 flex-col gap-2">
              <Label htmlFor="trip-browser-state">State</Label>
              <Select
                value={state}
                onValueChange={(value) => setState(value ?? "all")}
              >
                <SelectTrigger
                  id="trip-browser-state"
                  className="h-10 w-full rounded-xl pl-3"
                >
                  <SelectValue>
                    {state === "all" ? "All States" : state}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align="start" alignItemWithTrigger={false}>
                  <SelectItem value="all" className="pl-3">
                    All States
                  </SelectItem>
                  {states.map((name) => (
                    <SelectItem key={name} value={name} className="pl-3">
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <Label htmlFor="trip-browser-sort">Sort By</Label>
              <Select
                value={sort}
                onValueChange={(value) =>
                  setSort(
                    value === "saved" || value === "rating" ? value : "latest",
                  )
                }
              >
                <SelectTrigger
                  id="trip-browser-sort"
                  className="h-10 w-full rounded-xl pl-3"
                >
                  <SelectValue>
                    {sort === "saved"
                      ? "Most Saved"
                      : sort === "rating"
                        ? "Highest Rated"
                        : "Newest First"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align="start" alignItemWithTrigger={false}>
                  <SelectItem value="latest" className="pl-3">
                    Newest First
                  </SelectItem>
                  <SelectItem value="saved" className="pl-3">
                    Most Saved
                  </SelectItem>
                  <SelectItem value="rating" className="pl-3">
                    Highest Rated
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-brand-line pt-4">
          <p id="trip-tag-filter-label" className="text-sm font-medium">
            Interest tags
          </p>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-labelledby="trip-tag-filter-label"
          >
            <Button
              variant={tags.length ? "outline" : "default"}
              size="sm"
              aria-pressed={!tags.length}
              onClick={() => setTags([])}
              className={`rounded-full ${!tags.length ? "bg-brand-blue text-white hover:bg-brand-blue-hover" : "border-brand-blue/25 text-brand-blue hover:bg-brand-blue-soft"}`}
            >
              All tags
            </Button>
            {tripInterestOptions.map((tag) => (
              <Button
                key={tag}
                variant={tags.includes(tag) ? "default" : "outline"}
                size="sm"
                aria-pressed={tags.includes(tag)}
                onClick={() =>
                  setTags((current) =>
                    current.includes(tag)
                      ? current.filter((value) => value !== tag)
                      : [...current, tag],
                  )
                }
                className={`rounded-full ${tags.includes(tag) ? "bg-brand-blue text-white hover:bg-brand-blue-hover" : "border-brand-blue/25 text-brand-blue hover:bg-brand-blue-soft"}`}
              >
                {tag}
              </Button>
            ))}
          </div>
          {!!tags.length && (
            <p className="text-xs text-muted-foreground">
              Showing trips with all selected tags.
            </p>
          )}
        </div>
      </div>

      {/* Filtered itinerary collection */}
      <section aria-label="Shared itineraries" className="flex flex-col gap-4">
        <div className="flex min-h-8 items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {trips.isPending
              ? "Loading itineraries…"
              : `${filtered.length} ${filtered.length === 1 ? "itinerary" : "itineraries"}`}
          </p>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-muted-foreground"
              onClick={resetFilters}
            >
              <X className="size-3.5" />
              Clear filters
            </Button>
          )}
        </div>
        {trips.error ? (
          <p role="alert" className="text-sm text-destructive">
            {trips.error.message}
          </p>
        ) : trips.isPending ? null : filtered.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((trip) => (
              <ItineraryCard key={trip.slug} itinerary={trip} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-brand-line px-6 py-10 text-center">
            <Search className="size-6 text-muted-foreground" />
            <h2 className="font-semibold">No itineraries found</h2>
            <p className="text-sm text-muted-foreground">
              {hasFilters
                ? "Try a different state or fewer tags."
                : "Published trips will appear here once travellers share them."}
            </p>
            {hasFilters && (
              <Button
                variant="outline"
                className="rounded-full"
                onClick={resetFilters}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
