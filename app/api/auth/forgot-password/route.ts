import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/schemas";
import { accountAuthClient } from "@/app/api/admin/_accounts";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return NextResponse.json(
      { message: "Invalid request origin." },
      { status: 403 },
    );
  const parsed = forgotPasswordSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { message: "Enter a valid email address." },
      { status: 400 },
    );
  // This server-only RPC accepts requests without exposing Auth emails or account IDs.
  const service = accountAuthClient();
  if (!service)
    return NextResponse.json(
      {
        message:
          "Password reset requests are temporarily unavailable. Please contact an administrator.",
      },
      { status: 503 },
    );
  const { error } = await service.rpc("submit_password_reset_request", {
    _email: parsed.data.email,
  });
  if (error)
    return NextResponse.json(
      { message: "Could not submit your request. Please try again later." },
      { status: 503 },
    );
  return NextResponse.json({
    message:
      "If this email belongs to an account, your request has been sent to an administrator. Contact your administrator to verify your identity and arrange your new password.",
  });
}
