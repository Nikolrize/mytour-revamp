"use client";

import { Flag, Map, MessageSquareText, Users } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { useAdminOverview } from "@/hooks/use-admin";

const definitions = [
  {
    key: "users",
    label: "Registered travellers",
    icon: Users,
    tone: "bg-brand-blue-soft text-brand-blue",
  },
  {
    key: "publicTrips",
    label: "Community itineraries",
    icon: Map,
    tone: "bg-brand-yellow-soft text-brand-red-deep",
  },
  {
    key: "comments",
    label: "Trip comments",
    icon: MessageSquareText,
    tone: "bg-brand-red-soft text-brand-red",
  },
  {
    key: "openReports",
    label: "Items needing review",
    icon: Flag,
    tone: "bg-amber-50 text-amber-700",
  },
] as const;

export function AdminOverviewMetrics() {
  const query = useAdminOverview();
  const counts = query.data ?? {};
  return (
    <section className="flex flex-col gap-2" aria-label="Platform metrics">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {definitions.map(({ key, label, icon, tone }) => (
          <MetricCard
            key={key}
            label={label}
            value={counts[key] ?? "—"}
            detail="Live Supabase count"
            icon={icon}
            iconTone={tone}
          />
        ))}
      </div>
      {query.error && (
        <p role="alert" className="text-sm text-destructive">
          {query.error.message}
        </p>
      )}
    </section>
  );
}
