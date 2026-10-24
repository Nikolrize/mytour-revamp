import { errorResponse } from "@/app/api/_response";
import {
  accountAuthClient,
  authorizeAccountManagement,
} from "@/app/api/admin/_accounts";
import { resetPasswordSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ requestId: string }> },
) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return errorResponse("Invalid request origin.", 403);
  const access = await authorizeAccountManagement();
  if (access.denied) return access.denied;
  const { requestId } = await context.params;
  if (!z.string().uuid().safeParse(requestId).success)
    return errorResponse("Invalid request ID.", 400);
  const parsed = resetPasswordSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return errorResponse(parsed.error.issues[0].message, 400);
  const pending = await access.supabase
    .from("password_reset_requests")
    .select("id,user_id")
    .eq("id", requestId)
    .eq("status", "pending")
    .maybeSingle();
  if (pending.error)
    return errorResponse("Could not load the reset request.", 500);
  if (!pending.data) return errorResponse("Pending request not found.", 404);
  const target = await authorizeAccountManagement(pending.data.user_id);
  if (target.denied) return target.denied;
  const service = accountAuthClient();
  if (!service)
    return errorResponse(
      "Password changes require SUPABASE_SECRET_KEY on the server.",
      503,
    );
  const changed = await service.auth.admin.updateUserById(
    pending.data.user_id,
    { password: parsed.data.password },
  );
  if (changed.error)
    return errorResponse(
      changed.error.code === "same_password"
        ? "Choose a password different from the current password."
        : "Could not change this password. Check the password requirements and try again.",
      400,
    );
  const handled = await access.supabase
    .from("password_reset_requests")
    .update({
      status: "handled",
      handled_at: new Date().toISOString(),
      handled_by: access.user!.id,
    })
    .eq("id", requestId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (handled.error || !handled.data)
    return errorResponse(
      "The password was changed, but the request could not be marked as handled. Refresh the list before taking further action.",
      500,
    );
  return NextResponse.json({
    message: "Password changed and request marked as handled.",
  });
}
