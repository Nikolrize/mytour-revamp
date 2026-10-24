import { errorResponse } from "@/app/api/_response";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = createClient(await cookies());
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) return errorResponse("Could not sign out. Please try again.", 500);
  return NextResponse.json({ message: "Signed out successfully." });
}
