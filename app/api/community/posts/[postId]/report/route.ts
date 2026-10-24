import { errorResponse } from "@/app/api/_response";
import { getApiContext, userIsAdmin } from "@/app/api/_shared";
import { uuid } from "@/app/api/community/_shared";
import { contentReportSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ postId: string }> },
) {
  const { supabase, user } = await getApiContext();
  if (!user) return errorResponse("Sign in to report a post.", 401);
  if (await userIsAdmin(supabase, user.id))
    return errorResponse("Admins can moderate posts directly.", 403);
  const { postId } = await context.params;
  if (!uuid.safeParse(postId).success)
    return errorResponse("Post not found.", 404);
  const parsed = contentReportSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return errorResponse(parsed.error.issues[0].message, 400);
  const post = await supabase
    .from("community_posts")
    .select("id,user_id")
    .eq("id", postId)
    .maybeSingle();
  if (post.error) return errorResponse("Could not load this post.", 500);
  if (!post.data || post.data.user_id === user.id)
    return errorResponse("Post not found or cannot be reported.", 404);
  const result = await supabase.from("community_post_reports").insert({
    post_id: postId,
    reporter_id: user.id,
    reason: parsed.data.reason,
    details: parsed.data.details || null,
  });
  if (result.error)
    return errorResponse(
      result.error.code === "23505"
        ? "You already have a pending report for this post."
        : "Could not submit this report. Please try again.",
      result.error.code === "23505" ? 409 : 500,
    );
  return NextResponse.json({ submitted: true }, { status: 201 });
}
