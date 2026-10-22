import { NextResponse } from "next/server";
import { getApiContext, userIsAdmin } from "@/app/api/_shared";

export async function PATCH(request: Request, context: { params: Promise<{ reportId: string }> }) {
  const { supabase, user } = await getApiContext();
  if (!user) return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  if (!(await userIsAdmin(supabase, user.id))) return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  const { reportId } = await context.params;
  let input: unknown;
  try { input = await request.json(); } catch { return NextResponse.json({ message: "Invalid request body." }, { status: 400 }); }
  if (!input || typeof input !== "object") return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  const status = (input as Record<string, unknown>).status;
  if (status !== "resolved" && status !== "dismissed") return NextResponse.json({ message: "Status must be resolved or dismissed." }, { status: 400 });
  const { data, error } = await supabase.from("trip_reports").update({ status, reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", reportId).eq("status", "open").select("id, status").maybeSingle();
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ message: "Open report not found." }, { status: 404 });
  return NextResponse.json({ report: data });
}
