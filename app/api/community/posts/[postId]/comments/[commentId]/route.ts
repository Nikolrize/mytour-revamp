import { NextResponse } from "next/server";
import { getApiContext, userIsAdmin } from "@/app/api/_shared";
import { communityError, uuid } from "@/app/api/community/_shared";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ postId: string; commentId: string }> },
) {
  const api = await getApiContext();
  if (!api.user)
    return NextResponse.json(
      { message: "Sign in to remove a comment." },
      { status: 401 },
    );
  const { postId, commentId } = await context.params;
  if (!uuid.safeParse(postId).success || !uuid.safeParse(commentId).success)
    return NextResponse.json(
      { message: "Comment not found." },
      { status: 404 },
    );
  const comment = await api.supabase
    .from("community_post_comments")
    .select("id, user_id")
    .eq("id", commentId)
    .eq("post_id", postId)
    .maybeSingle();
  if (comment.error) return communityError(comment.error);
  if (
    !comment.data ||
    (comment.data.user_id !== api.user.id &&
      !(await userIsAdmin(api.supabase, api.user.id)))
  )
    return NextResponse.json(
      { message: "Comment not found or you cannot remove it." },
      { status: 404 },
    );
  const result = await api.supabase
    .from("community_post_comments")
    .delete()
    .eq("id", commentId)
    .eq("post_id", postId)
    .select("id")
    .maybeSingle();
  if (result.error) return communityError(result.error);
  if (!result.data)
    return NextResponse.json(
      { message: "Comment not found." },
      { status: 404 },
    );
  return NextResponse.json({ deleted: true });
}
