import { errorResponse } from "@/app/api/_response";
import { getApiContext, userIsAdmin } from "@/app/api/_shared";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ tripId: string }> },
) {
  const { supabase, user } = await getApiContext();
  if (!user) return errorResponse("Sign in required.", 401);
  if (!(await userIsAdmin(supabase, user.id)))
    return errorResponse("Admin access required.", 403);
  const { tripId } = await context.params;
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return errorResponse("Invalid request body.", 400);
  }
  if (!input || typeof input !== "object")
    return errorResponse("Invalid request body.", 400);
  const body = input as Record<string, unknown>;
  const updates: Record<string, string | boolean> = {};
  if (typeof body.isPublic === "boolean") updates.is_public = body.isPublic;
  if (
    typeof body.status === "string" &&
    ["planning", "ready_to_go", "completed"].includes(body.status)
  )
    updates.status = body.status;
  if (!Object.keys(updates).length)
    return errorResponse("No valid moderation changes provided.", 400);
  const { data, error } = await supabase
    .from("trips")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", tripId)
    .select("id")
    .maybeSingle();
  if (error) return errorResponse(error.message, 400);
  if (!data) return errorResponse("Trip not found.", 404);
  return NextResponse.json({ id: data.id });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ tripId: string }> },
) {
  const { supabase, user } = await getApiContext();
  if (!user) return errorResponse("Sign in required.", 401);
  if (!(await userIsAdmin(supabase, user.id)))
    return errorResponse("Admin access required.", 403);
  const { tripId } = await context.params;
  const { data, error } = await supabase
    .from("trips")
    .delete()
    .eq("id", tripId)
    .select("id")
    .maybeSingle();
  if (error) return errorResponse(error.message, 400);
  if (!data) return errorResponse("Trip not found.", 404);
  return NextResponse.json({ id: data.id });
}
