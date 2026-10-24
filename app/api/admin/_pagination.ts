import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiContext, userIsAdmin } from "@/app/api/_shared";

const schema = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  pageSize: z.coerce.number().int().min(1).max(12).default(12),
  search: z.string().trim().max(200).default(""),
  role: z.enum(["all", "admin", "client"]).default("all"),
});
// The database filters, counts and pages records with the caller's RLS permissions.
export async function getAdminPage(request: Request, kind: string) {
  const { supabase, user } = await getApiContext();
  if (!user)
    return {
      denied: NextResponse.json(
        { message: "Sign in required." },
        { status: 401 },
      ),
    };
  if (!(await userIsAdmin(supabase, user.id)))
    return {
      denied: NextResponse.json(
        { message: "Admin access required." },
        { status: 403 },
      ),
    };
  const parsed = schema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams),
  );
  if (!parsed.success)
    return {
      denied: NextResponse.json(
        { message: "Invalid pagination or search." },
        { status: 400 },
      ),
    };
  const { page, pageSize, search, role } = parsed.data;
  const result = await supabase.rpc("get_admin_record_page", {
    _kind: kind,
    _page: page,
    _page_size: pageSize,
    _search: search,
    _role: role,
  });
  if (result.error)
    return {
      denied: NextResponse.json(
        { message: "Could not load admin records: " + result.error.message },
        { status: 500 },
      ),
    };
  return {
    supabase,
    data: result.data as {
      records: Record<string, unknown>[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    },
  };
}
