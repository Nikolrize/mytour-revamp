import { Badge } from "@/components/ui/badge";
import type { TripStatusBadgeProps } from "@/lib/type";

export function TripStatusBadge({ status }: TripStatusBadgeProps) {
  const tone =
    status === "Ongoing"
      ? "bg-brand-yellow-soft text-amber-800"
      : status === "Completed"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-brand-blue-soft text-brand-blue";
  return (
    <Badge
      variant="secondary"
      className={`rounded-full border-transparent px-3 py-1 ${tone}`}
    >
      {status}
    </Badge>
  );
}
