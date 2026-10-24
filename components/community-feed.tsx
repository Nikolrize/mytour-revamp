"use client";

import { useState } from "react";
import { ItineraryPagination } from "@/components/itinerary-pagination";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  MessageCircle,
  ArrowRight,
  MapPin,
  Route,
  Users,
  Search,
  Plus,
} from "lucide-react";
import type { CommunityPost } from "@/lib/type";
import {
  useCommunityPosts,
  useCommunityPostActions,
} from "@/hooks/use-community";
import { useProfile } from "@/hooks/use-profile";
import { useTripActions } from "@/hooks/use-trips";
import {
  CommunityPostText,
  CommunityPostPhotos,
} from "@/components/community-post-content";
import { CommunityAuthor } from "@/components/community-author";
import { CommunityComposer } from "@/components/community-composer";
import { CommunityComments } from "@/components/community-comments";
import { CommunityReport } from "@/components/community-report";
import { CommunityDelete } from "@/components/community-delete";
import { TripTags } from "@/components/trip-tags";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function AttachedItinerary({
  post,
  signedIn,
}: {
  post: CommunityPost;
  signedIn: boolean;
}) {
  const router = useRouter();
  const { copy } = useTripActions(post.trip?.slug || "");
  if (!post.trip)
    return post.attachmentUnavailable ? (
      <p className="rounded-xl bg-brand-surface-muted p-4 text-sm text-muted-foreground">
        The attached itinerary is private or no longer available.
      </p>
    ) : null;
  const trip = post.trip;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-brand-line bg-brand-blue-soft/40 p-4">
      <div className="flex items-start gap-3">
        <Route className="size-5 shrink-0 text-brand-blue" />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-xs text-muted-foreground">
            Itinerary used for this trip
          </span>
          <Link
            href={`/trips/${trip.slug}`}
            className="font-semibold text-brand-blue hover:underline"
          >
            {trip.title}
          </Link>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            {trip.location} · {trip.days} · {trip.stops.length} stops
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <TripTags interests={trip.interests} limit={3} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          nativeButton={false}
          render={<Link href={`/trips/${trip.slug}`} />}
          variant="outline"
          size="sm"
          className="rounded-full"
        >
          View itinerary <ArrowRight className="size-3.5" />
        </Button>
        {!post.tripIsOwner && (
          <Button
            size="sm"
            disabled={copy.isPending}
            onClick={() =>
              signedIn
                ? copy.mutate(undefined, {
                    onSuccess: ({ id }) => router.push(`/trips/${id}`),
                  })
                : router.push("/login")
            }
            className="rounded-full"
          >
            {copy.isPending ? "Copying…" : "Copy itinerary"}
          </Button>
        )}
      </div>
      {copy.error && (
        <p role="alert" className="text-sm text-destructive">
          {copy.error.message}
        </p>
      )}
    </div>
  );
}

function CommunityPostCard({
  post,
  signedIn,
}: {
  post: CommunityPost;
  signedIn: boolean;
}) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const { like, remove } = useCommunityPostActions(post.id);
  return (
    <Card className="overflow-hidden rounded-3xl border-brand-line bg-white shadow-none">
      <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
        {/* Story author, text, and photos */}
        <div className="flex items-start justify-between gap-3">
          <CommunityAuthor author={post.author} createdAt={post.createdAt} />
          <div className="flex shrink-0 items-center gap-1">
            {post.canReport && (
              <CommunityReport postId={post.id} signedIn={signedIn} />
            )}
            {post.canDelete && (
              <CommunityDelete
                kind="post"
                pending={remove.isPending}
                error={remove.error?.message}
                onConfirm={() => remove.mutateAsync()}
              />
            )}
          </div>
        </div>
        {post.content && <CommunityPostText content={post.content} />}
        {!!post.images.length && (
          <CommunityPostPhotos images={post.images} author={post.author.name} />
        )}
        <AttachedItinerary post={post} signedIn={signedIn} />
        {/* Social interactions are independent of itinerary ratings and saves. */}
        <div className="flex flex-wrap items-center gap-2 border-t border-brand-line pt-3">
          {signedIn ? (
            <Button
              variant="ghost"
              size="sm"
              disabled={like.isPending}
              aria-pressed={post.liked}
              onClick={() => like.mutate(!post.liked)}
              className={`rounded-full ${post.liked ? "text-brand-red" : "text-brand-blue"}`}
            >
              <Heart className={`size-4 ${post.liked ? "fill-current" : ""}`} />
              {post.likeCount} {post.likeCount === 1 ? "like" : "likes"}
            </Button>
          ) : (
            <Button
              nativeButton={false}
              render={<Link href="/login" />}
              variant="ghost"
              size="sm"
              className="rounded-full"
            >
              <Heart className="size-4" />
              {post.likeCount} likes
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={commentsOpen}
            onClick={() => setCommentsOpen((value) => !value)}
            className="rounded-full text-brand-blue hover:bg-brand-blue-soft hover:text-brand-blue"
          >
            <MessageCircle className="size-4" />
            {post.commentCount}{" "}
            {post.commentCount === 1 ? "comment" : "comments"}
          </Button>
        </div>
        {like.error && (
          <p role="alert" className="text-sm text-destructive">
            {like.error.message}
          </p>
        )}
        {commentsOpen && (
          <CommunityComments postId={post.id} signedIn={signedIn} />
        )}
      </CardContent>
    </Card>
  );
}

export function CommunityFeed({
  moderation = false,
  postId = "",
}: {
  moderation?: boolean;
  postId?: string;
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [draftSearch, setDraftSearch] = useState("");
  const [kind, setKind] = useState("all");
  const [sort, setSort] = useState("newest");
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(postId);
  const feed = useCommunityPosts({
    search,
    kind,
    sort,
    postId: selectedPost,
    page,
  });
  const hasFilters = Boolean(
    search || kind !== "all" || sort !== "newest" || selectedPost,
  );
  function clearFilters() {
    setPage(1);
    setSelectedPost("");
    setSearch("");
    setDraftSearch("");
    setKind("all");
    setSort("newest");
  }
  const { profileQuery } = useProfile();
  const profile = profileQuery.data?.profile;
  const posts = feed.data?.posts ?? [];
  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      {/* Browse stories before opening the optional post composer. */}
      <div className="flex flex-col gap-4 rounded-2xl border border-brand-line bg-white p-4 sm:p-5">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSearch(draftSearch.trim());
            setPage(1);
          }}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Label htmlFor="community-search">Search stories</Label>
            <div className="flex items-center gap-2 rounded-xl border border-brand-line px-3">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <Input
                id="community-search"
                value={draftSearch}
                onChange={(event) => setDraftSearch(event.target.value)}
                maxLength={200}
                placeholder="Search post text or author"
                className="h-10 border-0 px-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
          <Button
            type="submit"
            className="h-10 rounded-full bg-brand-blue px-5 text-white hover:bg-brand-blue-hover"
          >
            Search
          </Button>
        </form>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex min-w-0 basis-full flex-col gap-2 sm:basis-0 sm:flex-1">
            <Label htmlFor="community-kind">Post Type</Label>
            <Select
              value={kind}
              onValueChange={(value) => {
                setKind(value ?? "all");
                setPage(1);
              }}
            >
              <SelectTrigger
                id="community-kind"
                className="h-10 w-full rounded-xl"
              >
                <SelectValue>
                  {kind === "photos"
                    ? "With Photos"
                    : kind === "itinerary"
                      ? "With Itinerary"
                      : "All Posts"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="photos">With Photos</SelectItem>
                <SelectItem value="itinerary">With Itinerary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex min-w-0 basis-full flex-col gap-2 sm:basis-0 sm:flex-1">
            <Label htmlFor="community-sort">Sort By</Label>
            <Select
              value={sort}
              onValueChange={(value) => {
                setSort(value ?? "newest");
                setPage(1);
              }}
            >
              <SelectTrigger
                id="community-sort"
                className="h-10 w-full rounded-xl"
              >
                <SelectValue>
                  {sort === "oldest" ? "Oldest First" : "Newest First"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {hasFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="rounded-full"
            >
              Clear filters
            </Button>
          )}
        </div>
        {!moderation && (
          <div className="flex justify-end border-t border-brand-line pt-4">
            {profile ? (
              <Dialog open={composerOpen} onOpenChange={setComposerOpen}>
                <DialogTrigger
                  render={
                    <Button className="h-10 rounded-full bg-brand-blue px-5 text-white hover:bg-brand-blue-hover" />
                  }
                >
                  <Plus className="size-4" />
                  Create post
                </DialogTrigger>
                <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create a post</DialogTitle>
                    <DialogDescription>
                      Share a story, optional photos, and an itinerary if you
                      like.
                    </DialogDescription>
                  </DialogHeader>
                  <CommunityComposer
                    author={{
                      name: profile.display_name,
                      avatarUrl: profile.avatar_url,
                    }}
                    onPublished={() => setComposerOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            ) : (
              <Button
                disabled={profileQuery.isPending}
                nativeButton={false}
                render={<Link href="/login" />}
                className="rounded-full"
              >
                <Plus className="size-4" />
                Create post
              </Button>
            )}
          </div>
        )}
      </div>
      <section
        id="community-results"
        aria-busy={feed.isFetching}
        aria-label={moderation ? "Community post moderation" : "Community feed"}
        className="flex scroll-mt-28 flex-col gap-6"
      >
        {feed.isPending && (
          <p className="text-sm text-muted-foreground">
            Loading travel stories…
          </p>
        )}
        {feed.error && (
          <div
            role="alert"
            className="flex flex-col items-start gap-3 rounded-2xl border border-destructive/30 p-5"
          >
            <p className="text-sm text-destructive">{feed.error.message}</p>
            <Button variant="outline" size="sm" onClick={() => feed.refetch()}>
              Try again
            </Button>
          </div>
        )}
        {!feed.isPending && !feed.error && !posts.length && (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-brand-line p-10 text-center">
            <Users className="size-8 text-brand-blue" />
            <h2 className="font-semibold">
              {hasFilters ? "No matching posts" : "No stories yet"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {hasFilters
                ? "Try another search or post type."
                : "Travel stories shared by the community will appear here."}
            </p>
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        )}
        {posts.map((post) => (
          <CommunityPostCard
            key={post.id}
            post={post}
            signedIn={Boolean(profile)}
          />
        ))}
        <ItineraryPagination
          label="Community pages"
          page={feed.data?.page ?? page}
          totalPages={feed.data?.totalPages ?? 1}
          busy={feed.isFetching}
          onPageChange={(next) => {
            setPage(next);
            document
              .getElementById("community-results")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      </section>
    </div>
  );
}
