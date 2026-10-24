import { errorResponse } from "@/app/api/_response";
import { geocodeRequestSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";

type Coordinates = { latitude: number; longitude: number };
const cache = new Map<
  string,
  { expires: number; result: Coordinates | null }
>();
let queue: Promise<unknown> = Promise.resolve();

// Serialize uncached requests and cache matches to limit public demo traffic.
function locate(name: string, area: string): Promise<Coordinates | null> {
  const key = JSON.stringify([name.toLowerCase(), area.toLowerCase()]);
  const run = queue.then(async () => {
    const cached = cache.get(key);
    if (cached && cached.expires > Date.now()) return cached.result;
    const url = new URL(
      process.env.PHOTON_GEOCODING_URL || "https://photon.komoot.io/api/",
    );
    url.searchParams.set("q", `${name}, ${area}, Malaysia`);
    url.searchParams.set("limit", "3");
    url.searchParams.set("lang", "en");
    url.searchParams.set("bbox", "99,0,120,8");
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "MYTOUR/1.0 (Malaysia itinerary map)" },
        signal: AbortSignal.timeout(5000),
        next: { revalidate: 86400 },
      });
      if (!response.ok) throw new Error("Geocoding unavailable");
      const data = await response.json();
      const match = data.features?.find(
        (feature: {
          properties?: { countrycode?: string };
          geometry?: { coordinates?: number[] };
        }) => {
          const coords = feature.geometry?.coordinates;
          return (
            feature.properties?.countrycode?.toUpperCase() === "MY" &&
            coords?.length === 2 &&
            coords.every(Number.isFinite) &&
            coords[0] >= 99 &&
            coords[0] <= 120 &&
            coords[1] >= 0 &&
            coords[1] <= 8
          );
        },
      );
      const coords = match?.geometry.coordinates;
      const result = coords
        ? { latitude: coords[1], longitude: coords[0] }
        : null;
      if (cache.size >= 1000) cache.delete(cache.keys().next().value!);
      cache.set(key, {
        result,
        expires: Date.now() + (result ? 86400000 : 60000),
      });
      return result;
    } catch {
      return null;
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  });
  queue = run.catch(() => undefined);
  return run;
}

export async function POST(request: Request) {
  const parsed = geocodeRequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return errorResponse("Provide up to ten place names and areas.", 400);
  const coordinates = [];
  for (const place of parsed.data.places)
    coordinates.push(await locate(place.name, place.area));
  return NextResponse.json({ coordinates });
}
