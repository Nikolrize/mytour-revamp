import { userIsAdmin } from "@/app/api/_shared";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  const input = body as Record<string, unknown>;
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
    return NextResponse.json(
      { message: "Enter a valid email address and password." },
      { status: 400 },
    );
  }

  const supabase = createClient(await cookies());
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json(
      {
        message:
          error.code === "user_banned" || error.message === "User is banned"
            ? "Your account is deactivated by an admin"
            : error.message,
      },
      { status: 401 },
    );
  }

  if (data.user) {
    const account = await supabase
      .from("users")
      .select("status")
      .eq("id", data.user.id)
      .maybeSingle();
    if (account.error || account.data?.status === "inactive") {
      await supabase.auth.signOut({ scope: "local" });
      return NextResponse.json(
        {
          message: account.error
            ? "Could not verify account access."
            : "Your account is deactivated by an admin",
        },
        { status: account.error ? 503 : 403 },
      );
    }
  }
  const isAdmin = data.user ? await userIsAdmin(supabase, data.user.id) : false;
  return NextResponse.json({
    message: "Signed in successfully.",
    redirectTo: isAdmin ? "/admin" : "/",
  });
}
