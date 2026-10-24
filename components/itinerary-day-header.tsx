import type { ItineraryDayHeaderProps } from "@/lib/type";
import { CalendarDays } from "lucide-react";

// A consistent day heading for the builder, trip details, and homepage example.
export function ItineraryDayHeader({
  day,
  stopCount,
  area,
}: ItineraryDayHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-line pb-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-blue-soft text-brand-blue">
          <CalendarDays className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3
            className={
              area
                ? "text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase"
                : "font-semibold"
            }
          >
            Day {day}
          </h3>
          {area && <p className="break-words font-semibold">{area}</p>}
        </div>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">
        {stopCount} {stopCount === 1 ? "stop" : "stops"}
      </span>
    </div>
  );
}
