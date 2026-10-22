import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { ItineraryCard } from "@/components/itinerary-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { itineraries } from "@/lib/data";

export default function CommunityPage() {
  const communityTrips = itineraries.filter((trip) => trip.isPublic);

  return (
    <div className="flex w-full flex-col gap-10 py-10 sm:gap-12 sm:py-14">
      {/* Community page introduction */}
      <header className="flex flex-col gap-4">
        <Badge
          variant="outline"
          className="w-fit rounded-full border-brand-line bg-white px-3 py-1 text-brand-blue"
        >
          Trips shared by curious locals
        </Badge>
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="flex max-w-2xl flex-col gap-3">
            <h1 className="text-4xl font-medium tracking-[-0.06em] sm:text-6xl">
              Good trips{" "}
              <span className="text-brand-red">travel.</span>
            </h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Borrow an idea, follow a local tip, then make the route your own.
            </p>
          </div>
          <Button
            nativeButton={false}
            render={<Link href="/plan" />}
            className="h-11 w-fit rounded-full bg-brand-blue px-5 text-white hover:bg-brand-blue-hover"
          >
            Share your trip <ArrowRight className="size-4" />
          </Button>
        </div>
      </header>

      {/* Community trip collection */}
      <section
        className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        aria-label="Community itineraries"
      >
        {communityTrips.map((trip) => (
          <ItineraryCard
            key={trip.slug}
            itinerary={trip}
          />
        ))}
      </section>

      {/* Community invitation */}
      <section className="flex flex-col items-start justify-between gap-5 rounded-[28px] bg-brand-blue-soft p-6 sm:flex-row sm:items-center sm:p-9">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-brand-blue">
            <Users className="size-5" />
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-medium tracking-tight">
              Know a route worth sharing?
            </h2>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Your favourite stops could help someone discover their own
              favourite place.
            </p>
          </div>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/plan" />}
          variant="outline"
          className="h-11 shrink-0 rounded-full border-brand-line bg-white px-5 text-brand-blue"
        >
          Share a trip <ArrowRight className="size-4" />
        </Button>
      </section>
    </div>
  );
}
