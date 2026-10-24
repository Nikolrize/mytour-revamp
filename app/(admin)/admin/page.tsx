import { AdminUsers } from "@/components/admin-users";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminDatabaseTable } from "@/components/admin-database-table";
import { AdminOverviewMetrics } from "@/components/admin-overview-metrics";

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
            Admin overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Live activity across the MYTOUR community.
          </p>
        </div>
      </header>

      {/* Admin metrics */}
      <AdminOverviewMetrics />

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
            render={<Link href="/admin/reports" />}
            variant="outline"
            className="h-9 shrink-0 rounded-full border-brand-line bg-white text-brand-blue"
          >
            Open moderation <ArrowRight className="size-4" />
          </Button>
        </div>
        <AdminDatabaseTable compact kind="reports" searchPlaceholder="Search moderation queue" />
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
            <Button
              nativeButton={false}
              render={<Link href="/admin/users" />}
              variant="outline"
              className="h-9 shrink-0 rounded-full border-brand-line bg-white text-brand-blue"
            >
              Manage <ArrowRight className="size-4" />
            </Button>
          </div>
          <AdminUsers compact />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold">Recent itineraries</h2>
              <p className="text-sm text-muted-foreground">
                Latest routes shared by the community
              </p>
            </div>
            <Button
              nativeButton={false}
              render={<Link href="/admin/trips" />}
              variant="outline"
              className="h-9 shrink-0 rounded-full border-brand-line bg-white text-brand-blue"
            >
              Manage <ArrowRight className="size-4" />
            </Button>
          </div>
          <AdminDatabaseTable compact kind="trips" searchPlaceholder="Search itineraries" />
        </div>
      </section>
    </div>
  );
}
