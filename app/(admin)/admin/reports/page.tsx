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
            Reports
          </h1>
          <p className="text-sm text-muted-foreground">
            Review reports about shared itineraries and community posts.
          </p>
        </div>
      </header>
      <AdminDatabaseTable
        kind="reports"
        searchPlaceholder="Search content, reporter, type or reason"
      />
    </div>
  );
}
