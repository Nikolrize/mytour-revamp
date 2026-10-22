import { NextResponse } from "next/server";
import { getApiContext, userIsAdmin } from "@/app/api/_shared";

export async function GET() {
  const { supabase, user } = await getApiContext();
  if (!user) return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  if (!(await userIsAdmin(supabase, user.id))) return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  const { data, error } = await supabase.from("trip_reports").select("id, trip_id, reporter_id, reason, details, status, reviewed_by, created_at, reviewed_at").order("created_at", { ascending: false }).limit(500);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  const tripIds = [...new Set((data ?? []).map((report) => report.trip_id))];
  const reporterIds = [...new Set((data ?? []).map((report) => report.reporter_id))];
  const [trips, profiles] = await Promise.all([
    tripIds.length ? supabase.from("trips").select("id, title, user_id").in("id", tripIds) : Promise.resolve({ data: [], error: null }),
    reporterIds.length ? supabase.from("profiles").select("id, display_name").in("id", reporterIds) : Promise.resolve({ data: [], error: null }),
  ]);
  if (trips.error || profiles.error) return NextResponse.json({ message: trips.error?.message ?? profiles.error?.message }, { status: 500 });
  const tripMap = new Map((trips.data ?? []).map((trip) => [trip.id, trip]));
  const profileMap = new Map((profiles.data ?? []).map((profile) => [profile.id, profile.display_name]));
  return NextResponse.json({ reports: (data ?? []).map((report) => ({ ...report, tripTitle: tripMap.get(report.trip_id)?.title ?? "Deleted trip", reporter: profileMap.get(report.reporter_id) ?? "Traveller" })) });
}
