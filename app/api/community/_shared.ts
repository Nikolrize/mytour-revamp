import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getApiContext,
  mapTripsToItineraries,
  userIsAdmin,
  type TripRow,
} from "@/app/api/_shared";
import type { CommunityAuthor, CommunityPost } from "@/lib/type";

export const photoBucket = "community-photos";
export const uuid = z.string().uuid();
export type CommunityContext = Awaited<ReturnType<typeof getApiContext>>;
export function communityError(error: { code?: string; message: string }) {
  const missing = ["42P01", "PGRST205", "PGRST202", "42883"].includes(
    error.code || "",
  );
  return NextResponse.json(
    {
      message: missing
        ? "Community needs a database update. Run 20261023_add_social_community.sql in Supabase first."
        : "Could not complete this community request. Please try again.",
    },
    { status: missing ? 503 : 500 },
  );
}
export async function authors(context: CommunityContext, ids: string[]) {
  const result = await context.supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", [...new Set(ids)]);
  if (result.error) throw result.error;
  return new Map<string, CommunityAuthor>(
    (result.data ?? []).map((row) => [
      row.id,
      { name: row.display_name || "Traveller", avatarUrl: row.avatar_url },
    ]),
  );
}
export async function postExists(context: CommunityContext, id: string) {
  const result = await context.supabase
    .from("community_posts")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  return result;
}

type PostRow = {
  id: string;
  user_id: string;
  content: string;
  image_paths: string[];
  trip_id: string | null;
  created_at: string;
};
export async function mapPosts(
  context: CommunityContext,
  rows: PostRow[],
): Promise<CommunityPost[]> {
  if (!rows.length) return [];
  const ids = rows.map((post) => post.id);
  const tripIds = [
    ...new Set(rows.flatMap((post) => (post.trip_id ? [post.trip_id] : []))),
  ];
  const [people, stats, trips, admin] = await Promise.all([
    authors(
      context,
      rows.map((post) => post.user_id),
    ),
    context.supabase.rpc("get_community_post_stats", { _post_ids: ids }),
    tripIds.length
      ? context.supabase
          .from("trips")
          .select("*")
          .in("id", tripIds)
          .eq("is_public", true)
      : Promise.resolve({ data: [], error: null }),
    context.user
      ? userIsAdmin(context.supabase, context.user.id)
      : Promise.resolve(false),
  ]);
  if (stats.error) throw stats.error;
  if (trips.error) throw trips.error;
  const mapped = await mapTripsToItineraries(
    context.supabase,
    (trips.data ?? []) as TripRow[],
  );
  const byId = new Map(mapped.map((trip) => [trip.slug, trip]));
  const statsById = new Map<
    string,
    { like_count: number; comment_count: number; liked: boolean }
  >(
    (stats.data ?? []).map(
      (row: {
        post_id: string;
        like_count: number;
        comment_count: number;
        liked: boolean;
      }) => [row.post_id, row],
    ),
  );
  return rows.map((post) => ({
    id: post.id,
    content: post.content,
    createdAt: post.created_at,
    author: people.get(post.user_id) ?? { name: "Traveller", avatarUrl: null },
    images: post.image_paths.map(
      (path) =>
        context.supabase.storage.from(photoBucket).getPublicUrl(path).data
          .publicUrl,
    ),
    canDelete: post.user_id === context.user?.id || admin,
    likeCount: Number(statsById.get(post.id)?.like_count ?? 0),
    commentCount: Number(statsById.get(post.id)?.comment_count ?? 0),
    liked: statsById.get(post.id)?.liked ?? false,
    trip: post.trip_id ? (byId.get(post.trip_id) ?? null) : null,
    tripIsOwner: Boolean(
      post.trip_id &&
      (trips.data ?? []).some(
        (trip) => trip.id === post.trip_id && trip.user_id === context.user?.id,
      ),
    ),
    attachmentUnavailable: Boolean(post.trip_id && !byId.has(post.trip_id)),
  }));
}
