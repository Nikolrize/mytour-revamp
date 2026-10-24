import { z } from "zod";
import { NextResponse } from "next/server";
import { getApiContext, userIsAdmin } from "@/app/api/_shared";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ reportId: string }> },
) {
  const { supabase, user } = await getApiContext();
  if (!user)
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  if (!(await userIsAdmin(supabase, user.id)))
    return NextResponse.json(
      { message: "Admin access required." },
      { status: 403 },
    );
  const { reportId } = await context.params;
  if (!z.guid().safeParse(reportId).success)
    return NextResponse.json(
      { message: "Invalid report ID." },
      { status: 400 },
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
  const status = body.status;
  const targetType = body.targetType ?? "trip";
  if (targetType !== "trip" && targetType !== "post")
    return NextResponse.json(
      { message: "Invalid report type." },
      { status: 400 },
    );
  if (status !== "open" && status !== "resolved" && status !== "dismissed")
    return NextResponse.json(
      { message: "Status must be open, resolved or dismissed." },
      { status: 400 },
    );
  const { data, error } = await supabase
    .from(targetType === "post" ? "community_post_reports" : "trip_reports")
    .update({
      status,
      reviewed_by: status === "open" ? null : user.id,
      reviewed_at: status === "open" ? null : new Date().toISOString(),
    })
    .eq("id", reportId)
    .select("id, status")
    .maybeSingle();
  if (error)
    return NextResponse.json(
      {
        message:
          error.code === "23505"
            ? "This reporter already has another flagged report for this post."
            : "Could not update this report.",
      },
      { status: error.code === "23505" ? 409 : 400 },
    );
  if (!data)
    return NextResponse.json({ message: "Report not found." }, { status: 404 });
  return NextResponse.json({ report: data });
}

// Fetch complete report content only when an administrator opens the record.
export async function GET(
  request: Request,
  context: { params: Promise<{ reportId: string }> },
) {
  const { supabase, user } = await getApiContext();
  if (!user)
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  if (!(await userIsAdmin(supabase, user.id)))
    return NextResponse.json(
      { message: "Admin access required." },
      { status: 403 },
    );
  const { reportId } = await context.params;
  const targetType =
    new URL(request.url).searchParams.get("targetType") ?? "trip";
  if (
    !z.guid().safeParse(reportId).success ||
    !["trip", "post"].includes(targetType)
  )
    return NextResponse.json(
      { message: "Invalid report request." },
      { status: 400 },
    );
  const result = await supabase
    .from(targetType === "post" ? "community_post_reports" : "trip_reports")
    .select("*")
    .eq("id", reportId)
    .maybeSingle();
  if (result.error)
    return NextResponse.json(
      { message: "Could not load report details." },
      { status: 500 },
    );
  if (!result.data)
    return NextResponse.json({ message: "Report not found." }, { status: 404 });
  const row = result.data;
  const contentId = targetType === "post" ? row.post_id : row.trip_id;
  const peopleIds = [row.reporter_id, row.reviewed_by].filter(Boolean);
  const [content, people] = await Promise.all([
    targetType === "post"
      ? supabase
          .from("community_posts")
          .select("content")
          .eq("id", contentId)
          .maybeSingle()
      : supabase
          .from("trips")
          .select("title")
          .eq("id", contentId)
          .maybeSingle(),
    supabase.from("users").select("id,display_name").in("id", peopleIds),
  ]);
  if (content.error || people.error)
    return NextResponse.json(
      { message: "Could not load report information." },
      { status: 500 },
    );
  const names = new Map(
    (people.data ?? []).map((person) => [person.id, person.display_name]),
  );
  const title =
    targetType === "post"
      ? (content.data as { content?: string } | null)?.content
      : (content.data as { title?: string } | null)?.title;
  return NextResponse.json(
    {
      report: {
        id: row.id,
        targetType,
        contentId,
        title: title || (targetType === "post" ? "Photo post" : "Deleted trip"),
        reason: row.reason,
        details: row.details,
        status: row.status,
        reporterId: row.reporter_id,
        reporter: names.get(row.reporter_id) || "Traveller",
        createdAt: row.created_at,
        reviewedById: row.reviewed_by,
        reviewedBy: row.reviewed_by
          ? names.get(row.reviewed_by) || "Administrator"
          : null,
        reviewedAt: row.reviewed_at,
      },
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
