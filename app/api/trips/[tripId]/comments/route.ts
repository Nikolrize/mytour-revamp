import { NextResponse } from "next/server";
import { getApiContext } from "@/app/api/_shared";

export async function GET(
  request: Request,
  context: { params: Promise<{ tripId: string }> },
) {
  const page = Number(new URL(request.url).searchParams.get("page") || "1");
  if (!Number.isInteger(page) || page < 1 || page > 100000)
    return NextResponse.json({ message: "Invalid page." }, { status: 400 });
  const { supabase } = await getApiContext();
  const { tripId } = await context.params;
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("id, is_public, user_id")
    .eq("id", tripId)
    .maybeSingle();
  if (tripError)
    return NextResponse.json({ message: tripError.message }, { status: 500 });
  if (!trip?.is_public)
    return NextResponse.json({ message: "Trip not found." }, { status: 404 });
  const makeQuery = (head = false) =>
    supabase
      .from("trip_comments")
      .select("id, user_id, trip_id, content, created_at, updated_at", {
        count: "exact",
        head,
      })
      .eq("trip_id", tripId)
      .neq("user_id", trip.user_id)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
  const counted = await makeQuery(true);
  if (counted.error)
    return NextResponse.json(
      { message: counted.error.message },
      { status: 500 },
    );
  const totalPages = Math.max(1, Math.ceil((counted.count ?? 0) / 12));
  const currentPage = Math.min(page, totalPages);
  const { data: rows, error } = await makeQuery().range(
    (currentPage - 1) * 12,
    currentPage * 12 - 1,
  );
  if (error)
    return NextResponse.json({ message: error.message }, { status: 500 });
  const userIds = [...new Set((rows ?? []).map((row) => row.user_id))];
  const [profiles, ratings] = await Promise.all([
    userIds.length
      ? supabase
          .from("users")
          .select("id, display_name, avatar_url")
          .in("id", userIds)
      : Promise.resolve({ data: [], error: null }),
    userIds.length
      ? supabase
          .from("trip_ratings")
          .select("user_id, rating")
          .eq("trip_id", tripId)
          .in("user_id", userIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (profiles.error || ratings.error)
    return NextResponse.json(
      { message: profiles.error?.message ?? ratings.error?.message },
      { status: 500 },
    );
  const names = new Map(
    (profiles.data ?? []).map((profile) => [profile.id, profile.display_name]),
  );
  const stars = new Map(
    (ratings.data ?? []).map((rating) => [rating.user_id, rating.rating]),
  );
  return NextResponse.json({
    page: currentPage,
    pageSize: 12,
    total: counted.count ?? 0,
    totalPages,
    comments: (rows ?? []).map((row) => ({
      id: row.id,
      author: names.get(row.user_id) || "Traveller",
      authorAvatar:
        profiles.data?.find((profile) => profile.id === row.user_id)
          ?.avatar_url ?? null,
      date: row.created_at,
      rating: stars.get(row.user_id) ?? 0,
      message: row.content,
    })),
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ tripId: string }> },
) {
  const { supabase, user } = await getApiContext();
  if (!user)
    return NextResponse.json(
      { message: "Sign in to comment on a trip." },
      { status: 401 },
    );
  const { tripId } = await context.params;
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }
  if (!input || typeof input !== "object")
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  const body = input as Record<string, unknown>;
  const content = typeof body.message === "string" ? body.message.trim() : "";
  const rating = Number(body.rating);
  if (!content || content.length > 500)
    return NextResponse.json(
      { message: "Comment must be between 1 and 500 characters." },
      { status: 400 },
    );
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return NextResponse.json(
      { message: "Choose a rating from 1 to 5." },
      { status: 400 },
    );
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("id, is_public, user_id")
    .eq("id", tripId)
    .maybeSingle();
  if (tripError)
    return NextResponse.json({ message: tripError.message }, { status: 500 });
  if (!trip?.is_public)
    return NextResponse.json(
      { message: "Trip not found or not shared." },
      { status: 404 },
    );
  if (trip.user_id === user.id)
    return NextResponse.json(
      { message: "You cannot rate or review your own trip." },
      { status: 403 },
    );
  const { error: ratingError } = await supabase.from("trip_ratings").upsert(
    {
      user_id: user.id,
      trip_id: tripId,
      rating,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,trip_id" },
  );
  if (ratingError)
    return NextResponse.json({ message: ratingError.message }, { status: 400 });
  const { data: row, error } = await supabase
    .from("trip_comments")
    .insert({ user_id: user.id, trip_id: tripId, content })
    .select("id, content, created_at")
    .single();
  if (error)
    return NextResponse.json({ message: error.message }, { status: 400 });
  const { data: profile } = await supabase
    .from("users")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();
  return NextResponse.json(
    {
      comment: {
        id: row.id,
        author: profile?.display_name || "Traveller",
        authorAvatar: profile?.avatar_url ?? null,
        date: row.created_at,
        rating,
        message: row.content,
      },
    },
    { status: 201 },
  );
}
