import { Badge } from "@/components/ui/badge";
import { AdminUsers } from "@/components/admin-users";

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
      </header>
      <AdminUsers />
    </div>
  );
}
