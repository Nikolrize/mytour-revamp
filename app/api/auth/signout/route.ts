import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  const supabase = createClient(await cookies());
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error)
    return NextResponse.json(
      { message: "Could not sign out. Please try again." },
      { status: 500 },
    );
  return NextResponse.json({ message: "Signed out successfully." });
}
