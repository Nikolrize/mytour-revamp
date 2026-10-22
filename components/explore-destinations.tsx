"use client";

import { useMemo, useState } from "react";
import { ArrowRight, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { categories, destinations } from "@/lib/data";

export function ExploreDestinations() {
  const [category, setCategory] = useState("All places");
  const [query, setQuery] = useState("");
  const places = useMemo(
    () =>
      destinations.filter((place) => {
        const matchesCategory =
          category === "All places" || place.category === category;
        const matchesQuery = `${place.name} ${place.state} ${place.category}`
          .toLowerCase()
          .includes(query.trim().toLowerCase());
        return matchesCategory && matchesQuery;
      }),
    [category, query],
  );

  return (
    <div className="flex w-full flex-col gap-10 py-10 sm:gap-12 sm:py-14">
      {/* Explore page introduction */}
      <header className="flex flex-col gap-5">
        <Badge
          variant="outline"
          className="w-fit rounded-full border-brand-line bg-white px-3 py-1 text-brand-blue"
        >
          A little inspiration goes a long way
        </Badge>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="flex max-w-2xl flex-col gap-3">
            <h1 className="text-4xl font-medium tracking-[-0.06em] sm:text-6xl">
              Find your kind of{" "}
              <span className="text-brand-red">
                Malaysia.
              </span>
            </h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              From slow island mornings to late-night city food runs, start with
              a place that feels like you.
            </p>
          </div>
          <div className="flex w-full items-center gap-2 rounded-full border border-brand-line bg-white p-1.5 pl-4 shadow-sm lg:max-w-[390px]">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search places or states"
              className="h-10 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
              aria-label="Search places or states"
            />
            <Button
              size="sm"
              className="h-10 rounded-full bg-brand-blue px-4 text-white hover:bg-brand-blue-hover"
            >
              Search
            </Button>
          </div>
        </div>
      </header>

      {/* Place categories and destination cards */}
      <section className="flex flex-col gap-6" aria-label="Browse destinations">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter destinations"
          >
            {categories.map((item) => (
              <Button
                key={item}
                onClick={() => setCategory(item)}
                variant={category === item ? "default" : "outline"}
                className={`h-9 rounded-full px-4 text-xs ${category === item ? "bg-brand-blue text-white hover:bg-brand-blue-hover" : "border-brand-line bg-transparent text-muted-foreground hover:bg-white"}`}
              >
                {item}
              </Button>
            ))}
          </div>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <SlidersHorizontal className="size-3.5" /> Showing {places.length}{" "}
            places
          </p>
        </div>
        {places.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((place) => (
              <Card
                key={place.name}
                className="group relative min-h-[32svh] sm:min-h-[36svh] overflow-hidden rounded-[24px] border-0 bg-brand-blue-soft p-0 shadow-none"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                  style={{ backgroundImage: `url('${place.image}')` }}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-brand-blue-deep/85 via-brand-blue-deep/10 to-brand-blue-deep/10"
                  aria-hidden="true"
                />
                <CardContent className="relative flex min-h-[32svh] sm:min-h-[36svh] flex-col justify-between p-5 text-white">
                  <Badge className="w-fit rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[10px] text-white backdrop-blur-md hover:bg-white/15">
                    {place.category}
                  </Badge>
                  <div className="flex flex-col gap-2">
                    <p className="flex items-center gap-1 text-xs text-white/75">
                      <MapPin className="size-3.5" /> {place.state}, Malaysia
                    </p>
                    <div className="flex items-end justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-medium tracking-[-0.04em]">
                          {place.name}
                        </h2>
                        <p className="text-xs text-white/75">{place.note}</p>
                      </div>
                      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/35 transition group-hover:bg-white group-hover:text-brand-blue-deep">
                        <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="No places found"
            description="Try a different search or category."
            className="px-6 py-14"
            action={
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setQuery("");
                  setCategory("All places");
                }}
              >
                Clear filters
              </Button>
            }
          />
        )}
      </section>
    </div>
  );
}
