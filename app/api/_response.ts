import type { ApiErrorResponse } from "@/lib/type";
import { NextResponse } from "next/server";

// Error responses share a stable shape while keeping existing user-facing messages.
export function errorResponse(message: string | undefined, status = 500) {
  return NextResponse.json<ApiErrorResponse>(
    {
      message: message || "The request could not be completed.",
      code: `HTTP_${status}`,
    },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
