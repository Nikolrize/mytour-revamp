import { errorResponse } from "@/app/api/_response";
import { getApiContext } from "@/app/api/_shared";
import { canEditAccount } from "@/lib/account-permissions";
import type { AccountRole } from "@/lib/type";
import { createClient } from "@supabase/supabase-js";
import "server-only";
import { z } from "zod";

export async function authorizeAccountManagement(targetId?: string) {
  const context = await getApiContext();
  const base = {
    ...context,
    actorRole: null as AccountRole | null,
  };
  if (!context.user)
    return {
      ...base,
      denied: errorResponse("Sign in required.", 401),
    };
  const actor = await context.supabase
    .from("users")
    .select("role, status")
    .eq("id", context.user.id)
    .maybeSingle();
  if (actor.error)
    return {
      ...base,
      denied: errorResponse("Could not verify administrator permissions.", 503),
    };
  if (
    actor.data?.status !== "active" ||
    !["admin", "master_admin"].includes(actor.data?.role)
  )
    return {
      ...base,
      denied: errorResponse("Admin access required.", 403),
    };
  const actorRole = actor.data.role as AccountRole;
  if (targetId) {
    if (!z.string().uuid().safeParse(targetId).success)
      return {
        ...base,
        denied: errorResponse("Invalid user ID.", 400),
      };
    const target = await context.supabase
      .from("users")
      .select("id, role")
      .eq("id", targetId)
      .maybeSingle();
    if (target.error)
      return {
        ...base,
        denied: errorResponse("Could not load the target account.", 500),
      };
    if (!target.data)
      return {
        ...base,
        denied: errorResponse("Account not found.", 404),
      };
    if (
      !canEditAccount(
        context.user.id,
        actorRole,
        target.data.id,
        target.data.role,
      )
    )
      return {
        ...base,
        denied: errorResponse(
          "Only master admins can manage other admin accounts.",
          403,
        ),
      };
  }
  return { ...context, actorRole, denied: null };
}

// Server-only privileged client. Account operations require authorization; the public reset-request endpoint may only call its restricted request-submission RPC.
export function accountAuthClient() {
  const key =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
