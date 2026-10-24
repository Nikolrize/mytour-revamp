import { NextResponse } from "next/server";
import { getApiContext, userIsAdmin } from "@/app/api/_shared";
import { contentReportSchema } from "@/lib/schemas";
import { uuid } from "@/app/api/community/_shared";

export async function POST(
  request: Request,
  context: { params: Promise<{ postId: string }> },
) {
  const { supabase, user } = await getApiContext();
  if (!user)
    return NextResponse.json(
      { message: "Sign in to report a post." },
      { status: 401 },
    );
  if (await userIsAdmin(supabase, user.id))
    return NextResponse.json(
      { message: "Admins can moderate posts directly." },
      { status: 403 },
    );
  const { postId } = await context.params;
  if (!uuid.safeParse(postId).success)
    return NextResponse.json({ message: "Post not found." }, { status: 404 });
  const parsed = contentReportSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 },
    );
  const post = await supabase
    .from("community_posts")
    .select("id,user_id")
    .eq("id", postId)
    .maybeSingle();
  if (post.error)
    return NextResponse.json(
      { message: "Could not load this post." },
      { status: 500 },
    );
  if (!post.data || post.data.user_id === user.id)
    return NextResponse.json(
      { message: "Post not found or cannot be reported." },
      { status: 404 },
    );
  const result = await supabase
    .from("community_post_reports")
    .insert({
      post_id: postId,
      reporter_id: user.id,
      reason: parsed.data.reason,
      details: parsed.data.details || null,
    });
  if (result.error)
    return NextResponse.json(
      {
        message:
          result.error.code === "23505"
            ? "You already have a pending report for this post."
            : "Could not submit this report. Please try again.",
      },
      { status: result.error.code === "23505" ? 409 : 500 },
    );
  return NextResponse.json({ submitted: true }, { status: 201 });
}
