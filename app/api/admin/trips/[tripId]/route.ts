import { NextResponse } from "next/server";
import { getApiContext, userIsAdmin } from "@/app/api/_shared";

export async function PATCH(request: Request, context: { params: Promise<{ tripId: string }> }) {
  const { supabase, user } = await getApiContext();
  if (!user) return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  if (!(await userIsAdmin(supabase, user.id))) return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  const { tripId } = await context.params;
  let input: unknown;
  try { input = await request.json(); } catch { return NextResponse.json({ message: "Invalid request body." }, { status: 400 }); }
  if (!input || typeof input !== "object") return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  const body = input as Record<string, unknown>;
  const updates: Record<string, string | boolean> = {};
  if (typeof body.isPublic === "boolean") updates.is_public = body.isPublic;
  if (typeof body.status === "string" && ["planning", "ready_to_go", "completed"].includes(body.status)) updates.status = body.status;
  if (!Object.keys(updates).length) return NextResponse.json({ message: "No valid moderation changes provided." }, { status: 400 });
  const { data, error } = await supabase.from("trips").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", tripId).select("id").maybeSingle();
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ message: "Trip not found." }, { status: 404 });
  return NextResponse.json({ id: data.id });
}

export async function DELETE(_request: Request, context: { params: Promise<{ tripId: string }> }) {
  const { supabase, user } = await getApiContext();
  if (!user) return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  if (!(await userIsAdmin(supabase, user.id))) return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  const { tripId } = await context.params;
  const { data, error } = await supabase.from("trips").delete().eq("id", tripId).select("id").maybeSingle();
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ message: "Trip not found." }, { status: 404 });
  return NextResponse.json({ id: data.id });
}
