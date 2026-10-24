import { errorResponse } from "@/app/api/_response";
import { getApiContext } from "@/app/api/_shared";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  context: { params: Promise<{ tripId: string }> },
) {
  const { supabase, user } = await getApiContext();
  if (!user) return errorResponse("Sign in to save trips.", 401);
  const { tripId } = await context.params;
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("id, is_public")
    .eq("id", tripId)
    .maybeSingle();
  if (tripError) return errorResponse(tripError.message, 500);
  if (!trip?.is_public) return errorResponse("Trip not found.", 404);
  const { error } = await supabase
    .from("saved_trips")
    .upsert(
      { user_id: user.id, trip_id: tripId },
      { onConflict: "user_id,trip_id", ignoreDuplicates: true },
    );
  if (error) return errorResponse(error.message, 400);
  return NextResponse.json({ saved: true });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ tripId: string }> },
) {
  const { supabase, user } = await getApiContext();
  if (!user) return errorResponse("Sign in to manage saved trips.", 401);
  const { tripId } = await context.params;
  const { error } = await supabase
    .from("saved_trips")
    .delete()
    .eq("user_id", user.id)
    .eq("trip_id", tripId);
  if (error) return errorResponse(error.message, 400);
  return NextResponse.json({ saved: false });
}

// The saved state is independent of which library page is currently loaded.
export async function GET(
  _request: Request,
  context: { params: Promise<{ tripId: string }> },
) {
  const { supabase, user } = await getApiContext();
  if (!user) return errorResponse("Sign in required.", 401);
  const { tripId } = await context.params;
  const result = await supabase
    .from("saved_trips")
    .select("trip_id")
    .eq("user_id", user.id)
    .eq("trip_id", tripId)
    .maybeSingle();
  if (result.error) return errorResponse("Could not load saved status.", 500);
  return NextResponse.json(
    { saved: Boolean(result.data) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
