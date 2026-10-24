"use client";

import { LoadingBlock } from "@/components/loading-skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { useMapRoute, useMapStops } from "@/hooks/use-map";
import type {
  FitStopsProps,
  LatLng,
  LeafletRouteMapProps,
  LocatedStop,
} from "@/lib/type";
import { divIcon, latLngBounds, type LatLngExpression } from "leaflet";
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

function FitStops({ stops, route }: FitStopsProps) {
  const map = useMap();
  useEffect(() => {
    if (!stops.length) return;
    const bounds = route.length
      ? route
      : stops.map((stop) => [stop.latitude, stop.longitude] as LatLng);
    if (bounds.length === 1) map.setView(bounds[0], 13);
    else
      map.fitBounds(latLngBounds(bounds), { padding: [28, 28], maxZoom: 13 });
  }, [map, stops, route]);
  return null;
}

function stopIcon(index: number) {
  return divIcon({
    className: "mytour-map-marker",
    html: `<span>${index + 1}</span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export function LeafletRouteMap({ stops: inputStops }: LeafletRouteMapProps) {
  const { stops, isLocating } = useMapStops(inputStops);
  const routeQuery = useMapRoute(stops);
  const located = stops.filter(
    (stop): stop is LocatedStop =>
      typeof stop.latitude === "number" && typeof stop.longitude === "number",
  );
  const positions = located.map(
    (stop) => [stop.latitude, stop.longitude] as LatLngExpression,
  );
  const center: LatLngExpression = positions[0] ?? [4.2, 102.3];
  const route = routeQuery.data?.coordinates ?? [];
  const routeState = routeQuery.isPending
    ? "loading"
    : routeQuery.isError
      ? "unavailable"
      : "ready";

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-brand-line">
      <MapContainer
        center={center}
        zoom={6}
        scrollWheelZoom
        className="z-0 h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {located.map((stop, index) => (
          <Marker
            key={stop.id ?? `${stop.place}-${index}`}
            position={[stop.latitude, stop.longitude]}
            icon={stopIcon(stops.indexOf(stop))}
          >
            <Popup>
              <strong>
                {stops.indexOf(stop) + 1}. {stop.place}
              </strong>
              <br />
              Day {stop.day} · {stop.area}
            </Popup>
          </Marker>
        ))}
        {route.length > 1 && (
          <Polyline
            positions={route}
            pathOptions={{ color: "#234899", weight: 5, opacity: 0.88 }}
          />
        )}
        <FitStops stops={located} route={route} />
      </MapContainer>
      {located.length > 1 && (
        <span className="pointer-events-none absolute right-3 bottom-3 z-[400] rounded-full bg-white/95 px-3 py-1.5 text-[10px] text-muted-foreground shadow">
          {routeState === "loading"
            ? "Finding road route…"
            : routeState === "ready"
              ? "Driving route preview"
              : "Road route unavailable for these stops"}
        </span>
      )}
      {located.length > 0 && located.length < stops.length && (
        <span className="pointer-events-none absolute top-3 right-3 z-[400] rounded-xl bg-white/95 px-3 py-2 text-xs text-muted-foreground">
          {isLocating
            ? "Finding remaining places…"
            : `${located.length} of ${stops.length} stops located. Route uses mapped stops only.`}
        </span>
      )}
      {!located.length && (
        <div className="absolute inset-0 z-[400] grid place-items-center bg-background/80 p-5 text-center text-sm text-muted-foreground">
          {isLocating ? (
            <LoadingBlock label="Locating itinerary stops" className="w-full">
              <Skeleton className="h-52 w-full rounded-xl" />
            </LoadingBlock>
          ) : (
            "Could not locate these places automatically. Add a Google Maps link to confirm each location."
          )}
        </div>
      )}
    </div>
  );
}
