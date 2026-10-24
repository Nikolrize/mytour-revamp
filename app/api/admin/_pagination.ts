import { errorResponse } from "@/app/api/_response";
import { getApiContext, userIsAdmin } from "@/app/api/_shared";
import { adminPaginationSchema } from "@/lib/schemas";

// The database filters, counts and pages records with the caller's RLS permissions.
export async function getAdminPage(request: Request, kind: string) {
  const { supabase, user } = await getApiContext();
  if (!user)
    return {
      denied: errorResponse("Sign in required.", 401),
    };
  if (!(await userIsAdmin(supabase, user.id)))
    return {
      denied: errorResponse("Admin access required.", 403),
    };
  const parsed = adminPaginationSchema.safeParse({
    sort: kind === "password-requests" ? "oldest" : "latest",
    ...Object.fromEntries(new URL(request.url).searchParams),
  });
  if (!parsed.success)
    return {
      denied: errorResponse("Invalid pagination or search.", 400),
    };
  const { page, pageSize, search, role, ...filters } = parsed.data;
  const result = await supabase.rpc("get_filtered_admin_record_page", {
    _kind: kind,
    _page: page,
    _page_size: pageSize,
    _search: search,
    _role: role,
    _filters: filters,
  });
  if (result.error)
    return {
      denied: errorResponse(
        "Could not load admin records: " + result.error.message,
        500,
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
