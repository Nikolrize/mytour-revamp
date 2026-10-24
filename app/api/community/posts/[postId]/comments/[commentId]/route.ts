import { errorResponse } from "@/app/api/_response";
import { getApiContext, userIsAdmin } from "@/app/api/_shared";
import { communityError, uuid } from "@/app/api/community/_shared";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ postId: string; commentId: string }> },
) {
  const api = await getApiContext();
  if (!api.user) return errorResponse("Sign in to remove a comment.", 401);
  const { postId, commentId } = await context.params;
  if (!uuid.safeParse(postId).success || !uuid.safeParse(commentId).success)
    return errorResponse("Comment not found.", 404);
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
    return errorResponse("Comment not found or you cannot remove it.", 404);
  const result = await api.supabase
    .from("community_post_comments")
    .delete()
    .eq("id", commentId)
    .eq("post_id", postId)
    .select("id")
    .maybeSingle();
  if (result.error) return communityError(result.error);
  if (!result.data) return errorResponse("Comment not found.", 404);
  return NextResponse.json({ deleted: true });
}
