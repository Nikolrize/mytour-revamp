import { errorResponse } from "@/app/api/_response";
import { getApiContext } from "@/app/api/_shared";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ tripId: string }> },
) {
  const { supabase, user } = await getApiContext();
  if (!user) return errorResponse("Sign in to report a trip.", 401);
  const { tripId } = await context.params;
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return errorResponse("Invalid request body.", 400);
  }
  if (!input || typeof input !== "object")
    return errorResponse("Invalid request body.", 400);
  const body = input as Record<string, unknown>;
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  const details = typeof body.details === "string" ? body.details.trim() : "";
  if (!reason || reason.length > 120 || details.length > 1000)
    return errorResponse(
      "Provide a reason (up to 120 characters) and optional details (up to 1000).",
      400,
    );
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("id, user_id, is_public")
    .eq("id", tripId)
    .maybeSingle();
  if (tripError) return errorResponse(tripError.message, 500);
  if (!trip?.is_public || trip.user_id === user.id)
    return errorResponse("Trip not found or cannot be reported.", 404);
  const { error } = await supabase.from("trip_reports").insert({
    trip_id: tripId,
    reporter_id: user.id,
    reason,
    details: details || null,
  });
  if (error) return errorResponse(error.message, 400);
  return NextResponse.json({ submitted: true }, { status: 201 });
}
