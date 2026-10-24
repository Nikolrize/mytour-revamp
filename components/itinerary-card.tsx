import { AuthorProfileLink } from "@/components/author-profile-link";
import { TripStateCover } from "@/components/trip-state-cover";
import { TripStatusBadge } from "@/components/trip-status-badge";
import { TripTags } from "@/components/trip-tags";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ItineraryCardProps } from "@/lib/type";
import { getInitials } from "@/lib/utils";
import { ArrowRight, BookmarkCheck, Heart, MapPin, Star } from "lucide-react";
import Link from "next/link";

export function ItineraryCard({
  itinerary,
  showAuthor = true,
  isSaved = false,
  isOwner = itinerary.isOwner ?? false,
  showStatus = !showAuthor,
}: ItineraryCardProps) {
  const authorLabel = isOwner ? `${itinerary.author} (you)` : itinerary.author;
  return (
    <Card className="grid h-full min-h-[26rem] grid-rows-[11rem_1fr] gap-0 overflow-hidden rounded-[24px] border-brand-line bg-white p-0 shadow-sm">
      <div className="relative min-h-[9rem] bg-brand-blue-soft">
        <TripStateCover trip={itinerary} />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
          aria-hidden="true"
        />
        {/* Status and saved indicators occupy opposite corners of the cover. */}
        {showStatus && (
          <div className="absolute top-3 left-3">
            <TripStatusBadge status={itinerary.status} />
          </div>
        )}
        {isSaved && (
          <Badge className="absolute top-3 right-3 gap-1.5 rounded-full bg-brand-blue px-3 py-1 text-white">
            <BookmarkCheck className="size-3.5" /> Saved
          </Badge>
        )}
        <div className="absolute inset-x-5 bottom-5 flex min-w-0 flex-col gap-1.5 text-white">
          <h2
            className="truncate text-xl font-semibold tracking-tight"
            title={itinerary.title}
          >
            {itinerary.title}
          </h2>

          <p className="flex min-w-0 items-center gap-1 text-xs text-white/90">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{itinerary.location}</span>
          </p>
        </div>
      </div>
      <CardContent className="flex min-w-0 flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            {showAuthor ? (
              <AuthorProfileLink
                authorId={itinerary.authorId}
                className="flex min-w-0 items-center gap-3 rounded-lg hover:text-brand-blue focus-visible:outline-2 focus-visible:outline-brand-blue"
              >
                <Avatar className="size-10 shrink-0">
                  {itinerary.authorAvatar && (
                    <AvatarImage
                      src={itinerary.authorAvatar}
                      alt={itinerary.author}
                    />
                  )}
                  <AvatarFallback className="bg-brand-yellow-soft text-sm font-semibold text-brand-red-deep">
                    {getInitials(itinerary.author)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p
                    className="truncate text-sm font-semibold"
                    title={authorLabel}
                  >
                    {authorLabel}
                  </p>
                </div>
              </AuthorProfileLink>
            ) : null}
            <span className="ml-auto flex shrink-0 items-center gap-1 text-xs font-medium text-brand-red">
              <Star className="size-3.5 fill-current" /> {itinerary.rating}
            </span>
          </div>

          {(itinerary.description || itinerary.note) && (
            <p className="line-clamp-2 break-words text-sm leading-5 text-muted-foreground">
              {itinerary.description || itinerary.note}
            </p>
          )}
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
              {itinerary.stops.length} stops
            </Badge>
          </div>
        </div>
        {!!itinerary.interests?.length && (
          <div className="flex flex-wrap gap-2" aria-label="Trip interests">
            <TripTags interests={itinerary.interests} limit={3} />
          </div>
        )}
        <div className="mt-auto flex shrink-0 items-center justify-between gap-2 border-t border-brand-line pt-3">
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
