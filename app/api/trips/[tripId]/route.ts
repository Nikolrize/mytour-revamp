import { tripDetailsSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";
import {
  getApiContext,
  mapTripsToItineraries,
  type TripRow,
} from "@/app/api/_shared";

export async function GET(
  request: Request,
  context: { params: Promise<{ tripId: string }> },
) {
  const { supabase, user } = await getApiContext();
  const { tripId } = await context.params;
  const { data: trip, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .maybeSingle();

  if (error)
    return NextResponse.json({ message: error.message }, { status: 500 });
  if (!trip || (!trip.is_public && trip.user_id !== user?.id)) {
    return NextResponse.json({ message: "Trip not found." }, { status: 404 });
  }

  try {
    const [itinerary] = await mapTripsToItineraries(supabase, [
      trip as TripRow,
    ]);
    return NextResponse.json({
      trip: itinerary,
      isOwner: trip.user_id === user?.id,
    });
  } catch (mapError) {
    return NextResponse.json(
      {
        message:
          mapError instanceof Error
            ? mapError.message
            : "Could not load this trip.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ tripId: string }> },
) {
  const { supabase, user } = await getApiContext();
  if (!user)
    return NextResponse.json(
      { message: "Sign in to edit this trip." },
      { status: 401 },
    );
  const { tripId } = await context.params;

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
  if ("status" in input)
    return NextResponse.json(
      { message: "Trip status is calculated automatically from its dates." },
      { status: 400 },
    );
  const details = tripDetailsSchema
    .partial()
    .extend({
      description: tripDetailsSchema.shape.description.nullable().optional(),
    })
    .safeParse(input);
  if (!details.success)
    return NextResponse.json(
      { message: details.error.issues[0].message },
      { status: 400 },
    );
  const updates: Record<string, string | boolean | null> = {};
  if (typeof input.title === "string") {
    const title = input.title.trim();
    if (!title || title.length > 80)
      return NextResponse.json(
        { message: "Trip name must be between 1 and 80 characters." },
        { status: 400 },
      );
    updates.title = title;
  }
  if (typeof input.description === "string" || input.description === null)
    updates.description = input.description;
  if (typeof input.coverImageUrl === "string" || input.coverImageUrl === null)
    updates.cover_image_url = input.coverImageUrl;
  if (typeof input.isPublic === "boolean") updates.is_public = input.isPublic;
  if (typeof input.startDate === "string" || input.startDate === null)
    updates.start_date = input.startDate;
  if (typeof input.endDate === "string" || input.endDate === null)
    updates.end_date = input.endDate;
  if (typeof input.startTime === "string" || input.startTime === null)
    updates.start_time = input.startTime;
  if (typeof input.endTime === "string" || input.endTime === null)
    updates.end_time = input.endTime;
  if (!Object.keys(updates).length)
    return NextResponse.json(
      { message: "No valid trip changes were provided." },
      { status: 400 },
    );

  const { data, error } = await supabase
    .from("trips")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", tripId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();
  if (error)
    return NextResponse.json({ message: error.message }, { status: 400 });
  if (!data)
    return NextResponse.json(
      { message: "Trip not found or you cannot edit it." },
      { status: 404 },
    );
  return NextResponse.json({ id: data.id });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ tripId: string }> },
) {
  const { supabase, user } = await getApiContext();
  if (!user)
    return NextResponse.json(
      { message: "Sign in to delete this trip." },
      { status: 401 },
    );
  const { tripId } = await context.params;
  const { data, error } = await supabase
    .from("trips")
    .delete()
    .eq("id", tripId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();
  if (error)
    return NextResponse.json({ message: error.message }, { status: 400 });
  if (!data)
    return NextResponse.json(
      { message: "Trip not found or you cannot delete it." },
      { status: 404 },
    );
  return NextResponse.json({ id: data.id });
}
