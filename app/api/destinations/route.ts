import { NextResponse } from "next/server";
import { getApiContext } from "@/app/api/_shared";

export async function GET(request: Request) {
  const { supabase } = await getApiContext();
  const url = new URL(request.url);
  let query = supabase.from("destinations").select("id, state_id, name, description, category, address, latitude, longitude, image_url, is_featured, created_at").order("name");
  const stateId = url.searchParams.get("stateId");
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("q")?.trim();
  if (stateId && /^\d+$/.test(stateId)) query = query.eq("state_id", Number(stateId));
  if (category && category !== "all") query = query.eq("category", category);
  if (search) query = query.ilike("name", "%" + search.replace(/[,%()]/g, "") + "%");
  const { data, error } = await query.limit(100);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  const stateIds = [...new Set((data ?? []).map((destination) => destination.state_id))];
  const { data: states, error: statesError } = stateIds.length
    ? await supabase.from("states").select("id, name").in("id", stateIds)
    : { data: [], error: null };
  if (statesError) return NextResponse.json({ message: statesError.message }, { status: 500 });
  const stateNames = new Map((states ?? []).map((state) => [state.id, state.name]));
  return NextResponse.json({ destinations: (data ?? []).map((destination) => ({
    id: destination.id,
    name: destination.name,
    state: stateNames.get(destination.state_id) ?? "Malaysia",
    category: destination.category ?? "Places",
    image: destination.image_url ?? "",
    note: destination.description ?? destination.address ?? "",
    latitude: destination.latitude,
    longitude: destination.longitude,
  })) });
}
