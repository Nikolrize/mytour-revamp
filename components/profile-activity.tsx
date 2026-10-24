"use client";

import type { PublicProfileResponse, TripPageResponse, ProfileActivityKind } from "@/lib/type";
import { Button } from "@/components/ui/button";
import { ItineraryCard } from "@/components/itinerary-card";
import { CommunityPostCard } from "@/components/community-feed";
import { ItineraryPagination } from "@/components/itinerary-pagination";
import { TripCardGridSkeleton, CommunityFeedSkeleton } from "@/components/loading-skeletons";

// Both profile views use the same paginated public activity presentation.
export function ProfileActivity({ kind, onKindChange, page, onPageChange, data, recentData, includeRecent = false, pending, fetching, error }: {
  kind: ProfileActivityKind; onKindChange: (kind: ProfileActivityKind) => void; page: number; onPageChange: (page: number) => void;
  data?: PublicProfileResponse; recentData?: TripPageResponse; includeRecent?: boolean; pending: boolean; fetching: boolean; error?: Error | null;
}) {
  const pageData = kind === "recent" ? recentData : data;
  const itineraries = kind === "recent" ? recentData?.trips : data?.trips;
  const tabs: ProfileActivityKind[] = includeRecent ? ["recent","trips","posts"] : ["trips","posts"];
  const label = kind === "recent" ? "recent itineraries" : kind === "trips" ? "shared itineraries" : "Community posts";
  return <section className="flex flex-col gap-5" aria-label="Shared activity">
    <div className="flex flex-wrap gap-2" role="group" aria-label="Profile activity">
      {tabs.map((value) => <Button key={value} variant={kind===value ? "default":"outline"} aria-pressed={kind===value} className="rounded-full" onClick={() => onKindChange(value)}>{value==="recent" ? "Recent itineraries" : value==="trips" ? "Shared itineraries":"Community posts"}</Button>)}
    </div>
    {error ? <p role="alert" className="text-sm text-destructive">{error.message}</p> : pending ? (kind!=="posts" ? <TripCardGridSkeleton />:<CommunityFeedSkeleton />) : pageData?.total===0 ? <p className="rounded-2xl border border-dashed border-brand-line p-8 text-center text-sm text-muted-foreground">No {label} yet.</p> : kind!=="posts" ?
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{itineraries?.map((trip) => <ItineraryCard key={trip.slug} itinerary={trip} isOwner={kind === "recent" || Boolean(data?.isOwnProfile)} />)}</div> :
      <div className="flex flex-col gap-6">{data?.posts.map((post) => <CommunityPostCard key={post.id} post={post} signedIn={data.signedIn} />)}</div>}
    {!error && <ItineraryPagination label="Traveller activity pages" page={pageData?.page ?? page} totalPages={pageData?.totalPages ?? 1} busy={fetching} onPageChange={onPageChange} />}
  </section>;
}
