import { errorResponse } from "@/app/api/_response";
import { getApiContext } from "@/app/api/_shared";
import { NextResponse } from "next/server";

export async function GET() {
  const { supabase } = await getApiContext();
  const { data, error } = await supabase
    .from("states")
    .select("id, name, code")
    .order("name");
  if (error) return errorResponse(error.message, 500);
  return NextResponse.json({ states: data ?? [] });
}
