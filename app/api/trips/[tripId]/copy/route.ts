import { getTripInterests } from "@/lib/trip-interests";
import { NextResponse } from "next/server";
import { getApiContext } from "@/app/api/_shared";
import { POST as createTrip } from "@/app/api/trips/route";

export async function POST(
  request: Request,
  context: { params: Promise<{ tripId: string }> },
) {
  const { supabase, user } = await getApiContext();
  if (!user)
    return NextResponse.json(
      { message: "Sign in to copy this trip." },
      { status: 401 },
    );
  const { tripId } = await context.params;
  const { data: trip, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .maybeSingle();
  if (error)
    return NextResponse.json(
      { message: "Could not load this trip." },
      { status: 500 },
    );
  if (!trip || (!trip.is_public && trip.user_id !== user.id))
    return NextResponse.json({ message: "Trip not found." }, { status: 404 });
  const [links, stops] = await Promise.all([
    supabase.from("trip_states").select("state_id").eq("trip_id", tripId),
    supabase
      .from("itinerary_stops")
      .select("*")
      .eq("trip_id", tripId)
      .order("position"),
  ]);
  if (links.error || stops.error)
    return NextResponse.json(
      { message: "Could not copy this itinerary." },
      { status: 500 },
    );
  const { data: states, error: stateError } = await supabase
    .from("states")
    .select("name")
    .in(
      "id",
      (links.data ?? []).map((link) => link.state_id),
    );
  if (stateError)
    return NextResponse.json(
      { message: "Could not load trip states." },
      { status: 500 },
    );
  // Reuse the standard creation path: the copy belongs to the current user and is private.
  return createTrip(
    new Request(request.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `${trip.title.slice(0, 70)} (copy)`,
        description: trip.description,
        interests: getTripInterests(trip.interests, trip.description),
        states: (states ?? []).map((state) => state.name),
        startDate: trip.start_date,
        endDate: trip.end_date,
        startTime: trip.start_time,
        endTime: trip.end_time,
        stops: (stops.data ?? []).map((stop) => ({
          ...(stop.destination_id
            ? { destinationId: String(stop.destination_id) }
            : {}),
          title: stop.title,
          description: stop.description,
          day: stop.day_number,
          date: stop.stop_date,
          startTime: stop.start_time,
          endTime: stop.end_time,
          latitude: stop.latitude,
          longitude: stop.longitude,
          notes: stop.notes,
        })),
      }),
    }),
  );
}
