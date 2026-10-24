import { NextResponse } from "next/server";
import { getApiContext } from "@/app/api/_shared";
import { communityPostSchema } from "@/lib/schemas";
import {
  communityError,
  mapPosts,
  photoBucket,
  uuid,
} from "@/app/api/community/_shared";

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
    return NextResponse.json(
      { message: "Invalid community filters." },
      { status: 400 },
    );
  if (!Number.isInteger(page) || page < 1 || page > 10000)
    return NextResponse.json({ message: "Invalid page." }, { status: 400 });
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
  if (!user)
    return NextResponse.json(
      { message: "Sign in to share a post." },
      { status: 401 },
    );
  if (Number(request.headers.get("content-length")) > 21037056)
    return NextResponse.json(
      { message: "Photos must total 20 MB or less." },
      { status: 413 },
    );
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "Invalid post upload." },
      { status: 400 },
    );
  }
  const parsed = communityPostSchema.safeParse({
    content: form.get("content") ?? "",
    tripId: form.get("tripId") || "",
  });
  if (!parsed.success)
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 },
    );
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
    return NextResponse.json(
      { message: "Choose up to ten photos, 2 MB each and 20 MB in total." },
      { status: 400 },
    );
  if (!parsed.data.content && !photos.length)
    return NextResponse.json(
      { message: "Write something or add a photo." },
      { status: 400 },
    );
  if (parsed.data.tripId) {
    const trip = await supabase
      .from("trips")
      .select("id")
      .eq("id", parsed.data.tripId)
      .eq("is_public", true)
      .maybeSingle();
    if (trip.error) return communityError(trip.error);
    if (!trip.data)
      return NextResponse.json(
        {
          message:
            "Publish the itinerary in Explore before attaching it to a post.",
        },
        { status: 400 },
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
      return NextResponse.json(
        { message: "Photos must be valid JPG, PNG, or WebP images." },
        { status: 400 },
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
      return NextResponse.json(
        {
          message:
            "Photo upload failed. Check the community storage migration, then try again.",
        },
        { status: 502 },
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
