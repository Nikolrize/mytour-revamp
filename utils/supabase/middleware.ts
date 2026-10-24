import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // Verifies the token and refreshes the session when necessary.
  const { data, error: authError } = await supabase.auth.getClaims();
  const userId = authError ? undefined : data?.claims?.sub;
  const pathname = request.nextUrl.pathname;
  const isApi = pathname === "/api" || pathname.startsWith("/api/");
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApi =
    pathname === "/api/admin" || pathname.startsWith("/api/admin/");

  // Preserve refreshed session cookies on redirects and denied requests.
  function respond(response: NextResponse) {
    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => response.cookies.set(cookie));
    return response;
  }
  function redirectTo(destination: string) {
    const url = request.nextUrl.clone();
    url.pathname = destination;
    url.search = "";
    return respond(NextResponse.redirect(url));
  }
  if (!userId) {
    if (isAdminApi)
      return respond(
        NextResponse.json({ message: "Sign in required." }, { status: 401 }),
      );
    const requiresAccount =
      pathname === "/trips" ||
      ["/plan", "/profile"].some(
        (path) => pathname === path || pathname.startsWith(path + "/"),
      );
    if (isAdminPath || requiresAccount) return redirectTo("/login");
    return supabaseResponse;
  }

  const { data: account, error } = await supabase
    .from("users")
    .select("role, status")
    .eq("id", userId)
    .maybeSingle();
  if (
    error ||
    (account && !["client", "admin", "master_admin"].includes(account.role))
  ) {
    return respond(
      NextResponse.json(
        { message: "Could not verify account access. Please try again." },
        { status: 503 },
      ),
    );
  }
  if (account?.status === "inactive") {
    if (pathname.startsWith("/api/auth/")) return supabaseResponse;
    if (isApi)
      return respond(
        NextResponse.json(
          { message: "Your account is deactivated by an admin" },
          { status: 403 },
        ),
      );
    await supabase.auth.signOut({ scope: "local" });
    if (pathname === "/login") return supabaseResponse;
    return redirectTo("/login");
  }
  const isAdmin = account?.role === "admin" || account?.role === "master_admin";
  if (isAdminApi && !isAdmin)
    return respond(
      NextResponse.json({ message: "Admin access required." }, { status: 403 }),
    );
  if (!isApi) {
    const isPublicClientPage = /^\/users\/[^/]+$/.test(pathname) ||
      ["/", "/explore", "/community"].includes(pathname) ||
      /^\/trips\/[^/]+$/.test(pathname);
    const isRecoveryPage = pathname === "/forgot-password";
    if (isAdmin && !isAdminPath && !isPublicClientPage && !isRecoveryPage)
      return redirectTo("/admin");
    if (!isAdmin && isAdminPath) return redirectTo("/");
    return supabaseResponse;
  }

  // Account APIs are shared. Moderation retains read/delete access to community.
  const clientOnly = ["/api/trips", "/api/ai", "/api/maps"].some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
  const communityWrite =
    pathname.startsWith("/api/community/") &&
    !["GET", "HEAD", "DELETE"].includes(request.method);
  const mapPreview =
    request.method === "POST" &&
    ["/api/maps/geocode", "/api/maps/route"].includes(pathname);
  if (
    isAdmin &&
    ((clientOnly && !["GET", "HEAD"].includes(request.method) && !mapPreview) ||
      communityWrite)
  ) {
    return respond(
      NextResponse.json(
        { message: "This feature is available to client accounts only." },
        { status: 403 },
      ),
    );
  }
  return supabaseResponse;
}
