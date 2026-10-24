import { errorResponse } from "@/app/api/_response";
import { getApiContext, userIsAdmin } from "@/app/api/_shared";
import {
  authors,
  communityError,
  postExists,
  uuid,
} from "@/app/api/community/_shared";
import { communityCommentSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ postId: string }> };
export async function GET(request: Request, context: Context) {
  const api = await getApiContext();
  const { postId } = await context.params;
  const page = Number(new URL(request.url).searchParams.get("page") || "0");
  if (
    !uuid.safeParse(postId).success ||
    !Number.isInteger(page) ||
    page < 0 ||
    page > 10000
  )
    return errorResponse("Invalid comment request.", 400);
  const post = await postExists(api, postId);
  if (post.error) return communityError(post.error);
  if (!post.data) return errorResponse("Post not found.", 404);
  const result = await api.supabase
    .from("community_post_comments")
    .select("id, user_id, content, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(page * 20, page * 20 + 20);
  if (result.error) return communityError(result.error);
  const rows = (result.data ?? []).slice(0, 20);
  try {
    const [people, admin] = await Promise.all([
      rows.length
        ? authors(
            api,
            rows.map((row) => row.user_id),
          )
        : new Map(),
      api.user ? userIsAdmin(api.supabase, api.user.id) : false,
    ]);
    return NextResponse.json({
      comments: rows.map((row) => ({
        id: row.id,
        content: row.content,
        createdAt: row.created_at,
        author: people.get(row.user_id) ?? {
          name: "Traveller",
          avatarUrl: null,
        },
        canDelete: row.user_id === api.user?.id || admin,
      })),
      nextPage: (result.data?.length ?? 0) > 20 ? page + 1 : null,
    });
  } catch (cause) {
    return communityError(cause as { code?: string; message: string });
  }
}
export async function POST(request: Request, context: Context) {
  const api = await getApiContext();
  if (!api.user) return errorResponse("Sign in to comment.", 401);
  const { postId } = await context.params;
  if (!uuid.safeParse(postId).success)
    return errorResponse("Post not found.", 404);
  const parsed = communityCommentSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return errorResponse(parsed.error.issues[0].message, 400);
  const post = await postExists(api, postId);
  if (post.error) return communityError(post.error);
  if (!post.data) return errorResponse("Post not found.", 404);
  const result = await api.supabase
    .from("community_post_comments")
    .insert({
      post_id: postId,
      user_id: api.user.id,
      content: parsed.data.content,
    })
    .select("id")
    .single();
  if (result.error) return communityError(result.error);
  return NextResponse.json({ id: result.data.id }, { status: 201 });
}
