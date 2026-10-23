import { NextResponse } from "next/server";
import { getApiContext } from "@/app/api/_shared";
import { communityError, postExists, uuid } from "@/app/api/community/_shared";

type Context = { params: Promise<{ postId: string }> };
async function changeLike(context: Context, liked: boolean) {
  const api = await getApiContext();
  if (!api.user)
    return NextResponse.json(
      { message: "Sign in to like a post." },
      { status: 401 },
    );
  const { postId } = await context.params;
  if (!uuid.safeParse(postId).success)
    return NextResponse.json({ message: "Post not found." }, { status: 404 });
  const post = await postExists(api, postId);
  if (post.error) return communityError(post.error);
  if (!post.data)
    return NextResponse.json({ message: "Post not found." }, { status: 404 });
  const result = liked
    ? await api.supabase
        .from("community_post_likes")
        .upsert(
          { post_id: postId, user_id: api.user.id },
          { onConflict: "post_id,user_id", ignoreDuplicates: true },
        )
    : await api.supabase
        .from("community_post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", api.user.id);
  if (result.error) return communityError(result.error);
  return NextResponse.json({ liked });
}
export async function POST(_request: Request, context: Context) {
  return changeLike(context, true);
}
export async function DELETE(_request: Request, context: Context) {
  return changeLike(context, false);
}
