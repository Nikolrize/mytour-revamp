import Link from "next/link";
import { ArrowRight, Flag, Map, MessageSquareText, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminManagementTable } from "@/components/admin-management-table";
import { MetricCard } from "@/components/metric-card";
import { adminPosts, adminTrips, adminUsers } from "@/lib/admin-data";

const metrics = [
  {
    label: "Registered travellers",
    value: "2,048",
    change: "+8.2% this month",
    icon: Users,
    tone: "bg-brand-blue-soft text-brand-blue",
  },
  {
    label: "Community itineraries",
    value: "684",
    change: "+12.4% this month",
    icon: Map,
    tone: "bg-brand-yellow-soft text-brand-red-deep",
  },
  {
    label: "Comments this month",
    value: "1,392",
    change: "+6.1% this month",
    icon: MessageSquareText,
    tone: "bg-brand-red-soft text-brand-red",
  },
  {
    label: "Items needing review",
    value: "7",
    change: "3 reports · 4 pending",
    icon: Flag,
    tone: "bg-amber-50 text-amber-700",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-7">
      {/* Dashboard introduction */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2">
          <Badge
            variant="outline"
            className="w-fit rounded-full border-brand-line bg-white text-brand-blue"
          >
            Overview
          </Badge>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Good morning, Alex
          </h1>
          <p className="text-sm text-muted-foreground">
            Here’s what’s happening across the MYTOUR community.
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          Thursday, 22 October 2026
        </span>
      </header>

      {/* Admin metrics */}
      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Platform metrics"
      >
        {metrics.map(({ label, value, change, icon, tone }) => (
          <MetricCard
            key={label}
            label={label}
            value={value}
            detail={change}
            icon={icon}
            iconTone={tone}
          />
        ))}
      </section>

      {/* Moderation queue */}
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Needs your attention
            </h2>
            <p className="text-sm text-muted-foreground">
              Review reported and newly submitted community content.
            </p>
          </div>
          <Button
            nativeButton={false}
            render={<Link href="/admin/posts" />}
            variant="outline"
            className="h-9 shrink-0 rounded-full border-brand-line bg-white text-brand-blue"
          >
            Open moderation <ArrowRight className="size-4" />
          </Button>
        </div>
        <AdminManagementTable
          rows={adminPosts.filter((row) => row.status !== "Published")}
          entityLabel="posts"
          searchPlaceholder="Search moderation queue"
        />
      </section>

      {/* Recent platform activity */}
      <section className="grid gap-5 xl:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold">New travellers</h2>
              <p className="text-sm text-muted-foreground">
                Recently joined members
              </p>
            </div>
            <Link
              href="/admin/users"
              className="flex items-center gap-1 text-sm font-medium text-brand-blue"
            >
              Manage <ArrowRight className="size-4" />
            </Link>
          </div>
          <AdminManagementTable
            rows={adminUsers.slice(0, 3)}
            entityLabel="users"
            searchPlaceholder="Search travellers"
          />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold">Recent itineraries</h2>
              <p className="text-sm text-muted-foreground">
                Latest routes shared by the community
              </p>
            </div>
            <Link
              href="/admin/trips"
              className="flex items-center gap-1 text-sm font-medium text-brand-blue"
            >
              Manage <ArrowRight className="size-4" />
            </Link>
          </div>
          <AdminManagementTable
            rows={adminTrips}
            entityLabel="trips"
            searchPlaceholder="Search itineraries"
          />
        </div>
      </section>
    </div>
  );
}
