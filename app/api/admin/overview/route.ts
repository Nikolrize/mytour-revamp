import { errorResponse } from "@/app/api/_response";
import { getApiContext, userIsAdmin } from "@/app/api/_shared";
import { NextResponse } from "next/server";

export async function GET() {
  const { supabase, user } = await getApiContext();
  if (!user) return errorResponse("Sign in required.", 401);
  if (!(await userIsAdmin(supabase, user.id)))
    return errorResponse("Admin access required.", 403);
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
  if (issue) return errorResponse(issue.message, 500);
  return NextResponse.json({
    users: users.count ?? 0,
    publicTrips: trips.count ?? 0,
    posts: posts.count ?? 0,
    openReports: (reports.count ?? 0) + (postReports.count ?? 0),
  });
}
