import { Map } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminDatabaseTable } from "@/components/admin-database-table";

export default function ManageTripsPage() {
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
        <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-muted-foreground">
          <Map className="size-4 text-brand-blue" />
          Live Supabase itineraries
        </div>
      </header>
      <AdminDatabaseTable kind="trips" searchPlaceholder="Search itineraries, authors or locations" />
    </div>
  );
}
