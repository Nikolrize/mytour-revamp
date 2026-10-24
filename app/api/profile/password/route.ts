import { errorResponse } from "@/app/api/_response";
import { getApiContext } from "@/app/api/_shared";
import { resetPasswordSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return errorResponse("Invalid request origin.", 403);
  const { supabase, user } = await getApiContext();
  if (!user) return errorResponse("Sign in to change your password.", 401);
  const parsed = resetPasswordSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return errorResponse(parsed.error.issues[0].message, 400);
  // The authenticated session updates only its own Supabase Auth password.
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error)
    return errorResponse(
      error.code === "reauthentication_needed"
        ? "Please sign in again before changing your password."
        : error.message,
      400,
    );
  return NextResponse.json(
    { message: "Your password has been updated." },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
