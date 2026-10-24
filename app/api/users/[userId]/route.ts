import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiContext, mapTripsToItineraries, type TripRow } from "@/app/api/_shared";
import type { Itinerary, CommunityPost } from "@/lib/type";
import { mapPosts } from "@/app/api/community/_shared";

// Public profiles expose only active travellers and their publicly shared content.
export async function GET(request: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params;
  const params = new URL(request.url).searchParams;
  const parsed = z.object({
    userId: z.guid(),
    page: z.coerce.number().int().min(1).max(100000),
    kind: z.enum(["trips", "posts"]),
  }).safeParse({ userId, page: params.get("page") ?? 1, kind: params.get("kind") ?? "trips" });
  if (!parsed.success) return NextResponse.json({ message: "Invalid traveller profile request." }, { status: 400 });
  const api = await getApiContext();
  const person = await api.supabase.from("users").select("id,display_name,avatar_url,bio,created_at")
    .eq("id",userId).eq("role","client").eq("status","active").maybeSingle();
  if (person.error) return NextResponse.json({ message: "Could not load traveller profile." }, { status: 500 });
  if (!person.data) return NextResponse.json({ message: "Traveller profile not found." }, { status: 404 });
  const [trips,posts] = await Promise.all([
    api.supabase.from("trips").select("id",{count:"exact",head:true}).eq("user_id",userId).eq("is_public",true),
    api.supabase.from("community_posts").select("id",{count:"exact",head:true}).eq("user_id",userId),
  ]);
  if (trips.error || posts.error) return NextResponse.json({ message: "Could not load shared activity." }, { status: 500 });
  const counts = { trips: trips.count ?? 0, posts: posts.count ?? 0 };
  const total = counts[parsed.data.kind];
  const totalPages = Math.max(1,Math.ceil(total/12));
  const page = Math.min(parsed.data.page,totalPages);
  try {
    let sharedTrips: Itinerary[] = [];
    let sharedPosts: CommunityPost[] = [];
    if (parsed.data.kind === "trips") {
      const result = await api.supabase.from("trips").select("*").eq("user_id",userId).eq("is_public",true)
        .order("created_at",{ascending:false}).order("id",{ascending:false}).range((page-1)*12,page*12-1);
      if (result.error) throw result.error;
      sharedTrips = await mapTripsToItineraries(api.supabase,(result.data ?? []) as TripRow[]);
    } else {
      const result = await api.supabase.from("community_posts").select("id,user_id,content,image_paths,trip_id,created_at").eq("user_id",userId)
        .order("created_at",{ascending:false}).order("id",{ascending:false}).range((page-1)*12,page*12-1);
      if (result.error) throw result.error;
      sharedPosts = await mapPosts(api,result.data ?? []);
    }
    return NextResponse.json({ profile:person.data,counts,trips:sharedTrips,posts:sharedPosts,page,pageSize:12,total,totalPages,
      isOwnProfile:api.user?.id===userId,signedIn:Boolean(api.user) },{headers:{"Cache-Control":"private, no-store"}});
  } catch {
    return NextResponse.json({message:"Could not load this traveller's shared content."},{status:500});
  }
}
