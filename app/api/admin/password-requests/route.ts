import { NextResponse } from "next/server";
import { getAdminPage } from "@/app/api/admin/_pagination";

export async function GET(request: Request) {
  const result = await getAdminPage(request, "password-requests");
  if (result.denied) return result.denied;
  const { records, ...pagination } = result.data!;
  return NextResponse.json(
    { requests: records, ...pagination },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
