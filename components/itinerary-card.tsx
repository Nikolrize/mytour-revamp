import Link from "next/link";
import { ArrowRight, Heart, MapPin, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Itinerary } from "@/lib/type";
import { getInitials } from "@/lib/utils";

type ItineraryCardProps = {
  itinerary: Itinerary;
  showAuthor?: boolean;
};

export function ItineraryCard({
  itinerary,
  showAuthor = true,
}: ItineraryCardProps) {
  return (
    <Card
      className="grid h-[33rem] grid-rows-[11rem_minmax(0,1fr)] overflow-hidden rounded-[24px] border-brand-line bg-white p-0 shadow-sm sm:h-[31rem]"
    >
      <div
        className="relative min-h-[9rem] bg-brand-blue-soft"
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
          {itinerary.category.toUpperCase()}
        </Badge>
        <p className="absolute bottom-5 left-5 flex items-center gap-1 text-xs text-white">
          <MapPin className="size-3.5" /> {itinerary.location}
        </p>
      </div>
      <CardContent className="flex min-h-0 flex-col justify-between gap-4 overflow-hidden p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            {showAuthor ? (
              <div className="flex items-center gap-3">
                <Avatar className="size-10 shrink-0">
                  <AvatarFallback className="bg-brand-yellow-soft text-sm font-semibold text-brand-red-deep">
                    {getInitials(itinerary.author)}
                  </AvatarFallback>
                </Avatar>
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
            <h2 className="text-xl font-medium tracking-[-0.045em]">
              {itinerary.title}
            </h2>
            <p className="text-sm font-medium">{itinerary.note}</p>
            <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">
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
        <div className="flex items-center justify-between border-t border-brand-line pt-4">
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
