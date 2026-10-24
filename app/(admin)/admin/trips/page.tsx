import { TableLoadingSkeleton } from "@/components/loading-skeletons";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { AdminDatabaseTable } from "@/components/admin-database-table";

type TripSearchParams = Promise<{ trip?: string | string[] }>;

async function FilteredTripsTable({
  searchParams,
}: {
  searchParams: TripSearchParams;
}) {
  const { trip } = await searchParams;
  return (
    <AdminDatabaseTable
      kind="trips"
      initialSearch={typeof trip === "string" ? trip : ""}
      searchPlaceholder="Search itineraries, authors or locations"
    />
  );
}

export default function ManageTripsPage({
  searchParams,
}: {
  searchParams: TripSearchParams;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Itinerary management heading */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2">
          <Badge
            variant="outline"
            className="w-fit rounded-full border-brand-line bg-white text-brand-blue"
          >
            Itineraries
          </Badge>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Manage trips
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and manage public routes shared by travellers.
          </p>
        </div>
      </header>
      <Suspense fallback={<TableLoadingSkeleton toolbar />}>
        <FilteredTripsTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
