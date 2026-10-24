import { errorResponse } from "@/app/api/_response";
import { getApiContext } from "@/app/api/_shared";
import {
  communityError,
  mapPosts,
  photoBucket,
  uuid,
} from "@/app/api/community/_shared";
import { communityPostSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const context = await getApiContext();
  const params = new URL(request.url).searchParams;
  const page = Number(params.get("page") || "1");
  const search = (params.get("search") || "").trim();
  const postId = params.get("postId") || "";
  const kind = params.get("kind") || "all";
  const sort = params.get("sort") || "newest";
  if (
    search.length > 200 ||
    (Boolean(postId) && !uuid.safeParse(postId).success) ||
    !["all", "photos", "itinerary"].includes(kind) ||
    !["newest", "oldest"].includes(sort)
  )
    return errorResponse("Invalid community filters.", 400);
  if (!Number.isInteger(page) || page < 1 || page > 10000)
    return errorResponse("Invalid page.", 400);
  // Match post text and author names before counting and selecting a page.
  const result = await context.supabase.rpc("get_community_post_page", {
    _page: page,
    _search: search,
    _kind: kind,
    _sort: sort,
    _post_id: postId || null,
  });
  if (result.error) return communityError(result.error);
  const { posts, ...pagination } = result.data;
  try {
    return NextResponse.json(
      {
        ...pagination,
        posts: await mapPosts(context, posts ?? []),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (cause) {
    return communityError(cause as { code?: string; message: string });
  }
}

export async function POST(request: Request) {
  const { supabase, user } = await getApiContext();
  if (!user) return errorResponse("Sign in to share a post.", 401);
  if (Number(request.headers.get("content-length")) > 21037056)
    return errorResponse("Photos must total 20 MB or less.", 413);
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse("Invalid post upload.", 400);
  }
  const parsed = communityPostSchema.safeParse({
    content: form.get("content") ?? "",
    tripId: form.get("tripId") || "",
  });
  if (!parsed.success)
    return errorResponse(parsed.error.issues[0].message, 400);
  const entries = form.getAll("photos");
  const photos = entries.filter(
    (value): value is File => value instanceof File,
  );
  if (
    photos.length !== entries.length ||
    photos.length > 10 ||
    photos.some((file) => file.size > 2097152 || file.size === 0) ||
    photos.reduce((total, file) => total + file.size, 0) > 20971520
  )
    return errorResponse(
      "Choose up to ten photos, 2 MB each and 20 MB in total.",
      400,
    );
  if (!parsed.data.content && !photos.length)
    return errorResponse("Write something or add a photo.", 400);
  if (parsed.data.tripId) {
    const trip = await supabase
      .from("trips")
      .select("id")
      .eq("id", parsed.data.tripId)
      .eq("is_public", true)
      .maybeSingle();
    if (trip.error) return communityError(trip.error);
    if (!trip.data)
      return errorResponse(
        "Publish the itinerary in Explore before attaching it to a post.",
        400,
      );
  }
  // Validate actual image signatures before uploading any files.
  const validated = [];
  for (const file of photos) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const png =
      bytes.length >= 8 &&
      [137, 80, 78, 71, 13, 10, 26, 10].every(
        (value, index) => bytes[index] === value,
      );
    const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const webp =
      Buffer.from(bytes.slice(0, 4)).toString() === "RIFF" &&
      Buffer.from(bytes.slice(8, 12)).toString() === "WEBP";
    const type = png
      ? "image/png"
      : jpg
        ? "image/jpeg"
        : webp
          ? "image/webp"
          : null;
    if (!type || file.type !== type)
      return errorResponse(
        "Photos must be valid JPG, PNG, or WebP images.",
        400,
      );
    validated.push({
      bytes,
      type,
      extension: png ? "png" : jpg ? "jpg" : "webp",
    });
  }
  const paths: string[] = [];
  for (const photo of validated) {
    const path = `${user.id}/${crypto.randomUUID()}.${photo.extension}`;
    const result = await supabase.storage
      .from(photoBucket)
      .upload(path, photo.bytes, { contentType: photo.type, upsert: false });
    if (result.error) {
      if (paths.length) await supabase.storage.from(photoBucket).remove(paths);
      return errorResponse(
        "Photo upload failed. Check the community storage migration, then try again.",
        502,
      );
    }
    paths.push(path);
  }
  const result = await supabase
    .from("community_posts")
    .insert({
      user_id: user.id,
      content: parsed.data.content,
      image_paths: paths,
      trip_id: parsed.data.tripId || null,
    })
    .select("id")
    .single();
  if (result.error) {
    if (paths.length) await supabase.storage.from(photoBucket).remove(paths);
    return communityError(result.error);
  }
  return NextResponse.json({ id: result.data.id }, { status: 201 });
}
