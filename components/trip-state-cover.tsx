import { stateImages } from "@/lib/data";
import { getTripStates } from "@/lib/trip-filters";
import type { Itinerary } from "@/lib/type";

// Keep every selected state's image visible within the fixed card cover.
export function TripStateCover({ trip }: { trip: Itinerary }) {
  const states = [...new Set(getTripStates(trip))];
  const images = states.flatMap((state) => {
    const key = Object.keys(stateImages).find(
      (name) => name.toLowerCase() === state.toLowerCase(),
    );
    return key ? [{ state, src: stateImages[key] }] : [];
  });
  const columns =
    images.length <= 1
      ? 1
      : images.length <= 4
        ? 2
        : Math.ceil(Math.sqrt(images.length));
  const rows = Math.max(1, Math.ceil(images.length / columns));
  return (
    <div
      className="absolute inset-0 grid gap-0.5 overflow-hidden bg-brand-blue-soft"
      style={{
        gridTemplateColumns: "repeat(" + columns + ", minmax(0, 1fr))",
        gridTemplateRows: "repeat(" + rows + ", minmax(0, 1fr))",
      }}
      aria-hidden="true"
    >
      {images.map((image, index) => (
        <div
          key={image.state}
          className="min-h-0 min-w-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('" + image.src + "')",
            gridColumn:
              index === images.length - 1 && images.length % columns
                ? "span " + (columns - (images.length % columns) + 1)
                : undefined,
          }}
        />
      ))}
    </div>
  );
}
