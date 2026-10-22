"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Share2,
  Sparkles,
  Star,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TripComments } from "@/components/trip-comments";
import { getInitials } from "@/lib/utils";
import { useTripDetails } from "@/hooks/use-trip-details";

export default function TripDetailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50svh] w-full items-center justify-center text-sm text-muted-foreground">Loading trip…</div>}>
      <TripDetailContent />
    </Suspense>
  );
}

function TripDetailContent() {
  const { slug } = useParams<{ slug: string }>();
  const tripQuery = useTripDetails(slug);
  const trip = tripQuery.data?.trip;

  if (tripQuery.isPending) {
    return <div className="flex min-h-[50svh] w-full items-center justify-center text-sm text-muted-foreground">Loading trip…</div>;
  }
  if (tripQuery.error || !trip) {
    return <div className="flex min-h-[50svh] w-full flex-col items-center justify-center gap-3 text-center"><h1 className="text-2xl font-semibold">Trip not found</h1><p className="text-sm text-muted-foreground">{tripQuery.error?.message ?? "This trip may have been removed or is private."}</p><Link href="/community" className="text-sm font-medium text-brand-blue hover:underline">Back to community</Link></div>;
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
          href={trip.isPublic ? "/community" : "/trips"}
          className="flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-blue"
        >
          <ArrowLeft className="size-4" /> Back to{" "}
          {trip.isPublic ? "community" : "my trips"}
        </Link>
        <div className="relative flex min-h-[40svh] flex-col justify-end overflow-hidden rounded-[28px] bg-brand-blue-deep p-6 text-white sm:min-h-[46svh] sm:p-10">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-80"
            style={{ backgroundImage: `url('${trip.image}')` }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-brand-blue-deep/90 via-brand-blue-deep/30 to-transparent"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-4">
            <Badge className="w-fit rounded-full border border-white/25 bg-white/15 text-white backdrop-blur hover:bg-white/15">
              {trip.category}
            </Badge>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="flex max-w-2xl flex-col gap-2">
                <p className="flex items-center gap-1.5 text-sm text-white/75">
                  <MapPin className="size-4" /> {trip.location}, Malaysia
                </p>
                <h1 className="text-4xl font-medium tracking-[-0.06em] sm:text-6xl">
                  {trip.title}
                </h1>
                <p className="text-sm text-white/80 sm:text-base">
                  {trip.note}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="h-10 rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <Share2 className="size-4" /> Share
                </Button>
                <Button
                  nativeButton={false}
                  render={<Link href="/plan" />}
                  className="h-10 rounded-full bg-brand-yellow px-4 text-foreground hover:bg-brand-yellow-hover"
                >
                  Use this route <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trip overview and day-by-day itinerary */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24vw)]">
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
                      key={`${day}-${stop.place}`}
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
                        <h3 className="font-medium">{stop.place}</h3>
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
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          <Card className="rounded-[22px] border-brand-line bg-white shadow-none">
            <CardContent className="flex flex-col gap-5 p-5">
              <h2 className="font-semibold">Trip at a glance</h2>
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
              <div className="relative flex min-h-48 flex-col justify-between overflow-hidden rounded-2xl bg-brand-blue-soft p-4">
                <span
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 30%, #ffffff 0 3%, transparent 3.5%), radial-gradient(circle at 80% 22%, #ffffff 0 4%, transparent 4.5%), radial-gradient(circle at 65% 78%, #ffffff 0 5%, transparent 5.5%), linear-gradient(135deg, transparent 45%, rgba(255,255,255,.7) 46% 49%, transparent 50%)",
                  }}
                  aria-hidden="true"
                />
                <span className="relative z-10 grid size-8 place-items-center rounded-full bg-brand-blue text-white">
                  <MapPin className="size-4" />
                </span>
                <div className="relative z-10 flex items-center justify-between">
                  <span className="h-0.5 flex-1 rotate-[-14deg] bg-brand-red" />
                  <span className="grid size-8 place-items-center rounded-full bg-brand-red text-white">
                    <MapPin className="size-4" />
                  </span>
                  <span className="h-0.5 flex-1 rotate-[12deg] bg-brand-red" />
                  <span className="grid size-8 place-items-center rounded-full bg-brand-blue text-white">
                    <MapPin className="size-4" />
                  </span>
                </div>
                <span className="relative z-10 text-[10px] text-muted-foreground">
                  Illustrative route order · not to scale
                </span>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                {trip.stops.length} planned stops across{" "}
                {Object.keys(groupedStops).length} days. Stop order is a guide,
                not a schedule.
              </p>
            </CardContent>
          </Card>
          <Button
            nativeButton={false}
            render={<Link href="/plan" />}
            className="h-11 rounded-full bg-brand-blue text-white hover:bg-brand-blue-hover"
          >
            <Sparkles className="size-4" /> Make this trip yours{" "}
            <ArrowRight className="size-4" />
          </Button>
        </aside>
      </div>
      {/* Reviews and community discussion */}
      {trip.isPublic && <TripComments tripSlug={trip.slug} />}
    </div>
  );
}
