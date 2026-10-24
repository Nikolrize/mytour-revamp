import { NextResponse } from "next/server";
import { getApiContext } from "@/app/api/_shared";

export async function POST(
  _request: Request,
  context: { params: Promise<{ tripId: string }> },
) {
  const { supabase, user } = await getApiContext();
  if (!user)
    return NextResponse.json(
      { message: "Sign in to save trips." },
      { status: 401 },
    );
  const { tripId } = await context.params;
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("id, is_public")
    .eq("id", tripId)
    .maybeSingle();
  if (tripError)
    return NextResponse.json({ message: tripError.message }, { status: 500 });
  if (!trip?.is_public)
    return NextResponse.json({ message: "Trip not found." }, { status: 404 });
  const { error } = await supabase
    .from("saved_trips")
    .upsert(
      { user_id: user.id, trip_id: tripId },
      { onConflict: "user_id,trip_id", ignoreDuplicates: true },
    );
  if (error)
    return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ saved: true });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ tripId: string }> },
) {
  const { supabase, user } = await getApiContext();
  if (!user)
    return NextResponse.json(
      { message: "Sign in to manage saved trips." },
      { status: 401 },
    );
  const { tripId } = await context.params;
  const { error } = await supabase
    .from("saved_trips")
    .delete()
    .eq("user_id", user.id)
    .eq("trip_id", tripId);
  if (error)
    return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ saved: false });
}

// The saved state is independent of which library page is currently loaded.
export async function GET(
  _request: Request,
  context: { params: Promise<{ tripId: string }> },
) {
  const { supabase, user } = await getApiContext();
  if (!user)
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  const { tripId } = await context.params;
  const result = await supabase
    .from("saved_trips")
    .select("trip_id")
    .eq("user_id", user.id)
    .eq("trip_id", tripId)
    .maybeSingle();
  if (result.error)
    return NextResponse.json(
      { message: "Could not load saved status." },
      { status: 500 },
    );
  return NextResponse.json(
    { saved: Boolean(result.data) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
