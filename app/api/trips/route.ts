import { z } from "zod";
import { tripInterestOptions } from "@/lib/data";
import { NextResponse } from "next/server";
import {
  getApiContext,
  mapTripsToItineraries,
  removeIncompleteTrip,
  type TripRow,
} from "@/app/api/_shared";

function normalizeStateName(value: string) {
  const name = value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
  if (name === "pulau pinang" || name === "pinang") return "penang";
  return name.replace(/^(pulau|wilayah persekutuan)\s+/, "");
}

export async function GET(request: Request) {
  const { supabase, user } = await getApiContext();
  const url = new URL(request.url);
  const scope = url.searchParams.get("scope") ?? "mine";
  if (!["mine", "public", "saved"].includes(scope))
    return NextResponse.json(
      { message: "Choose a valid trip scope." },
      { status: 400 },
    );

  if (scope !== "public" && !user) {
    return NextResponse.json(
      { message: "Sign in to view your trips." },
      { status: 401 },
    );
  }

  if (scope === "saved") {
    const { data: saves, error: savesError } = await supabase
      .from("saved_trips")
      .select("trip_id")
      .eq("user_id", user!.id)
      .order("saved_at", { ascending: false });
    if (savesError)
      return NextResponse.json(
        { message: savesError.message },
        { status: 500 },
      );
    const ids = (saves ?? []).map((row) => row.trip_id);
    if (!ids.length) return NextResponse.json({ trips: [] });
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .in("id", ids)
      .eq("is_public", true);
    if (error)
      return NextResponse.json({ message: error.message }, { status: 500 });
    const ordered = ids
      .map((id) => (data ?? []).find((trip) => trip.id === id))
      .filter((trip) => trip !== undefined) as TripRow[];
    try {
      return NextResponse.json({
        trips: await mapTripsToItineraries(supabase, ordered),
      });
    } catch (cause) {
      return NextResponse.json(
        {
          message:
            cause instanceof Error
              ? cause.message
              : "Could not load saved trips.",
        },
        { status: 500 },
      );
    }
  }

  let query = supabase
    .from("trips")
    .select("*")
    .order("created_at", { ascending: false });
  if (scope === "public") query = query.eq("is_public", true);
  else query = query.eq("user_id", user!.id);

  const { data, error } = await query;
  if (error)
    return NextResponse.json({ message: error.message }, { status: 500 });

  try {
    const trips = await mapTripsToItineraries(
      supabase,
      (data ?? []) as TripRow[],
    );
    return NextResponse.json({ trips });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Could not load trips.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const { supabase, user } = await getApiContext();
  if (!user)
    return NextResponse.json(
      { message: "Sign in to create a trip." },
      { status: 401 },
    );

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  const input = body as Record<string, unknown>;
  const parsedInterests = z
    .array(z.enum(tripInterestOptions))
    .max(tripInterestOptions.length)
    .default([])
    .safeParse(input.interests);
  if (!parsedInterests.success)
    return NextResponse.json(
      { message: "Choose valid trip interests." },
      { status: 400 },
    );
  const interests = [...new Set(parsedInterests.data)];
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description =
    typeof input.description === "string"
      ? input.description.trim() || null
      : null;
  const stateNames = Array.isArray(input.states)
    ? [
        ...new Set(
          input.states
            .filter((value): value is string => typeof value === "string")
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      ]
    : [];
  const startDate =
    typeof input.startDate === "string" ? input.startDate : null;
  const endDate = typeof input.endDate === "string" ? input.endDate : null;
  const startTime =
    typeof input.startTime === "string" ? input.startTime : null;
  const endTime = typeof input.endTime === "string" ? input.endTime : null;
  const stops = Array.isArray(input.stops) ? input.stops : [];

  if (description && description.length > 2000)
    return NextResponse.json(
      { message: "Descriptions can be up to 2,000 characters." },
      { status: 400 },
    );
  if (!title || title.length > 80) {
    return NextResponse.json(
      { message: "Trip name must be between 1 and 80 characters." },
      { status: 400 },
    );
  }
  if (!stateNames.length || stateNames.length > 16) {
    return NextResponse.json(
      { message: "Choose at least one valid Malaysian state or territory." },
      { status: 400 },
    );
  }
  if (startDate && endDate && endDate < startDate) {
    return NextResponse.json(
      { message: "The trip end date must be after its start date." },
      { status: 400 },
    );
  }
  if (stops.length > 200) {
    return NextResponse.json(
      { message: "A trip can have up to 200 stops." },
      { status: 400 },
    );
  }

  const { data: allStates, error: stateError } = await supabase
    .from("states")
    .select("id, name");
  if (stateError)
    return NextResponse.json({ message: stateError.message }, { status: 500 });
  const statesByName = new Map(
    (allStates ?? []).map((state) => [normalizeStateName(state.name), state]),
  );
  const stateRows = stateNames.map((name) =>
    statesByName.get(normalizeStateName(name)),
  );
  if (stateRows.some((state) => !state)) {
    return NextResponse.json(
      {
        message: `Selected state not found in Supabase: ${stateNames[stateRows.findIndex((state) => !state)]}. Refresh the planner and choose an available state.`,
      },
      { status: 400 },
    );
  }
  const matchedStateRows = stateRows.filter((state) => state !== undefined);

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .insert({
      user_id: user.id,
      title,
      description,
      interests,
      start_date: startDate,
      end_date: endDate,
      start_time: startTime,
      end_time: endTime,
      status: "planning",
      is_public: false,
    })
    .select("id")
    .single();
  if (tripError)
    return NextResponse.json(
      {
        message:
          tripError.code === "PGRST204" &&
          tripError.message.includes("interests")
            ? "Trip interests need a database update. Run 20261023_add_trip_interests.sql in Supabase, then save again."
            : tripError.message,
      },
      { status: 400 },
    );

  const stateLinks = matchedStateRows.map((state) => ({
    trip_id: trip.id,
    state_id: state.id,
  }));
  const { error: stateLinkError } = await supabase
    .from("trip_states")
    .insert(stateLinks);
  if (stateLinkError) {
    await removeIncompleteTrip(supabase, trip.id, user.id);
    return NextResponse.json(
      { message: stateLinkError.message },
      { status: 400 },
    );
  }

  if (stops.length) {
    const destinationIds = [
      ...new Set(
        stops.flatMap((value) =>
          value &&
          typeof value === "object" &&
          typeof (value as Record<string, unknown>).destinationId === "string"
            ? [(value as Record<string, unknown>).destinationId as string]
            : [],
        ),
      ),
    ];
    const destinationRows = destinationIds.length
      ? await supabase
          .from("destinations")
          .select("id, state_id, latitude, longitude")
          .in("id", destinationIds)
      : { data: [], error: null };
    if (destinationRows.error) {
      await removeIncompleteTrip(supabase, trip.id, user.id);
      return NextResponse.json(
        { message: destinationRows.error.message },
        { status: 500 },
      );
    }
    const destinationById = new Map(
      (destinationRows.data ?? []).map((row) => [String(row.id), row]),
    );
    if (
      destinationIds.some(
        (id) =>
          !destinationById.has(id) ||
          !matchedStateRows.some(
            (state) => state.id === destinationById.get(id)?.state_id,
          ),
      )
    ) {
      await removeIncompleteTrip(supabase, trip.id, user.id);
      return NextResponse.json(
        {
          message:
            "A stop references a destination outside the selected states.",
        },
        { status: 400 },
      );
    }
    const stopRows = stops.flatMap((value, index) => {
      if (!value || typeof value !== "object") return [];
      const stop = value as Record<string, unknown>;
      const stopTitle = typeof stop.title === "string" ? stop.title.trim() : "";
      if (!stopTitle) return [];
      const destination =
        typeof stop.destinationId === "string"
          ? destinationById.get(stop.destinationId)
          : undefined;
      const latitude =
        destination?.latitude ??
        (typeof stop.latitude === "number" ? stop.latitude : null);
      const longitude =
        destination?.longitude ??
        (typeof stop.longitude === "number" ? stop.longitude : null);
      return [
        {
          trip_id: trip.id,
          destination_id: destination?.id ?? null,
          title: stopTitle.slice(0, 160),
          description:
            typeof stop.description === "string"
              ? stop.description.slice(0, 1000)
              : null,
          stop_date: typeof stop.date === "string" ? stop.date : null,
          day_number:
            Number.isInteger(stop.day) && Number(stop.day) > 0
              ? Number(stop.day)
              : null,
          start_time:
            typeof stop.startTime === "string" ? stop.startTime : null,
          end_time: typeof stop.endTime === "string" ? stop.endTime : null,
          position: index + 1,
          latitude,
          longitude,
          notes:
            typeof stop.notes === "string" ? stop.notes.slice(0, 1000) : null,
        },
      ];
    });
    if (stopRows.length !== stops.length) {
      await removeIncompleteTrip(supabase, trip.id, user.id);
      return NextResponse.json(
        { message: "Every stop needs a name." },
        { status: 400 },
      );
    }
    const { error: stopsError } = await supabase
      .from("itinerary_stops")
      .insert(stopRows);
    if (stopsError) {
      await removeIncompleteTrip(supabase, trip.id, user.id);
      return NextResponse.json(
        { message: stopsError.message },
        { status: 400 },
      );
    }
  }

  return NextResponse.json({ id: trip.id }, { status: 201 });
}
