import { NextResponse } from "next/server";
import { getApiContext } from "@/app/api/_shared";

export async function GET() {
  const { supabase } = await getApiContext();
  const { data, error } = await supabase.from("states").select("id, name, code").order("name");
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ states: data ?? [] });
}
