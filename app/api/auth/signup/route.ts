import { errorResponse } from "@/app/api/_response";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body.", 400);
  }

  if (!body || typeof body !== "object") {
    return errorResponse("Invalid request body.", 400);
  }

  const input = body as Record<string, unknown>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (!name || name.length > 100) {
    return errorResponse("Enter a name between 1 and 100 characters.", 400);
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorResponse("Enter a valid email address.", 400);
  }
  if (password.length < 8) {
    return errorResponse("Password must be at least 8 characters.", 400);
  }

  const supabase = createClient(await cookies());
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });

  if (error) {
    return errorResponse(error.message, 400);
  }

  if (!data.session) {
    return errorResponse(
      "Email confirmation is still enabled in Supabase. Turn off Confirm email to sign up without verification.",
      409,
    );
  }

  return NextResponse.json({ message: "Account created successfully." });
}
