import { NextResponse } from "next/server";
import { getApiContext, mapTripsToItineraries, type TripRow, userIsAdmin } from "@/app/api/_shared";

export async function GET() {
  const { supabase, user } = await getApiContext();
  if (!user) return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  if (!(await userIsAdmin(supabase, user.id))) return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  const { data, error } = await supabase.from("trips").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  try { return NextResponse.json({ trips: await mapTripsToItineraries(supabase, (data ?? []) as TripRow[]) }); }
  catch (cause) { return NextResponse.json({ message: cause instanceof Error ? cause.message : "Could not load trips." }, { status: 500 }); }
}
