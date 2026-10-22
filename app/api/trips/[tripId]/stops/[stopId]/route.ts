import { NextResponse } from "next/server";
import { getApiContext } from "@/app/api/_shared";

type Context = { params: Promise<{ tripId: string; stopId: string }> };

async function authorize(
  supabase: Awaited<
    ReturnType<typeof import("@/app/api/_shared").getApiContext>
  >["supabase"],
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
  if (!user)
    return NextResponse.json(
      { message: "Sign in to edit stops." },
      { status: 401 },
    );
  const { tripId, stopId } = await context.params;
  const access = await authorize(supabase, tripId, user.id);
  if (access.error)
    return NextResponse.json(
      { message: access.error.message },
      { status: 500 },
    );
  if (!access.allowed)
    return NextResponse.json(
      { message: "Trip not found or you cannot edit it." },
      { status: 404 },
    );
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
  const updates: Record<string, string | number | null> = {};
  if (typeof body.title === "string") {
    const value = body.title.trim();
    if (!value || value.length > 160)
      return NextResponse.json(
        { message: "Stop name must be between 1 and 160 characters." },
        { status: 400 },
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
    return NextResponse.json(
      { message: "No valid stop changes provided." },
      { status: 400 },
    );
  const { data, error } = await supabase
    .from("itinerary_stops")
    .update(updates)
    .eq("id", stopId)
    .eq("trip_id", tripId)
    .select("*")
    .maybeSingle();
  if (error)
    return NextResponse.json({ message: error.message }, { status: 400 });
  if (!data)
    return NextResponse.json({ message: "Stop not found." }, { status: 404 });
  await supabase
    .from("trips")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", tripId)
    .eq("user_id", user.id);
  return NextResponse.json({ stop: data });
}

export async function DELETE(_request: Request, context: Context) {
  const { supabase, user } = await getApiContext();
  if (!user)
    return NextResponse.json(
      { message: "Sign in to delete stops." },
      { status: 401 },
    );
  const { tripId, stopId } = await context.params;
  const access = await authorize(supabase, tripId, user.id);
  if (access.error)
    return NextResponse.json(
      { message: access.error.message },
      { status: 500 },
    );
  if (!access.allowed)
    return NextResponse.json(
      { message: "Trip not found or you cannot edit it." },
      { status: 404 },
    );
  const { data, error } = await supabase
    .from("itinerary_stops")
    .delete()
    .eq("id", stopId)
    .eq("trip_id", tripId)
    .select("id")
    .maybeSingle();
  if (error)
    return NextResponse.json({ message: error.message }, { status: 400 });
  if (!data)
    return NextResponse.json({ message: "Stop not found." }, { status: 404 });
  await supabase
    .from("trips")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", tripId)
    .eq("user_id", user.id);
  return NextResponse.json({ id: data.id });
}
