import { errorResponse } from "@/app/api/_response";
import { NextResponse } from "next/server";

type Coordinate = { latitude: number; longitude: number };

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid route request.", 400);
  }
  const coordinates =
    body && typeof body === "object"
      ? (body as Record<string, unknown>).coordinates
      : null;
  if (
    !Array.isArray(coordinates) ||
    coordinates.length < 2 ||
    coordinates.length > 10
  ) {
    return errorResponse(
      "A route needs between two and ten mapped stops.",
      400,
    );
  }
  const points = coordinates as Coordinate[];
  if (
    points.some(
      (point) =>
        !point ||
        !Number.isFinite(point.latitude) ||
        !Number.isFinite(point.longitude) ||
        point.latitude < -90 ||
        point.latitude > 90 ||
        point.longitude < -180 ||
        point.longitude > 180,
    )
  ) {
    return errorResponse("One or more stop coordinates are invalid.", 400);
  }

  const routeBase = (
    process.env.OSRM_ROUTING_URL || "https://router.project-osrm.org"
  ).replace(/\/+$/, "");
  const routeCoordinates = points
    .map(({ latitude, longitude }) => `${longitude},${latitude}`)
    .join(";");
  try {
    const response = await fetch(
      `${routeBase}/route/v1/driving/${routeCoordinates}?overview=full&geometries=geojson&steps=false`,
      { signal: AbortSignal.timeout(10000), next: { revalidate: 3600 } },
    );
    if (!response.ok)
      return errorResponse("Road routing is temporarily unavailable.", 502);
    const result = await response.json();
    const route = result?.routes?.[0];
    if (result?.code !== "Ok" || !Array.isArray(route?.geometry?.coordinates)) {
      return errorResponse(
        "No connected driving route was found for these stops.",
        422,
      );
    }
    return NextResponse.json({
      coordinates: route.geometry.coordinates.map(
        ([longitude, latitude]: [number, number]) => [latitude, longitude],
      ),
    });
  } catch {
    return errorResponse("Road routing is temporarily unavailable.", 502);
  }
}
