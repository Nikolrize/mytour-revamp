"use client";

import { TableLoadingSkeleton } from "@/components/loading-skeletons";

import { AdminTableFilters } from "@/components/admin-table-filters";
import { AdminPasswordRequests } from "@/components/admin-password-requests";
import { canEditAccount, canManageAccount } from "@/lib/account-permissions";
import { useState } from "react";
import { ItineraryPagination } from "@/components/itinerary-pagination";
import { SearchField } from "@/components/search-field";
import { Trash2, UserRoundX, UserRoundCheck } from "lucide-react";
import { useManagedAccounts } from "@/hooks/use-managed-accounts";
import { useProfile } from "@/hooks/use-profile";
import {
  AddAccountDialog,
  EditAccountDialog,
} from "@/components/admin-account-dialog";
import { ConfirmAction } from "@/components/confirm-action";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableText,
} from "@/components/ui/table";
import { getInitials } from "@/lib/utils";

function AccountTable({
  role,
  search,
  compact,
}: {
  role: "admin" | "client";
  search: string;
  compact: boolean;
}) {
  const [pageState, setPageState] = useState({ value: 1, search });
  const page = pageState.search === search ? pageState.value : 1;
  const setPage = (value: number) => setPageState({ value, search });
  const [filters, setFilters] = useState<Record<string, string>>({
    status: "all",
    accountRole: "all",
    sort: "latest",
  });
  const { query, remove, setStatus } = useManagedAccounts(
    { role, page, pageSize: compact ? 5 : 12, search, ...filters },
    true,
  );
  const { profileQuery } = useProfile();
  const visible = query.data?.users ?? [];
  return (
    <section
      className="flex min-w-0 flex-col gap-4 rounded-2xl border border-brand-line bg-white p-4 sm:p-5"
      aria-label={role === "admin" ? "Admins" : "Clients"}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {role === "admin" ? "Admins" : "Clients"}{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({query.data?.total ?? 0})
          </span>
        </h2>
        {!compact &&
          (role === "client" ||
            profileQuery.data?.profile.role === "master_admin") && (
            <AddAccountDialog role={role} />
          )}
      </div>
      {!compact && (
        <AdminTableFilters
          defaults={{ status: "all", accountRole: "all", sort: "latest" }}
          onApply={(values) => {
            setFilters(values);
            setPage(1);
          }}
          definitions={[
            {
              key: "status",
              label: "Status",
              options: [
                { value: "all", label: "All statuses" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ],
            },
            ...(role === "admin"
              ? [
                  {
                    key: "accountRole",
                    label: "Role",
                    options: [
                      { value: "all", label: "All admins" },
                      { value: "admin", label: "Admin" },
                      { value: "master_admin", label: "Master admin" },
                    ],
                  },
                ]
              : []),
            {
              key: "sort",
              label: "Sort by",
              options: [
                { value: "latest", label: "Newest first" },
                { value: "oldest", label: "Oldest first" },
              ],
            },
          ]}
        />
      )}
      {query.error && (
        <p role="alert" className="text-sm text-destructive">
          {query.error.message}
        </p>
      )}
      {query.isPending ? (
        <TableLoadingSkeleton
          rows={5}
          columns={role === "admin" ? 5 : compact ? 4 : 6}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              {role === "admin" && <TableHead>Role</TableHead>}
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              {!compact && role === "client" && (
                <>
                  <TableHead>Trips</TableHead>
                  <TableHead>Posts</TableHead>
                </>
              )}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((account) => (
              <TableRow key={account.id}>
                <TableCell>
                  <div className="flex min-w-0 max-w-72 items-center gap-3">
                    <Avatar className="size-9 shrink-0">
                      {account.avatar_url && (
                        <AvatarImage src={account.avatar_url} alt="" />
                      )}
                      <AvatarFallback>
                        {getInitials(account.display_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="min-w-0">
                        <TableText className="font-medium">
                          {account.display_name}
                        </TableText>
                        <TableText className="text-xs text-muted-foreground">
                          {account.id.slice(0, 8)}
                        </TableText>
                      </div>
                      {profileQuery.data?.profile.id === account.id && (
                        <Badge
                          variant="secondary"
                          className="shrink-0 rounded-full bg-brand-blue-soft text-brand-blue"
                        >
                          You
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                {role === "admin" && (
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-brand-blue-soft text-brand-blue"
                    >
                      {account.role === "master_admin"
                        ? "Master admin"
                        : "Admin"}
                    </Badge>
                  </TableCell>
                )}
                <TableCell>
                  {new Date(account.created_at).toLocaleDateString("en-MY", {
                    timeZone: "Asia/Kuala_Lumpur",
                  })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      account.status === "active"
                        ? "rounded-full bg-emerald-50 text-emerald-700"
                        : "rounded-full bg-destructive/10 text-destructive"
                    }
                  >
                    {account.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                {!compact && role === "client" && (
                  <>
                    <TableCell>{account.tripCount}</TableCell>
                    <TableCell>{account.postCount}</TableCell>
                  </>
                )}
                <TableCell className="overflow-visible">
                  <div className="flex justify-end gap-1">
                    {canEditAccount(
                      profileQuery.data?.profile.id,
                      profileQuery.data?.profile.role,
                      account.id,
                      account.role,
                    ) && <EditAccountDialog account={account} />}
                    {canManageAccount(
                      profileQuery.data?.profile.id,
                      profileQuery.data?.profile.role,
                      account.id,
                      account.role,
                    ) &&
                      !profileQuery.isPending &&
                      !profileQuery.error && (
                        <ConfirmAction
                          title={
                            (account.status === "active"
                              ? "Deactivate "
                              : "Reactivate ") +
                            account.display_name +
                            "?"
                          }
                          description={
                            account.status === "active"
                              ? "This blocks sign-in and protected MYTOUR access. Their account and content are kept."
                              : "This restores sign-in and MYTOUR access."
                          }
                          actionLabel={
                            account.status === "active"
                              ? "Deactivate"
                              : "Reactivate"
                          }
                          variant="ghost"
                          size="icon"
                          confirmClassName={
                            account.status === "active"
                              ? "bg-brand-yellow text-foreground hover:bg-brand-yellow-hover"
                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                          }
                          ariaLabel={
                            (account.status === "active"
                              ? "Deactivate "
                              : "Reactivate ") + account.display_name
                          }
                          className={
                            account.status === "active"
                              ? "rounded-full text-amber-600 hover:bg-brand-yellow-soft hover:text-amber-700"
                              : "rounded-full text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                          }
                          pending={setStatus.isPending}
                          error={setStatus.error?.message}
                          onConfirm={() =>
                            setStatus.mutateAsync({
                              id: account.id,
                              status:
                                account.status === "active"
                                  ? "inactive"
                                  : "active",
                            })
                          }
                        >
                          {account.status === "active" ? (
                            <UserRoundX className="size-4" />
                          ) : (
                            <UserRoundCheck className="size-4" />
                          )}
                        </ConfirmAction>
                      )}

                    {canManageAccount(
                      profileQuery.data?.profile.id,
                      profileQuery.data?.profile.role,
                      account.id,
                      account.role,
                    ) &&
                      !profileQuery.isPending &&
                      !profileQuery.error && (
                        <ConfirmAction
                          title={"Remove " + account.display_name + "?"}
                          description="This permanently deletes their login and associated account data. This cannot be undone."
                          actionLabel="Remove account"
                          variant="ghost"
                          size="icon"
                          destructive
                          ariaLabel={"Remove " + account.display_name}
                          className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                          pending={remove.isPending}
                          error={remove.error?.message}
                          onConfirm={() => remove.mutateAsync(account.id)}
                        >
                          <Trash2 className="size-4" />
                        </ConfirmAction>
                      )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!query.error && !visible.length && (
              <TableRow>
                <TableCell
                  colSpan={role === "admin" ? 5 : compact ? 4 : 6}
                  className="py-8 text-center text-muted-foreground"
                >
                  No matching accounts.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
      {!compact && (
        <ItineraryPagination
          label={role + " account pages"}
          page={query.data?.page ?? page}
          totalPages={query.data?.totalPages ?? 1}
          busy={query.isFetching}
          onPageChange={setPage}
        />
      )}
    </section>
  );
}

export function AdminUsers({ compact = false }: { compact?: boolean }) {
  const [search, setSearch] = useState("");
  const [draftSearch, setDraftSearch] = useState("");
  return (
    <div className="flex flex-col gap-6">
      {!compact && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="managed-account-search">Search accounts</Label>
          <SearchField
            id="managed-account-search"
            value={draftSearch}
            onChange={setDraftSearch}
            onSearch={() => setSearch(draftSearch.trim())}
            placeholder="Search by name or ID"
          />
        </div>
      )}
      {!compact && <AdminPasswordRequests />}
      {!compact && (
        <AccountTable role="admin" search={search} compact={false} />
      )}
      <AccountTable role="client" search={search} compact={compact} />
    </div>
  );
}
