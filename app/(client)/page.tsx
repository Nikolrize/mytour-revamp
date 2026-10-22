"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Heart,
  MapPin,
  Search,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { categories } from "@/lib/data";
import { useDestinations } from "@/hooks/use-destinations";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All places");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const { destinations } = useDestinations();

  const visibleDestinations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return destinations.filter((destination) => {
      const matchesCategory =
        activeCategory === "All places" ||
        destination.category === activeCategory;
      const matchesQuery =
        !normalizedQuery ||
        `${destination.name} ${destination.state} ${destination.category}`
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query, destinations]);

  function toggleSaved(name: string) {
    setSaved((current) =>
      current.includes(name)
        ? current.filter((savedName) => savedName !== name)
        : [...current, name],
    );
  }

  return (
    <div className="flex w-full flex-col bg-background text-foreground">
      <section id="top" className="relative w-full">
        <div className="relative min-h-[48svh] overflow-hidden rounded-[30px] bg-brand-blue-deep sm:min-h-[52svh] lg:min-h-[56svh]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-75"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=2200&q=90')",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-brand-blue-deep/95 via-brand-blue-deep/75 to-brand-blue-deep/15"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-brand-blue-deep/70 via-transparent to-black/10"
            aria-hidden="true"
          />

          <div className="relative flex min-h-[48svh] flex-col justify-center gap-5 px-6 py-8 text-white sm:min-h-[52svh] sm:px-12 lg:min-h-[56svh] lg:px-[7.5%]">
            <Badge className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-medium tracking-[0.12em] text-white backdrop-blur-sm hover:bg-white/10">
              <span className="size-1.5 rounded-full bg-brand-yellow" /> MADE
              FOR YOUR KIND OF MALAYSIA
            </Badge>
            <h1 className="max-w-[720px] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[0.94] font-medium tracking-[-0.075em]">
              Find your own
              <br />
              way through{" "}
              <span className="font-normal text-brand-yellow">Malaysia.</span>
            </h1>
            <p className="max-w-[430px] text-[15px] leading-7 text-white/75 sm:text-base">
              Big adventures, tiny food spots, and everything in between. Build
              a trip that feels like yours.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setPlannerOpen(true)}
                className="h-12 rounded-full bg-brand-yellow px-6 text-sm font-semibold text-foreground shadow-lg shadow-black/10 hover:bg-brand-yellow-hover"
              >
                <Sparkles className="size-4" /> Plan with AI
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  document
                    .getElementById("discover")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="h-12 rounded-full border-white/35 bg-white/10 px-6 text-sm text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
              >
                Explore places <ArrowDownRight className="size-4" />
              </Button>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/75">
              <div className="flex -space-x-2">
                {[
                  "photo-1534528741775-53994a69daeb",
                  "photo-1500648767791-00dcc994a43e",
                  "photo-1531123897727-8f129e1688ce",
                ].map((photo) => (
                  <span
                    key={photo}
                    className="size-8 rounded-full border-2 border-brand-blue bg-cover bg-center"
                    style={{
                      backgroundImage: `url(https://images.unsplash.com/${photo}?auto=format&fit=crop&w=80&q=75)`,
                    }}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span>
                <strong className="font-semibold text-white">2,400+</strong>{" "}
                trips made by curious locals
              </span>
            </div>
          </div>
          <div className="absolute bottom-7 right-7 hidden items-center gap-3 rounded-2xl border border-white/20 bg-brand-blue-deep/55 px-4 py-3 text-white backdrop-blur-md lg:flex">
            <span className="grid size-9 place-items-center rounded-full bg-brand-yellow text-foreground">
              <MapPin className="size-4" />
            </span>
            <span>
              <span className="block text-[10px] tracking-[0.14em] text-white/65 uppercase">
                Somewhere in
              </span>
              <strong className="block text-sm font-medium">
                Kuala Lumpur, Malaysia
              </strong>
            </span>
          </div>
        </div>
      </section>

      {plannerOpen && (
        <section className="w-full pt-5" aria-live="polite">
          <div className="animate-in fade-in-0 slide-in-from-top-2 duration-300 flex flex-col gap-4 rounded-3xl border border-brand-blue-soft bg-brand-blue-soft p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-blue text-white">
                <Sparkles className="size-4" />
              </span>
              <div className="flex flex-col gap-1">
                <p className="font-semibold">
                  Your trip starts with a few details
                </p>
                <p className="text-sm text-muted-foreground">
                  Tell us where, when, and what you love. The planner will help
                  shape your itinerary.
                </p>
              </div>
            </div>
            <div className="flex gap-2 sm:shrink-0">
              <Button
                onClick={() => setPlannerOpen(false)}
                variant="outline"
                className="h-10 rounded-full bg-white"
              >
                Maybe later
              </Button>
              <Button
                onClick={() =>
                  document
                    .getElementById("discover")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="h-10 rounded-full bg-brand-blue text-white"
              >
                Choose a destination <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      <section
        id="discover"
        className="flex w-full flex-col gap-8 pt-20 pb-12 sm:pt-24"
      >
        <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-brand-red uppercase">
              A good place to begin
            </p>
            <h2 className="text-4xl leading-tight font-medium tracking-[-0.06em] sm:text-5xl">
              Where to next?
            </h2>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Find a feeling, follow a craving, or pick a pin on the map.
               There&apos;s no wrong way in.
            </p>
          </div>
          <div className="flex w-full items-center gap-2 rounded-full border border-brand-line bg-white p-1.5 pl-4 shadow-sm lg:max-w-[390px]">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a place or state"
              className="h-10 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
              aria-label="Search destinations"
            />
            <Button
              size="sm"
              className="h-10 rounded-full bg-brand-blue px-4 hover:bg-brand-blue-hover"
            >
              Search
            </Button>
          </div>
        </div>

        <div
          className="flex gap-2 overflow-x-auto pb-2"
          role="group"
          aria-label="Filter destinations"
        >
          {categories.map((category) => (
            <Button
              key={category}
              role="tab"
              aria-selected={activeCategory === category}
              onClick={() => setActiveCategory(category)}
              variant={activeCategory === category ? "default" : "outline"}
              className={`h-9 shrink-0 rounded-full px-4 text-xs ${activeCategory === category ? "bg-brand-blue text-white hover:bg-brand-blue-hover" : "border-brand-line bg-transparent text-muted-foreground hover:bg-white"}`}
            >
              {category}
            </Button>
          ))}
        </div>

        {visibleDestinations.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleDestinations.map((destination) => (
              <Card
                    key={destination.id ?? destination.name}
                className="group relative min-h-[32svh] rounded-[24px] border-0 bg-brand-blue-soft p-0 shadow-none transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-blue/10"
              >
                <div
                  className="absolute inset-0 rounded-[24px] bg-cover bg-center"
                      style={destination.image ? { backgroundImage: `url('${destination.image}')` } : undefined}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 rounded-[24px] bg-gradient-to-t from-brand-blue-deep/80 via-brand-blue-deep/5 to-brand-blue-deep/10"
                  aria-hidden="true"
                />
                <CardContent className="relative flex min-h-[32svh] flex-col justify-between p-5 text-white">
                  <div className="flex items-start justify-between">
                    <Badge className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[10px] text-white backdrop-blur-md hover:bg-white/15">
                      {destination.category}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleSaved(destination.name);
                      }}
                      className="size-9 rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-white/25 hover:text-white"
                      aria-label={
                        saved.includes(destination.name)
                          ? `Remove ${destination.name} from saved places`
                          : `Save ${destination.name}`
                      }
                    >
                      <Heart
                        className={`size-4 ${saved.includes(destination.name) ? "fill-brand-yellow text-brand-yellow" : ""}`}
                      />
                    </Button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="flex items-center gap-1 text-xs text-white/75">
                      <MapPin className="size-3.5" /> {destination.state},
                      Malaysia
                    </p>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <h3 className="text-2xl font-medium tracking-[-0.04em]">
                          {destination.name}
                        </h3>
                        <p className="text-xs text-white/75">
                          {destination.note}
                        </p>
                      </div>
                      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/35 transition group-hover:bg-white group-hover:text-brand-blue-deep">
                        <ArrowUpRight className="size-4" />
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
            description="Try another destination or choose a different category."
            className="px-6 py-14"
            action={
              <Button
                onClick={() => {
                  setQuery("");
                  setActiveCategory("All places");
                }}
                variant="outline"
                className="rounded-full"
              >
                Clear filters
              </Button>
            }
          />
        )}
      </section>

      <section id="how-it-works" className="w-full py-12">
        <div className="grid gap-4 rounded-[28px] bg-brand-blue-soft p-6 sm:p-8 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:p-10">
          <div className="flex max-w-md flex-col items-start gap-4">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-brand-red uppercase">
              A little help, a lot of possibility
            </p>
            <h2 className="text-3xl leading-tight font-medium tracking-[-0.055em] sm:text-4xl">
              Less planning tabs.
              <br />
               More <span className="text-brand-red">“we&apos;re here.”</span>
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Start with a rough idea. Shape it into a day-by-day trip, move
              stops around, and see how it all connects.
            </p>
            <Button
              onClick={() => setPlannerOpen(true)}
              className="h-11 rounded-full bg-brand-blue px-5 hover:bg-brand-blue-hover"
            >
              Make my itinerary <ArrowRight className="size-4" />
            </Button>
          </div>
          <Card className="overflow-hidden rounded-[22px] border-brand-line bg-white p-0 shadow-sm">
            <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-brand-line pb-4">
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground">
                    A three-day escape
                  </p>
                  <h3 className="text-lg font-semibold tracking-tight">
                    Penang, at your pace
                  </h3>
                </div>
                <Badge
                  variant="secondary"
                  className="rounded-full bg-brand-blue-soft text-brand-blue"
                >
                  3 days
                </Badge>
              </div>
              <div className="relative grid grid-cols-[34px_1fr] gap-x-3">
                <div
                  className="absolute top-3 bottom-7 left-[16px] border-l border-dashed border-brand-line"
                  aria-hidden="true"
                />
                <span className="relative z-10 grid size-[34px] place-items-center rounded-full bg-brand-blue-soft text-brand-blue">
                  <MapPin className="size-4" />
                </span>
                <div className="flex flex-col gap-1 pb-5">
                  <p className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Day 1 · George Town
                  </p>
                  <p className="text-sm font-medium">
                    Coffee, murals & a long lunch
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Armenian Street <span className="px-1">·</span> Hin Bus
                    Depot <span className="px-1">·</span> New Lane
                  </p>
                </div>
                <span className="relative z-10 grid size-[34px] place-items-center rounded-full bg-brand-red-soft text-brand-red">
                  <MapPin className="size-4" />
                </span>
                <div className="flex flex-col gap-1 pb-5">
                  <p className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Day 2 · Balik Pulau
                  </p>
                  <p className="text-sm font-medium">
                    A slower side of the island
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Local farm <span className="px-1">·</span> Laksa stop{" "}
                    <span className="px-1">·</span> Sunset coast
                  </p>
                </div>
                <span className="relative z-10 grid size-[34px] place-items-center rounded-full bg-brand-blue-soft text-brand-blue">
                  <MapPin className="size-4" />
                </span>
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Day 3 · Tanjung Bungah
                  </p>
                  <p className="text-sm font-medium">
                    Sea air before heading home
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Breakfast by the water <span className="px-1">·</span>{" "}
                    Last-minute kuih
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-brand-surface-muted px-4 py-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-brand-yellow" /> Route
                  preview
                </span>
                <span>
                  6 stops <span className="px-1">·</span> about 42 km
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section
        id="community"
        className="flex w-full flex-col gap-7 pt-14 pb-20 sm:pt-20"
      >
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-brand-red uppercase">
              Good trips travel
            </p>
            <h2 className="text-3xl font-medium tracking-[-0.06em] sm:text-4xl">
              Borrow an idea. Make it yours.
            </h2>
          </div>
          <a
            href="#community"
            className="hidden items-center gap-2 pb-1 text-sm font-medium text-brand-blue hover:text-brand-red sm:flex"
          >
            See the community <ArrowRight className="size-4" />
          </a>
        </div>
        <Card className="grid overflow-hidden rounded-[24px] border-brand-line bg-white p-0 shadow-sm md:grid-cols-[1.05fr_1fr]">
          <div className="relative min-h-[270px] bg-brand-blue-soft md:min-h-[350px]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1200&q=85')",
              }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-brand-blue-deep/60 to-transparent"
              aria-hidden="true"
            />
            <Badge className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-brand-blue hover:bg-white/90">
              LOCAL FAVOURITE
            </Badge>
            <div className="absolute bottom-5 left-5 flex flex-col gap-1 text-white">
              <p className="text-xs text-white/75">
                Shared by people who know the way
              </p>
              <p className="text-xl font-medium">A weekend in Melaka</p>
            </div>
          </div>
          <CardContent className="flex flex-col justify-between gap-8 p-6 sm:p-8">
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-brand-yellow-soft text-sm font-semibold text-brand-red-deep">
                  NA
                </span>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold">Nadia A.</p>
                  <p className="text-xs text-muted-foreground">
                    Kuala Lumpur · 4 trips shared
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-brand-red">
                  <Star className="size-3.5 fill-current" /> 4.9
                </div>
              </div>
              <h3 className="max-w-sm text-2xl leading-tight font-medium tracking-[-0.045em]">
                Old streets, good coffee, and nowhere to rush.
              </h3>
              <p className="max-w-md text-sm leading-6 text-muted-foreground">
                 A relaxed two-day route through Melaka&apos;s heritage lanes,
                riverside cafés, and the small spots worth finding.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="rounded-full border-brand-line px-3 py-1 text-muted-foreground"
                >
                  2 days
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full border-brand-line px-3 py-1 text-muted-foreground"
                >
                  Food & culture
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full border-brand-line px-3 py-1 text-muted-foreground"
                >
                  Walkable
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-brand-line pt-5">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Heart className="size-4" /> 128 saves
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="size-4" /> 2.1k views
                </span>
              </div>
              <Button
                variant="ghost"
                className="rounded-full text-brand-blue hover:bg-brand-blue-soft"
              >
                View trip <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
