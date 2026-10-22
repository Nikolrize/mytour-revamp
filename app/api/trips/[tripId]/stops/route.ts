import { NextResponse } from "next/server";
import { getApiContext } from "@/app/api/_shared";

type Context = { params: Promise<{ tripId: string }> };

export async function GET(_request: Request, context: Context) {
  const { supabase, user } = await getApiContext();
  const { tripId } = await context.params;
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("id, user_id, is_public")
    .eq("id", tripId)
    .maybeSingle();
  if (tripError)
    return NextResponse.json({ message: tripError.message }, { status: 500 });
  if (!trip || (!trip.is_public && trip.user_id !== user?.id))
    return NextResponse.json({ message: "Trip not found." }, { status: 404 });
  const { data, error } = await supabase
    .from("itinerary_stops")
    .select(
      "id, trip_id, destination_id, title, description, stop_date, start_time, end_time, position, latitude, longitude, notes, created_at",
    )
    .eq("trip_id", tripId)
    .order("stop_date")
    .order("position");
  if (error)
    return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ stops: data ?? [] });
}

export async function POST(request: Request, context: Context) {
  const { supabase, user } = await getApiContext();
  if (!user)
    return NextResponse.json(
      { message: "Sign in to add stops." },
      { status: 401 },
    );
  const { tripId } = await context.params;
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("id")
    .eq("id", tripId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (tripError)
    return NextResponse.json({ message: tripError.message }, { status: 500 });
  if (!trip)
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
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title || title.length > 160)
    return NextResponse.json(
      { message: "Stop name must be between 1 and 160 characters." },
      { status: 400 },
    );
  const numeric = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value) ? value : null;
  const latitude = numeric(body.latitude);
  const longitude = numeric(body.longitude);
  if (
    (latitude !== null && (latitude < -90 || latitude > 90)) ||
    (longitude !== null && (longitude < -180 || longitude > 180))
  )
    return NextResponse.json(
      { message: "Coordinates are outside the valid range." },
      { status: 400 },
    );
  const { data: last } = await supabase
    .from("itinerary_stops")
    .select("position")
    .eq("trip_id", tripId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { data, error } = await supabase
    .from("itinerary_stops")
    .insert({
      trip_id: tripId,
      destination_id:
        typeof body.destinationId === "string" ? body.destinationId : null,
      title,
      description:
        typeof body.description === "string"
          ? body.description.slice(0, 1000)
          : null,
      stop_date: typeof body.date === "string" ? body.date : null,
      start_time: typeof body.startTime === "string" ? body.startTime : null,
      end_time: typeof body.endTime === "string" ? body.endTime : null,
      position:
        Number.isInteger(body.position) && Number(body.position) > 0
          ? Number(body.position)
          : (last?.position ?? 0) + 1,
      latitude,
      longitude,
      notes: typeof body.notes === "string" ? body.notes.slice(0, 1000) : null,
    })
    .select("*")
    .single();
  if (error)
    return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ stop: data }, { status: 201 });
}
