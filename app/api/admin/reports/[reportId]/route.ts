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
  if (!z.string().uuid().safeParse(reportId).success)
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
