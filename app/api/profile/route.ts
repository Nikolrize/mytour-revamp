import { errorResponse } from "@/app/api/_response";
import { getApiContext } from "@/app/api/_shared";
import { NextResponse } from "next/server";

export async function GET() {
  const { supabase, user } = await getApiContext();
  if (!user) return errorResponse("Sign in to view your profile.", 401);
  const { data, error } = await supabase
    .from("users")
    .select("id, display_name, avatar_url, bio, role, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();
  if (error) return errorResponse(error.message, 500);
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
  if (!user) return errorResponse("Sign in to update your profile.", 401);
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return errorResponse("Invalid request body.", 400);
  }
  if (!input || typeof input !== "object")
    return errorResponse("Invalid request body.", 400);
  const body = input as Record<string, unknown>;
  const displayName =
    typeof body.displayName === "string" ? body.displayName.trim() : "";
  if (!displayName || displayName.length > 60)
    return errorResponse("Name must be between 1 and 60 characters.", 400);
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
    return errorResponse("Avatar must be a valid http(s) URL.", 400);
  if (bio && bio.length > 240)
    return errorResponse("Bio must be 240 characters or fewer.", 400);
  const changes = {
    display_name: displayName,
    avatar_url: avatarUrl,
    bio,
    updated_at: new Date().toISOString(),
  };
  const columns =
    "id, display_name, avatar_url, bio, role, created_at, updated_at";
  // Update only editable columns; the profile ID never changes.
  let result = await supabase
    .from("users")
    .update(changes)
    .eq("id", user.id)
    .select(columns)
    .maybeSingle();
  if (!result.error && !result.data) {
    result = await supabase
      .from("users")
      .insert({ id: user.id, ...changes })
      .select(columns)
      .single();
  }
  const { data, error } = result;
  if (error)
    return errorResponse(
      error.code === "42501"
        ? "Account permissions need a database update. Check the grants and own-row policies on public.users."
        : error.message,
      400,
    );
  return NextResponse.json({ profile: data });
}
