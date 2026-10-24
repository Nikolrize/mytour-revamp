import { errorResponse } from "@/app/api/_response";
import {
  accountAuthClient,
  authorizeAccountManagement,
} from "@/app/api/admin/_accounts";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const { userId } = await context.params;
  const access = await authorizeAccountManagement(userId);
  if (access.denied) return access.denied;
  const parsed = z
    .object({ status: z.enum(["active", "inactive"]) })
    .strict()
    .safeParse(await request.json().catch(() => null));
  if (!z.string().uuid().safeParse(userId).success || !parsed.success)
    return errorResponse("Choose a valid account and status.", 400);
  if (userId === access.user?.id)
    return errorResponse("You cannot change your own account status.", 400);
  const service = accountAuthClient();
  if (!service)
    return errorResponse(
      "Account status management requires SUPABASE_SECRET_KEY on the server.",
      503,
    );
  const current = await service
    .from("users")
    .select("id, status")
    .eq("id", userId)
    .maybeSingle();
  if (current.error) return errorResponse(current.error.message, 500);
  if (!current.data) return errorResponse("Account not found.", 404);
  const { status } = parsed.data;
  // Block application access before asking Auth to prevent future sign-ins.
  if (status === "inactive") {
    const update = await service
      .from("users")
      .update({ status })
      .eq("id", userId);
    if (update.error) return errorResponse(update.error.message, 400);
  }
  const auth = await service.auth.admin.updateUserById(userId, {
    ban_duration: status === "inactive" ? "876000h" : "none",
  });
  if (auth.error) {
    return errorResponse(
      status === "inactive"
        ? "The account is inactive in MYTOUR, but Auth blocking failed. Retry Deactivate to synchronize it."
        : auth.error.message,
      502,
    );
  }
  if (status === "active") {
    const update = await service
      .from("users")
      .update({ status })
      .eq("id", userId);
    if (update.error)
      return errorResponse(
        "Auth was unblocked, but the account remains inactive in MYTOUR. Retry Reactivate.",
        500,
      );
  }
  return NextResponse.json({ id: userId, status });
}
