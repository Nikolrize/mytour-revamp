import { NextResponse } from "next/server";
import { getApiContext } from "@/app/api/_shared";

export async function GET() {
  const { supabase, user } = await getApiContext();
  if (!user)
    return NextResponse.json(
      { message: "Sign in to view your profile." },
      { status: 401 },
    );
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();
  if (error)
    return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({
    profile: data ?? {
      id: user.id,
      display_name: user.user_metadata?.display_name || "Traveller",
      avatar_url: null,
      bio: null,
      created_at: user.created_at,
      updated_at: user.created_at,
    },
  });
}

export async function PATCH(request: Request) {
  const { supabase, user } = await getApiContext();
  if (!user)
    return NextResponse.json(
      { message: "Sign in to update your profile." },
      { status: 401 },
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
  const displayName =
    typeof body.displayName === "string" ? body.displayName.trim() : "";
  if (!displayName || displayName.length > 60)
    return NextResponse.json(
      { message: "Name must be between 1 and 60 characters." },
      { status: 400 },
    );
  const avatarUrl =
    typeof body.avatarUrl === "string" && body.avatarUrl.trim()
      ? body.avatarUrl.trim()
      : null;
  const bio =
    typeof body.bio === "string" && body.bio.trim() ? body.bio.trim() : null;
  if (
    avatarUrl &&
    (!/^https?:\/\//i.test(avatarUrl) || avatarUrl.length > 2048)
  )
    return NextResponse.json(
      { message: "Avatar must be a valid http(s) URL." },
      { status: 400 },
    );
  if (bio && bio.length > 240)
    return NextResponse.json(
      { message: "Bio must be 240 characters or fewer." },
      { status: 400 },
    );
  const changes = {
    display_name: displayName,
    avatar_url: avatarUrl,
    bio,
    updated_at: new Date().toISOString(),
  };
  const columns = "id, display_name, avatar_url, bio, created_at, updated_at";
  // Update only editable columns; the profile ID never changes.
  let result = await supabase
    .from("profiles")
    .update(changes)
    .eq("id", user.id)
    .select(columns)
    .maybeSingle();
  if (!result.error && !result.data) {
    result = await supabase
      .from("profiles")
      .insert({ id: user.id, ...changes })
      .select(columns)
      .single();
  }
  const { data, error } = result;
  if (error)
    return NextResponse.json(
      {
        message:
          error.code === "42501"
            ? "Profile permissions need a database update. Run 20261024_fix_profile_permissions.sql in Supabase."
            : error.message,
      },
      { status: 400 },
    );
  return NextResponse.json({ profile: data });
}
