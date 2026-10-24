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

// Filter, sort and paginate inside Postgres before hydrating itinerary cards.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const parsed = z
    .object({
      scope: z.enum(["public", "mine", "saved", "all"]),
      page: z.coerce.number().int().min(1).max(100000),
      pageSize: z.coerce.number().int().min(1).max(12),
      search: z.string().trim().max(200),
      state: z.string().max(80),
      tags: z
        .array(z.enum(tripInterestOptions))
        .max(tripInterestOptions.length),
      sort: z.enum(["latest", "saved", "rating"]),
      status: z.enum(["all", "Planning", "Ongoing", "Completed"]),
      publicOnly: z.enum(["true", "false"]),
    })
    .safeParse({
      scope: params.get("scope") ?? "mine",
      page: params.get("page") ?? "1",
      pageSize: params.get("pageSize") ?? "12",
      search: params.get("q") ?? "",
      state: params.get("state") ?? "all",
      tags: params.getAll("tag"),
      sort: params.get("sort") ?? "latest",
      status: params.get("status") ?? "all",
      publicOnly: params.get("publicOnly") ?? "false",
    });
  if (!parsed.success)
    return NextResponse.json(
      { message: "Invalid itinerary pagination or filters." },
      { status: 400 },
    );
  const input = parsed.data;
  const { supabase, user } = await getApiContext();
  if (input.scope !== "public" && !user)
    return NextResponse.json(
      { message: "Sign in to view your trips." },
      { status: 401 },
    );
  const result =
    input.scope === "public"
      ? await supabase.rpc("get_public_trip_page", {
          _page: input.page,
          _page_size: input.pageSize,
          _search: input.search,
          _state: input.state,
          _tags: input.tags,
          _sort: input.sort,
        })
      : await supabase.rpc("get_personal_trip_page", {
          _scope: input.scope,
          _page: input.page,
          _page_size: input.pageSize,
          _status: input.status,
          _search: input.search,
          _public_only: input.publicOnly === "true",
        });
  if (result.error)
    return NextResponse.json(
      { message: "Could not load the itinerary page: " + result.error.message },
      { status: 500 },
    );
  const page = result.data as {
    trips: (TripRow & { viewer_saved?: boolean })[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    states?: string[];
    stats?: Record<string, number>;
  };
  try {
    const mapped = await mapTripsToItineraries(supabase, page.trips);
    const savedIds = new Set(
      page.trips.filter((trip) => trip.viewer_saved).map((trip) => trip.id),
    );
    return NextResponse.json(
      {
        ...page,
        states: page.states ?? [],
        trips: mapped.map((trip) => ({
          ...trip,
          isSaved: savedIds.has(trip.slug),
        })),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
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
