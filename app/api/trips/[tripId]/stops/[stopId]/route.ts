import { errorResponse } from "@/app/api/_response";
import { getApiContext } from "@/app/api/_shared";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ tripId: string; stopId: string }> };

async function authorize(
  supabase: Awaited<ReturnType<typeof getApiContext>>["supabase"],
  tripId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("trips")
    .select("id")
    .eq("id", tripId)
    .eq("user_id", userId)
    .maybeSingle();
  return { allowed: Boolean(data), error };
}

export async function PATCH(request: Request, context: Context) {
  const { supabase, user } = await getApiContext();
  if (!user) return errorResponse("Sign in to edit stops.", 401);
  const { tripId, stopId } = await context.params;
  const access = await authorize(supabase, tripId, user.id);
  if (access.error) return errorResponse(access.error.message, 500);
  if (!access.allowed)
    return errorResponse("Trip not found or you cannot edit it.", 404);
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return errorResponse("Invalid request body.", 400);
  }
  if (!input || typeof input !== "object")
    return errorResponse("Invalid request body.", 400);
  const body = input as Record<string, unknown>;
  const updates: Record<string, string | number | null> = {};
  if (typeof body.title === "string") {
    const value = body.title.trim();
    if (!value || value.length > 160)
      return errorResponse(
        "Stop name must be between 1 and 160 characters.",
        400,
      );
    updates.title = value;
  }
  if (typeof body.description === "string" || body.description === null)
    updates.description = body.description;
  if (typeof body.date === "string" || body.date === null)
    updates.stop_date = body.date;
  if (typeof body.startTime === "string" || body.startTime === null)
    updates.start_time = body.startTime;
  if (typeof body.endTime === "string" || body.endTime === null)
    updates.end_time = body.endTime;
  if (typeof body.notes === "string" || body.notes === null)
    updates.notes = body.notes;
  if (typeof body.destinationId === "string" || body.destinationId === null)
    updates.destination_id = body.destinationId;
  if (
    typeof body.position === "number" &&
    Number.isInteger(body.position) &&
    body.position > 0
  )
    updates.position = body.position;
  if (
    typeof body.day === "number" &&
    Number.isInteger(body.day) &&
    body.day > 0 &&
    body.day <= 31
  )
    updates.day_number = body.day;
  if (
    typeof body.latitude === "number" &&
    Number.isFinite(body.latitude) &&
    body.latitude >= -90 &&
    body.latitude <= 90
  )
    updates.latitude = body.latitude;
  if (
    typeof body.longitude === "number" &&
    Number.isFinite(body.longitude) &&
    body.longitude >= -180 &&
    body.longitude <= 180
  )
    updates.longitude = body.longitude;
  if (!Object.keys(updates).length)
    return errorResponse("No valid stop changes provided.", 400);
  const { data, error } = await supabase
    .from("itinerary_stops")
    .update(updates)
    .eq("id", stopId)
    .eq("trip_id", tripId)
    .select("*")
    .maybeSingle();
  if (error) return errorResponse(error.message, 400);
  if (!data) return errorResponse("Stop not found.", 404);
  await supabase
    .from("trips")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", tripId)
    .eq("user_id", user.id);
  return NextResponse.json({ stop: data });
}

export async function DELETE(_request: Request, context: Context) {
  const { supabase, user } = await getApiContext();
  if (!user) return errorResponse("Sign in to delete stops.", 401);
  const { tripId, stopId } = await context.params;
  const access = await authorize(supabase, tripId, user.id);
  if (access.error) return errorResponse(access.error.message, 500);
  if (!access.allowed)
    return errorResponse("Trip not found or you cannot edit it.", 404);
  const { data, error } = await supabase
    .from("itinerary_stops")
    .delete()
    .eq("id", stopId)
    .eq("trip_id", tripId)
    .select("id")
    .maybeSingle();
  if (error) return errorResponse(error.message, 400);
  if (!data) return errorResponse("Stop not found.", 404);
  await supabase
    .from("trips")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", tripId)
    .eq("user_id", user.id);
  return NextResponse.json({ id: data.id });
}
