import { errorResponse } from "@/app/api/_response";
import { accountAuthClient } from "@/app/api/admin/_accounts";
import { forgotPasswordSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return errorResponse("Invalid request origin.", 403);
  const parsed = forgotPasswordSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return errorResponse("Enter a valid email address.", 400);
  // This server-only RPC accepts requests without exposing Auth emails or account IDs.
  const service = accountAuthClient();
  if (!service)
    return errorResponse(
      "Password reset requests are temporarily unavailable. Please contact an administrator.",
      503,
    );
  const { error } = await service.rpc("submit_password_reset_request", {
    _email: parsed.data.email,
  });
  if (error)
    return errorResponse(
      "Could not submit your request. Please try again later.",
      503,
    );
  return NextResponse.json({
    message:
      "If this email belongs to an account, your request has been sent to an administrator. Contact your administrator to verify your identity and arrange your new password.",
  });
}
