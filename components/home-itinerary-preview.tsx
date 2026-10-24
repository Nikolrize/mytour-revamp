import { CalendarDays, MapPin } from "lucide-react";
import { homeItineraryPreview } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// A fixed example demonstrates the itinerary layout without API requests.
export function HomeItineraryPreview() {
  const trip = homeItineraryPreview;
  const { day, stops } = trip;
  return (
    <Card className="rounded-[22px] border-brand-line bg-white shadow-none">
      <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
        <p className="text-xs text-muted-foreground">Example itinerary</p>
        <div className="flex items-center justify-between gap-3">
          <h3 className="truncate font-semibold text-brand-blue">
            {trip.title}
          </h3>
          <Badge variant="secondary" className="shrink-0 rounded-full">
            {trip.days}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-line pb-4">
          <h3 className="flex items-center gap-2 font-semibold">
            <CalendarDays className="size-4 text-brand-blue" />
            Day {day}
          </h3>
          <span className="text-xs text-muted-foreground">
            {stops.length} stops
          </span>
        </div>
        {stops.slice(0, 3).map((stop, index) => (
          <div key={index} className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-blue-soft text-brand-blue">
              <MapPin className="size-4" />
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-xs text-muted-foreground">
                {stop.time} · {stop.area}
              </p>
              <h4 className="truncate text-sm font-medium">{stop.place}</h4>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {stop.note}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
