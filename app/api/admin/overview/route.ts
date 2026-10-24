import { NextResponse } from "next/server";
import { getApiContext, userIsAdmin } from "@/app/api/_shared";

export async function GET() {
  const { supabase, user } = await getApiContext();
  if (!user)
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  if (!(await userIsAdmin(supabase, user.id)))
    return NextResponse.json(
      { message: "Admin access required." },
      { status: 403 },
    );
  const [users, trips, posts, reports, postReports] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase
      .from("trips")
      .select("id", { count: "exact", head: true })
      .eq("is_public", true),
    supabase
      .from("community_posts")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("trip_reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("community_post_reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
  ]);
  const issue =
    users.error ||
    trips.error ||
    posts.error ||
    reports.error ||
    postReports.error;
  if (issue)
    return NextResponse.json({ message: issue.message }, { status: 500 });
  return NextResponse.json({
    users: users.count ?? 0,
    publicTrips: trips.count ?? 0,
    posts: posts.count ?? 0,
    openReports: (reports.count ?? 0) + (postReports.count ?? 0),
  });
}
