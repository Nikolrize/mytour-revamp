"use client";

import { LoadingBlock } from "@/components/loading-skeletons";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { ItineraryStop } from "@/lib/type";
import { Button } from "@/components/ui/button";

const LeafletRouteMap = dynamic(
  () =>
    import("@/components/leaflet-route-map").then(
      (module) => module.LeafletRouteMap,
    ),
  {
    ssr: false,
    loading: () => (
      <LoadingBlock label="Loading route map">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </LoadingBlock>
    ),
  },
);

export function RouteMap({ stops }: { stops: ItineraryStop[] }) {
  if (!stops.length) {
    return (
      <p className="rounded-2xl bg-brand-blue-soft p-5 text-sm text-muted-foreground">
        Add stops to preview your route.
      </p>
    );
  }

  const routeStops = stops.slice(0, 10);
  const places = routeStops.map((stop) =>
    typeof stop.latitude === "number" && typeof stop.longitude === "number"
      ? `${stop.latitude},${stop.longitude}`
      : `${stop.place}, ${stop.area}, Malaysia`,
  );
  const params = new URLSearchParams({
    api: "1",
    origin: places[0],
    destination: places.at(-1)!,
    travelmode: "driving",
  });
  if (places.length > 2) params.set("waypoints", places.slice(1, -1).join("|"));
  const directionsUrl = `https://www.google.com/maps/dir/?${params.toString()}`;

  return (
    <div className="flex flex-col gap-3">
      <LeafletRouteMap stops={routeStops} />
      {stops.length > 1 && (
        <Button
          nativeButton={false}
          render={<a href={directionsUrl} target="_blank" rel="noreferrer" />}
          variant="outline"
          className="w-full rounded-full border-brand-line text-brand-blue"
        >
          Open turn-by-turn route in Google Maps
        </Button>
      )}
      {stops.length > routeStops.length && (
        <p className="text-xs text-muted-foreground">
          The Leaflet preview shows the first 10 stops.
        </p>
      )}
    </div>
  );
}
