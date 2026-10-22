import Link from "next/link";
import { ArrowRight, Heart, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Itinerary } from "@/lib/type";

type ItineraryCardProps = {
  itinerary: Itinerary;
  featured?: boolean;
  showAuthor?: boolean;
};

export function ItineraryCard({
  itinerary,
  featured = false,
  showAuthor = true,
}: ItineraryCardProps) {
  return (
    <Card
      className={`grid overflow-hidden rounded-[24px] border-brand-line bg-white p-0 shadow-sm ${featured ? "md:col-span-2 md:grid-cols-[1.05fr_1fr]" : "grid-rows-[220px_1fr]"}`}
    >
      <div
        className={`relative min-h-[240px] bg-brand-blue-soft ${featured ? "md:min-h-[360px]" : ""}`}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${itinerary.image}')` }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-brand-blue-deep/60 to-transparent"
          aria-hidden="true"
        />
        <Badge className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-brand-blue hover:bg-white/90">
          {featured ? "LOCAL FAVOURITE" : itinerary.category.toUpperCase()}
        </Badge>
        <p className="absolute bottom-5 left-5 flex items-center gap-1 text-xs text-white">
          <MapPin className="size-3.5" /> {itinerary.location}
        </p>
      </div>
      <CardContent className="flex flex-col justify-between gap-7 p-6 sm:p-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            {showAuthor ? (
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-brand-yellow-soft text-sm font-semibold text-brand-red-deep">
                  {itinerary.author
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .replace(".", "")}
                </span>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold">{itinerary.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {itinerary.location} · local traveller
                  </p>
                </div>
              </div>
            ) : (
              <Badge
                variant="outline"
                className="rounded-full border-brand-line px-3 py-1 text-muted-foreground"
              >
                {itinerary.status}
              </Badge>
            )}
            <span className="flex items-center gap-1 text-xs font-medium text-brand-red">
              <Star className="size-3.5 fill-current" /> {itinerary.rating}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-medium tracking-[-0.045em]">
              {itinerary.title}
            </h2>
            <p className="text-sm font-medium">{itinerary.note}</p>
            <p className="text-sm leading-6 text-muted-foreground">
              {itinerary.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="rounded-full border-brand-line px-3 py-1 text-muted-foreground"
            >
              {itinerary.days}
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full border-brand-line px-3 py-1 text-muted-foreground"
            >
              {itinerary.category}
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full border-brand-line px-3 py-1 text-muted-foreground"
            >
              {itinerary.stops.length} stops
            </Badge>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-brand-line pt-5">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Heart className="size-4" /> {itinerary.saves} saves
          </span>
          <Link
            href={`/trips/${itinerary.slug}`}
            className="inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium text-brand-blue transition-colors hover:bg-brand-blue-soft"
          >
            View trip <ArrowRight className="size-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
