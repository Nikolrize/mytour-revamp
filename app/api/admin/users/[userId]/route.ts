import { errorResponse } from "@/app/api/_response";
import {
  accountAuthClient,
  authorizeAccountManagement,
} from "@/app/api/admin/_accounts";
import { adminAccountEditSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";
import { z } from "zod";

type Context = { params: Promise<{ userId: string }> };

// Editing account details never changes the account's role.
export async function PATCH(request: Request, context: Context) {
  const { userId } = await context.params;
  const access = await authorizeAccountManagement(userId);
  if (access.denied) return access.denied;
  if (!z.string().uuid().safeParse(userId).success)
    return errorResponse("Invalid user ID.", 400);
  const parsed = adminAccountEditSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return errorResponse(parsed.error.issues[0].message, 400);
  const service = accountAuthClient();
  if (!service)
    return errorResponse(
      "Editing login details requires SUPABASE_SECRET_KEY on the server.",
      503,
    );
  const existing = await service.auth.admin.getUserById(userId);
  if (existing.error || !existing.data.user)
    return errorResponse("Account not found.", 404);
  const { displayName, email, password } = parsed.data;
  const authUpdate = await service.auth.admin.updateUserById(userId, {
    ...(email.toLowerCase() !== existing.data.user.email?.toLowerCase()
      ? { email, email_confirm: true }
      : {}),
    ...(password ? { password } : {}),
    user_metadata: {
      ...existing.data.user.user_metadata,
      full_name: displayName,
      display_name: displayName,
    },
  });
  if (authUpdate.error) return errorResponse(authUpdate.error.message, 400);
  const { data, error } = await service
    .from("users")
    .update({
      display_name: displayName,
    })
    .eq("id", userId)
    .select("id")
    .maybeSingle();
  if (error || !data)
    return errorResponse(
      "Login details were saved, but the profile update failed. Please retry saving the name.",
      500,
    );
  if (password) {
    const requests = await access.supabase
      .from("password_reset_requests")
      .update({
        status: "handled",
        handled_at: new Date().toISOString(),
        handled_by: access.user!.id,
      })
      .eq("user_id", userId)
      .eq("status", "pending");
    if (requests.error)
      return errorResponse(
        "Account changes were saved, but pending password requests could not be marked as handled.",
        500,
      );
  }
  return NextResponse.json({ id: data.id });
}

export async function DELETE(_request: Request, context: Context) {
  const { userId } = await context.params;
  const access = await authorizeAccountManagement(userId);
  if (access.denied) return access.denied;
  if (!z.string().uuid().safeParse(userId).success)
    return errorResponse("Invalid user ID.", 400);
  if (userId === access.user?.id)
    return errorResponse("You cannot remove your own account.", 400);
  const service = accountAuthClient();
  if (!service)
    return errorResponse(
      "Account removal requires SUPABASE_SECRET_KEY on the server.",
      503,
    );
  // Delete the Auth account, not just the profile, so it cannot sign in again.
  const { error } = await service.auth.admin.deleteUser(userId);
  if (error) return errorResponse(error.message, 400);
  return NextResponse.json({ id: userId });
}

// Email is returned only to an authenticated admin opening this account's editor.
export async function GET(_request: Request, context: Context) {
  const { userId } = await context.params;
  const access = await authorizeAccountManagement(userId);
  if (access.denied) return access.denied;
  if (!z.string().uuid().safeParse(userId).success)
    return errorResponse("Invalid user ID.", 400);
  const service = accountAuthClient();
  if (!service)
    return errorResponse(
      "Loading login details requires SUPABASE_SECRET_KEY on the server.",
      503,
    );
  const result = await service.auth.admin.getUserById(userId);
  if (result.error || !result.data.user)
    return errorResponse("Account not found.", 404);
  return NextResponse.json(
    { email: result.data.user.email || "" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
