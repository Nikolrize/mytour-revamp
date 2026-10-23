import type { Itinerary } from "@/lib/type";

// Date-only trip schedules follow Malaysia's calendar, including the entire end date.
export function getTripStatus(
  startDate: string | null,
  endDate: string | null,
  today: string,
): Itinerary["status"] {
  if (startDate && today < startDate) return "Planning";
  if (endDate && today > endDate) return "Completed";
  if (startDate && today >= startDate) return "Ongoing";
  return "Planning";
}

export function getMalaysiaDate(now: Date): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en", {
      timeZone: "Asia/Kuala_Lumpur",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}
