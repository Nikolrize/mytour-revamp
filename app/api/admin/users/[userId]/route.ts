import { NextResponse } from "next/server";
import { getApiContext, userIsAdmin } from "@/app/api/_shared";

type Context = { params: Promise<{ userId: string }> };

export async function PATCH(request: Request, context: Context) {
  const { supabase, user } = await getApiContext();
  if (!user)
    return NextResponse.json(
      { message: "Sign in to manage users." },
      { status: 401 },
    );
  if (!(await userIsAdmin(supabase, user.id)))
    return NextResponse.json(
      { message: "Administrator access is required." },
      { status: 403 },
    );
  const { userId } = await context.params;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      userId,
    )
  )
    return NextResponse.json({ message: "Invalid user id." }, { status: 400 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }
  if (
    !body ||
    typeof body !== "object" ||
    typeof (body as Record<string, unknown>).isAdmin !== "boolean"
  )
    return NextResponse.json(
      { message: "Choose whether this user should have administrator access." },
      { status: 400 },
    );
  const isAdmin = (body as { isAdmin: boolean }).isAdmin;
  const { error } = await supabase.rpc("set_admin_role", {
    _target_user_id: userId,
    _enabled: isAdmin,
  });
  if (error)
    return NextResponse.json(
      { message: error.message },
      { status: error.code === "42501" ? 403 : 400 },
    );
  return NextResponse.json({ id: userId, isAdmin });
}
