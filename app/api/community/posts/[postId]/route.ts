import { errorResponse } from "@/app/api/_response";
import { getApiContext, userIsAdmin } from "@/app/api/_shared";
import { communityError, photoBucket, uuid } from "@/app/api/community/_shared";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ postId: string }> },
) {
  const { supabase, user } = await getApiContext();
  if (!user) return errorResponse("Sign in to delete a post.", 401);
  const { postId } = await context.params;
  if (!uuid.safeParse(postId).success)
    return errorResponse("Post not found.", 404);
  const post = await supabase
    .from("community_posts")
    .select("id, user_id, image_paths")
    .eq("id", postId)
    .maybeSingle();
  if (post.error) return communityError(post.error);
  if (
    !post.data ||
    (post.data.user_id !== user.id && !(await userIsAdmin(supabase, user.id)))
  )
    return errorResponse("Post not found or you cannot delete it.", 404);
  const result = await supabase
    .from("community_posts")
    .delete()
    .eq("id", postId)
    .select("id")
    .maybeSingle();
  if (result.error) return communityError(result.error);
  if (!result.data) return errorResponse("Post not found.", 404);
  // Keep database deletion authoritative; a storage outage must not resurrect a deleted post.
  if (post.data.image_paths.length) {
    const cleanup = await supabase.storage
      .from(photoBucket)
      .remove(post.data.image_paths);
    if (cleanup.error)
      console.warn("Community photo cleanup failed", { postId });
  }
  return NextResponse.json({ deleted: true });
}
