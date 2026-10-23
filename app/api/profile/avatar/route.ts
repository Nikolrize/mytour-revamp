import { NextResponse } from "next/server";
import { getApiContext } from "@/app/api/_shared";

// Upload a public profile photo with the signed-in user's storage permissions.
export async function POST(request: Request) {
  const { supabase, user } = await getApiContext();
  if (!user)
    return NextResponse.json(
      { message: "Sign in to upload a profile photo." },
      { status: 401 },
    );
  if (Number(request.headers.get("content-length")) > 2162688)
    return NextResponse.json(
      { message: "Choose a photo up to 2 MB." },
      { status: 413 },
    );
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "Invalid photo upload." },
      { status: 400 },
    );
  }
  const photo = form.get("photo");
  if (!(photo instanceof File) || !photo.size || photo.size > 2097152)
    return NextResponse.json(
      { message: "Choose a photo up to 2 MB." },
      { status: 400 },
    );
  const bytes = new Uint8Array(await photo.arrayBuffer());
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
  if (!type || photo.type !== type)
    return NextResponse.json(
      { message: "Choose a valid JPG, PNG, or WebP photo." },
      { status: 400 },
    );
  const path =
    user.id +
    "/" +
    crypto.randomUUID() +
    "." +
    (png ? "png" : jpg ? "jpg" : "webp");
  const bucket = supabase.storage.from("avatars");
  const { error } = await bucket.upload(path, bytes, {
    contentType: type,
    upsert: false,
  });
  if (error)
    return NextResponse.json(
      {
        message:
          "Could not upload your photo. Make sure the avatar storage migration has been applied.",
      },
      { status: 502 },
    );
  return NextResponse.json(
    { avatarUrl: bucket.getPublicUrl(path).data.publicUrl },
    { status: 201 },
  );
}
