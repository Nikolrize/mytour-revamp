import { NextResponse } from "next/server";
import { getApiContext } from "@/app/api/_shared";

const allowedHosts = new Set([
  "google.com",
  "www.google.com",
  "maps.google.com",
  "maps.app.goo.gl",
  "goo.gl",
  "www.google.co.uk",
]);

function parseCoordinates(value: string) {
  let searchable = value;
  try {
    searchable = decodeURIComponent(value.replace(/\+/g, "%20"));
  } catch {
    // Fall back to matching the original URL when it has malformed escapes.
  }
  const patterns = [
    /@(-?\d{1,2}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/,
    /!3d(-?\d{1,2}(?:\.\d+)?)!4d(-?\d{1,3}(?:\.\d+)?)/,
    /[?&](?:q|query|destination|daddr)=(-?\d{1,2}(?:\.\d+)?)[,%20+]+(-?\d{1,3}(?:\.\d+)?)/i,
  ];
  for (const pattern of patterns) {
    const match = searchable.match(pattern);
    if (!match) continue;
    const latitude = Number(match[1]);
    const longitude = Number(match[2]);
    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    )
      return { latitude, longitude };
  }
  return null;
}

function isAllowedUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" && allowedHosts.has(url.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const { user } = await getApiContext();
  if (!user)
    return NextResponse.json(
      { message: "Sign in to use Maps links." },
      { status: 401 },
    );
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Enter a valid Google Maps link." },
      { status: 400 },
    );
  }
  const mapsUrl =
    body && typeof body === "object"
      ? (body as Record<string, unknown>).mapsUrl
      : null;
  if (
    typeof mapsUrl !== "string" ||
    mapsUrl.length > 2048 ||
    !isAllowedUrl(mapsUrl)
  ) {
    return NextResponse.json(
      {
        message:
          "Paste a Google Maps link beginning with https://www.google.com/maps or https://maps.app.goo.gl.",
      },
      { status: 400 },
    );
  }

  let resolvedUrl = mapsUrl;
  for (
    let attempt = 0;
    attempt < 5 && isAllowedUrl(resolvedUrl);
    attempt += 1
  ) {
    const coords = parseCoordinates(resolvedUrl);
    if (coords) return NextResponse.json(coords);
    let response: Response;
    try {
      response = await fetch(resolvedUrl, {
        method: "GET",
        redirect: "manual",
        signal: AbortSignal.timeout(5000),
        headers: {
          "User-Agent": "MYTOUR/1.0 (Google Maps link coordinate resolver)",
        },
      });
    } catch {
      break;
    }
    const location = response.headers.get("location");
    if (!location) break;
    resolvedUrl = new URL(location, resolvedUrl).toString();
  }
  const coords = isAllowedUrl(resolvedUrl)
    ? parseCoordinates(resolvedUrl)
    : null;
  if (coords) return NextResponse.json(coords);
  return NextResponse.json(
    {
      message:
        "Could not find coordinates in that link. In Google Maps, open the place, choose Share, then copy its link again.",
    },
    { status: 422 },
  );
}
