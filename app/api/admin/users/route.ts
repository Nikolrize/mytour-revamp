import { adminAccountCreateSchema } from "@/lib/schemas";
import {
  authorizeAccountManagement,
  accountAuthClient,
} from "@/app/api/admin/_accounts";
import { NextResponse } from "next/server";
import { getAdminPage } from "@/app/api/admin/_pagination";

export async function GET(request: Request) {
  const result = await getAdminPage(request, "users");
  if (result.denied) return result.denied;
  const { records, ...pagination } = result.data!;
  return NextResponse.json(
    { users: records, ...pagination },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
export async function POST(request: Request) {
  const access = await authorizeAccountManagement();
  if (access.denied) return access.denied;
  const parsed = adminAccountCreateSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 },
    );
  const service = accountAuthClient();
  if (!service)
    return NextResponse.json(
      {
        message: "Account creation requires SUPABASE_SECRET_KEY on the server.",
      },
      { status: 503 },
    );
  const values = parsed.data;
  if (values.role === "admin" && access.actorRole !== "master_admin")
    return NextResponse.json(
      { message: "Only master admins can create admin accounts." },
      { status: 403 },
    );
  const created = await service.auth.admin.createUser({
    email: values.email,
    password: values.password,
    email_confirm: true,
    user_metadata: {
      full_name: values.displayName,
      display_name: values.displayName,
    },
  });
  if (created.error || !created.data.user)
    return NextResponse.json(
      { message: created.error?.message || "Could not create account." },
      { status: 400 },
    );
  // Role comes from the validated admin request, never from editable user metadata.
  const saved = await service.from("users").upsert(
    {
      id: created.data.user.id,
      display_name: values.displayName,
      role: values.role,
    },
    { onConflict: "id" },
  );
  if (saved.error) {
    const cleanup = await service.auth.admin.deleteUser(created.data.user.id);
    return NextResponse.json(
      {
        message: cleanup.error
          ? "Account setup failed. A login may remain; review Authentication users before retrying."
          : "Could not save the account profile. No login was retained.",
      },
      { status: 500 },
    );
  }
  return NextResponse.json({ id: created.data.user.id }, { status: 201 });
}
