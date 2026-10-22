import { NextResponse } from "next/server";
import { getApiContext, userIsAdmin } from "@/app/api/_shared";

export async function GET() {
  const { supabase, user } = await getApiContext();
  if (!user) return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  if (!(await userIsAdmin(supabase, user.id))) return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  const [profiles, roles, trips] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar_url, bio, created_at").order("created_at", { ascending: false }).limit(500),
    supabase.from("user_roles").select("user_id, role"),
    supabase.from("trips").select("user_id"),
  ]);
  const issue = profiles.error || roles.error || trips.error;
  if (issue) return NextResponse.json({ message: issue.message }, { status: 500 });
  const roleMap = new Map<string, string[]>();
  for (const item of roles.data ?? []) roleMap.set(item.user_id, [...(roleMap.get(item.user_id) ?? []), item.role]);
  const tripCounts = new Map<string, number>();
  for (const item of trips.data ?? []) tripCounts.set(item.user_id, (tripCounts.get(item.user_id) ?? 0) + 1);
  return NextResponse.json({ users: (profiles.data ?? []).map((profile) => ({ ...profile, roles: roleMap.get(profile.id) ?? ["client"], tripCount: tripCounts.get(profile.id) ?? 0 })) });
}
