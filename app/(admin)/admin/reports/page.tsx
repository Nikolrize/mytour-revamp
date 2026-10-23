import { MessageSquareText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminDatabaseTable } from "@/components/admin-database-table";

export default function ManageReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Community moderation heading */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2">
          <Badge
            variant="outline"
            className="w-fit rounded-full border-brand-line bg-white text-brand-blue"
          >
            Community
          </Badge>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Trip reports
          </h1>
          <p className="text-sm text-muted-foreground">
            Review reports submitted about published itineraries.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-muted-foreground">
          <MessageSquareText className="size-4 text-brand-blue" />
          Review open trip reports
        </div>
      </header>
      <AdminDatabaseTable
        kind="reports"
        searchPlaceholder="Search trip, reporter or reason"
      />
    </div>
  );
}
