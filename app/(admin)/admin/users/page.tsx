import { UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminDatabaseTable } from "@/components/admin-database-table";

export default function ManageUsersPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* User management heading */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2">
          <Badge
            variant="outline"
            className="w-fit rounded-full border-brand-line bg-white text-brand-blue"
          >
            People
          </Badge>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Manage users
          </h1>
          <p className="text-sm text-muted-foreground">
            Review traveller accounts and keep the community in good shape.
          </p>
        </div>
        <Button className="h-10 w-fit rounded-full bg-brand-blue px-4 text-white hover:bg-brand-blue-hover">
          <UserPlus className="size-4" /> Invite admin
        </Button>
      </header>
      <AdminDatabaseTable kind="users" searchPlaceholder="Search by name or ID" />
    </div>
  );
}
