import { errorResponse } from "@/app/api/_response";
import { mapTripsToItineraries, type TripRow } from "@/app/api/_shared";
import { getAdminPage } from "@/app/api/admin/_pagination";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const result = await getAdminPage(request, "trips");
  if (result.denied) return result.denied;
  try {
    const { records, ...pagination } = result.data!;
    return NextResponse.json(
      {
        trips: await mapTripsToItineraries(
          result.supabase!,
          records as unknown as TripRow[],
        ),
        ...pagination,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (cause) {
    return errorResponse(
      cause instanceof Error ? cause.message : "Could not load trips.",
      500,
    );
  }
}
