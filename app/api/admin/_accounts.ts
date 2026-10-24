import { z } from "zod";
import { canEditAccount } from "@/lib/account-permissions";
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getApiContext } from "@/app/api/_shared";

export async function authorizeAccountManagement(targetId?: string) {
  const context = await getApiContext();
  const base = {
    ...context,
    actorRole: null as import("@/lib/account-permissions").AccountRole | null,
  };
  if (!context.user)
    return {
      ...base,
      denied: NextResponse.json(
        { message: "Sign in required." },
        { status: 401 },
      ),
    };
  const actor = await context.supabase
    .from("users")
    .select("role, status")
    .eq("id", context.user.id)
    .maybeSingle();
  if (actor.error)
    return {
      ...base,
      denied: NextResponse.json(
        { message: "Could not verify administrator permissions." },
        { status: 503 },
      ),
    };
  if (
    actor.data?.status !== "active" ||
    !["admin", "master_admin"].includes(actor.data?.role)
  )
    return {
      ...base,
      denied: NextResponse.json(
        { message: "Admin access required." },
        { status: 403 },
      ),
    };
  const actorRole = actor.data
    .role as import("@/lib/account-permissions").AccountRole;
  if (targetId) {
    if (!z.string().uuid().safeParse(targetId).success)
      return {
        ...base,
        denied: NextResponse.json(
          { message: "Invalid user ID." },
          { status: 400 },
        ),
      };
    const target = await context.supabase
      .from("users")
      .select("id, role")
      .eq("id", targetId)
      .maybeSingle();
    if (target.error)
      return {
        ...base,
        denied: NextResponse.json(
          { message: "Could not load the target account." },
          { status: 500 },
        ),
      };
    if (!target.data)
      return {
        ...base,
        denied: NextResponse.json(
          { message: "Account not found." },
          { status: 404 },
        ),
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
        denied: NextResponse.json(
          { message: "Only master admins can manage other admin accounts." },
          { status: 403 },
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
