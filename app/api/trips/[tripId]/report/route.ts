import { NextResponse } from "next/server";
import { getApiContext } from "@/app/api/_shared";

export async function POST(
  request: Request,
  context: { params: Promise<{ tripId: string }> },
) {
  const { supabase, user } = await getApiContext();
  if (!user)
    return NextResponse.json(
      { message: "Sign in to report a trip." },
      { status: 401 },
    );
  const { tripId } = await context.params;
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
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  const details = typeof body.details === "string" ? body.details.trim() : "";
  if (!reason || reason.length > 120 || details.length > 1000)
    return NextResponse.json(
      {
        message:
          "Provide a reason (up to 120 characters) and optional details (up to 1000).",
      },
      { status: 400 },
    );
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("id, user_id, is_public")
    .eq("id", tripId)
    .maybeSingle();
  if (tripError)
    return NextResponse.json({ message: tripError.message }, { status: 500 });
  if (!trip?.is_public || trip.user_id === user.id)
    return NextResponse.json(
      { message: "Trip not found or cannot be reported." },
      { status: 404 },
    );
  const { error } = await supabase
    .from("trip_reports")
    .insert({
      trip_id: tripId,
      reporter_id: user.id,
      reason,
      details: details || null,
    });
  if (error)
    return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ submitted: true }, { status: 201 });
}
