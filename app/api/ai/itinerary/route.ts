import { NextResponse } from "next/server";
import { getApiContext } from "@/app/api/_shared";
import {
  generateItinerary,
  ItineraryServiceError,
  generatedStopsSchema,
} from "@/app/api/ai/itinerary/service";

export async function POST(request: Request) {
  const { supabase, user } = await getApiContext();
  if (!user)
    return NextResponse.json(
      { message: "Sign in to generate a trip." },
      { status: 401 },
    );
  if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY)
    return NextResponse.json(
      {
        message:
          "AI planning is not configured. Add GEMINI_API_KEY or GROQ_API_KEY to the server environment.",
      },
      { status: 503 },
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
  const states = Array.isArray(body.states)
    ? [
        ...new Set(
          body.states
            .filter((value): value is string => typeof value === "string")
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      ]
    : [];
  const interests = Array.isArray(body.interests)
    ? body.interests
        .filter((value): value is string => typeof value === "string")
        .slice(0, 8)
    : [];
  const days = Number.isInteger(body.days) ? Number(body.days) : 3;
  if (!states.length || states.length > 5)
    return NextResponse.json(
      { message: "Choose between one and five states." },
      { status: 400 },
    );
  if (days < 1 || days > 14)
    return NextResponse.json(
      { message: "AI itineraries can cover up to 14 days." },
      { status: 400 },
    );

  for (const date of [body.startDate, body.endDate]) {
    if (
      date != null &&
      (typeof date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !Number.isFinite(Date.parse(date + "T00:00:00Z")) ||
        new Date(date + "T00:00:00Z").toISOString().slice(0, 10) !== date)
    ) {
      return NextResponse.json(
        { message: "Choose a valid trip date." },
        { status: 400 },
      );
    }
  }

  const { data: allStates, error: stateError } = await supabase
    .from("states")
    .select("id, name");
  if (stateError)
    return NextResponse.json({ message: stateError.message }, { status: 500 });
  const normalizeState = (value: string) => {
    const normalized = value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
    return normalized === "pulau pinang"
      ? "penang"
      : normalized.replace(/^pulau\s+/, "");
  };
  const stateByName = new Map(
    (allStates ?? []).map((state) => [normalizeState(state.name), state]),
  );
  const stateRows = states.map((name) => stateByName.get(normalizeState(name)));
  if (stateRows.some((state) => !state))
    return NextResponse.json(
      {
        message: `State not found in the database: ${states[stateRows.findIndex((state) => !state)]}. Refresh and choose an available state.`,
      },
      { status: 400 },
    );
  const { data: destinations, error: destinationError } = await supabase
    .from("destinations")
    .select(
      "id, state_id, name, description, category, address, latitude, longitude",
    )
    .in(
      "state_id",
      stateRows.map((state) => state!.id),
    )
    .limit(250);
  if (destinationError)
    return NextResponse.json(
      { message: destinationError.message },
      { status: 500 },
    );
  const hasCatalogDestinations = Boolean(destinations?.length);

  const prompt = [
    hasCatalogDestinations
      ? "Create a practical Malaysia travel itinerary using only the supplied database destinations."
      : "Create a practical Malaysia travel itinerary using well-known, real visitor destinations in the selected Malaysian states. The database has no destination catalog yet, so do not invent coordinates or destination IDs.",
    `Trip name: ${typeof body.title === "string" ? body.title.slice(0, 80) : "Malaysia trip"}`,
    `Trip description: ${typeof body.description === "string" ? body.description.slice(0, 2000) : "none"}`,
    `Selected states: ${states.join(", ")}`,
    `Duration: ${days} day(s). Travel style: ${String(body.style ?? "balanced").slice(0, 50)}. Travellers: ${String(body.travellers ?? "unspecified").slice(0, 50)}. Interests: ${interests.join(", ") || "general sightseeing"}.`,
    `Date range: ${typeof body.startDate === "string" ? body.startDate : "flexible"} to ${typeof body.endDate === "string" ? body.endDate : "flexible"}.`,
    `Daily time window: ${typeof body.startTime === "string" && body.startTime ? body.startTime : "09:00"} to ${typeof body.endTime === "string" && body.endTime ? body.endTime : "20:00"}.`,
    "Select 2 to 4 different destinations per day when possible, sequence nearby places sensibly, keep every stop in a selected state, and use local Malaysian time in 24-hour HH:MM format.",
    "Return only a JSON object with a stops array. Each stop object must contain destinationId (empty string when free-picking), title (place name), state (selected state), day (1-based integer), startTime, endTime, and notes (one concise practical sentence).",
    `Allowed database destinations: ${JSON.stringify((destinations ?? []).map((destination) => ({ id: destination.id, name: destination.name, state: stateRows.find((state) => state!.id === destination.state_id)?.name, category: destination.category, address: destination.address, description: destination.description })))}`,
  ].join("\n");

  try {
    const stops = await generateItinerary(prompt, (value) => {
      const generated = generatedStopsSchema.parse(value);
      if (generated.length > days * 4) throw new Error("Too many stops");
      const byId = new Map(
        (destinations ?? []).map((destination) => [
          String(destination.id),
          destination,
        ]),
      );
      const stops = generated.map((stop) => {
        const destination = stop.destinationId
          ? byId.get(String(stop.destinationId))
          : undefined;
        const stopState = stateRows.find(
          (row) => normalizeState(row!.name) === normalizeState(stop.state),
        );
        if (
          (hasCatalogDestinations && !destination) ||
          (!destination && (!stop.title?.trim() || !stopState)) ||
          !Number.isInteger(stop.day) ||
          stop.day < 1 ||
          stop.day > days ||
          !/^\d{2}:\d{2}$/.test(stop.startTime) ||
          !/^\d{2}:\d{2}$/.test(stop.endTime)
        )
          return null;
        const state = destination
          ? (stateRows.find((row) => row!.id === destination.state_id)?.name ??
            stopState!.name)
          : stopState!.name;
        const date =
          typeof body.startDate === "string"
            ? new Date(
                new Date(`${body.startDate}T00:00:00Z`).getTime() +
                  (stop.day - 1) * 86400000,
              )
                .toISOString()
                .slice(0, 10)
            : null;
        return {
          ...(destination ? { destinationId: String(destination.id) } : {}),
          title: destination?.name ?? stop.title.trim(),
          description: String(stop.notes).slice(0, 500),
          day: stop.day,
          date,
          startTime: stop.startTime,
          endTime: stop.endTime,
          latitude: destination?.latitude ?? null,
          longitude: destination?.longitude ?? null,
          area: destination?.address || state,
        };
      });
      if (stops.some((stop) => !stop))
        throw new Error("Invalid destination or schedule");
      if (new Set(stops.map((stop) => stop!.day)).size !== days)
        throw new Error("Missing trip days");
      return stops;
    });
    return NextResponse.json({ stops });
  } catch (error) {
    if (error instanceof ItineraryServiceError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }
    console.error("AI itinerary validation failed");
    return NextResponse.json(
      { message: "Unable to generate a valid itinerary. Please try again." },
      { status: 502 },
    );
  }
}
