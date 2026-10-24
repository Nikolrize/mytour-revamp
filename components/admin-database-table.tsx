"use client";

import { TableLoadingSkeleton } from "@/components/loading-skeletons";

import Link from "next/link";
import { AdminTableFilters } from "@/components/admin-table-filters";
import { AdminReportDialog } from "@/components/admin-report-dialog";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { ConfirmAction } from "@/components/confirm-action";
import { useMemo, useState } from "react";
import { ItineraryPagination } from "@/components/itinerary-pagination";
import { AdminManagementTable } from "@/components/admin-management-table";
import type { AdminRow } from "@/lib/admin-data";
import { useAdminRecords } from "@/hooks/use-admin";

type Kind = "trips" | "reports";
type Props = {
  kind: Kind;
  searchPlaceholder: string;
  initialSearch?: string;
  compact?: boolean;
};
const emptyRecords: Record<string, unknown>[] = [];

function toRows(kind: Kind, data: Record<string, unknown>[]): AdminRow[] {
  return data.map((item) => {
    if (kind === "trips") {
      const published = Boolean(item.isPublic);
      const stops = Array.isArray(item.stops) ? item.stops.length : 0;
      return {
        id: String(item.slug),
        primary: String(item.title),
        secondary: String(item.author) + " · " + String(item.location),
        status: published ? "Published" : "Private",
        meta:
          String(item.days) +
          " · " +
          stops +
          " stops · rating " +
          String(item.rating),
        action: published ? "Hide trip" : "Publish trip",
      };
    }
    const open = item.status === "open";
    return {
      id: String(item.id),
      primary: String(item.title || item.tripTitle || "Reported content"),
      category: item.targetType === "post" ? "Post" : "Trip",
      secondary: String(item.reporter || "Traveller"),
      reason: String(item.reason || "No reason provided"),
      status: open ? "Flagged" : "Reviewed",
      meta: String(item.details || "No additional details"),
      action: open ? "Mark reviewed" : "Flag again",
    };
  });
}

export function AdminDatabaseTable({
  kind,
  searchPlaceholder,
  initialSearch = "",
  compact = false,
}: Props) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({
    status: "all",
    type: "all",
    visibility: "all",
    phase: "all",
    sort: "latest",
  });
  const [selectedReport, setSelectedReport] = useState<{
    id: string;
    targetType: "trip" | "post";
  } | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const { query, action, remove } = useAdminRecords(
    kind,
    page,
    search,
    compact ? 5 : 12,
    filters,
  );
  const source = query.data?.[kind] ?? emptyRecords;
  const rows = useMemo(() => toRows(kind, source), [kind, source]);
  const lookup = useMemo(
    () => new Map(rows.map((row, index) => [row.id, source[index]])),
    [rows, source],
  );

  const error = query.error?.message ?? action.error?.message ?? "";
  return (
    <div className="flex min-w-0 w-full max-w-full flex-col gap-3">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {query.isPending ? (
        <TableLoadingSkeleton
          rows={compact ? 5 : 6}
          columns={kind === "reports" ? 7 : 5}
          toolbar
        />
      ) : (
        <AdminManagementTable
          key={initialSearch}
          initialSearch={initialSearch}
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          total={query.data?.total ?? 0}
          rows={rows}
          entityLabel={kind}
          filters={
            !compact && (
              <AdminTableFilters
                defaults={{
                  status: "all",
                  type: "all",
                  visibility: "all",
                  phase: "all",
                  sort: "latest",
                }}
                onApply={(values) => {
                  setFilters(values);
                  setPage(1);
                }}
                definitions={[
                  ...(kind === "reports"
                    ? [
                        {
                          key: "type",
                          label: "Type",
                          options: [
                            { value: "all", label: "All types" },
                            { value: "trip", label: "Trip" },
                            { value: "post", label: "Post" },
                          ],
                        },
                        {
                          key: "status",
                          label: "Status",
                          options: [
                            { value: "all", label: "All statuses" },
                            { value: "flagged", label: "Flagged" },
                            { value: "reviewed", label: "Reviewed" },
                          ],
                        },
                      ]
                    : [
                        {
                          key: "visibility",
                          label: "Visibility",
                          options: [
                            { value: "all", label: "All trips" },
                            { value: "published", label: "Published" },
                            { value: "private", label: "Private" },
                          ],
                        },
                        {
                          key: "phase",
                          label: "Trip status",
                          options: [
                            { value: "all", label: "All statuses" },
                            { value: "planning", label: "Planning" },
                            { value: "ongoing", label: "Ongoing" },
                            { value: "completed", label: "Completed" },
                          ],
                        },
                      ]),
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
            )
          }
          pendingActionId={
            action.isPending
              ? String(
                  kind === "trips"
                    ? action.variables?.item?.slug
                    : action.variables?.item?.id,
                )
              : undefined
          }
          searchPlaceholder={searchPlaceholder}
          onAction={(row) => action.mutate({ item: lookup.get(row.id) })}
          onRowClick={
            kind === "reports"
              ? (row) =>
                  setSelectedReport({
                    id: row.id,
                    targetType:
                      lookup.get(row.id)?.targetType === "post"
                        ? "post"
                        : "trip",
                  })
              : undefined
          }
          renderExtraActions={
            kind === "trips"
              ? (row) => (
                  <>
                    <Button
                      nativeButton={false}
                      render={
                        <Link href={`/trips/${encodeURIComponent(row.id)}`} />
                      }
                      variant="ghost"
                      size="icon"
                      aria-label={`View ${row.primary} itinerary`}
                      title="View itinerary"
                      className="rounded-full text-brand-blue hover:bg-brand-blue-soft"
                    >
                      <Eye className="size-4" />
                    </Button>
                    <ConfirmAction
                      title={`Delete “${row.primary}”?`}
                      description="This permanently deletes the trip and its associated itinerary data. This cannot be undone."
                      actionLabel="Delete trip"
                      variant="ghost"
                      size="icon"
                      destructive
                      ariaLabel={`Delete ${row.primary}`}
                      className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                      pending={remove.isPending}
                      error={remove.error?.message}
                      onConfirm={() => remove.mutateAsync(row.id)}
                    >
                      <Trash2 className="size-4" />
                    </ConfirmAction>
                  </>
                )
              : (row) => {
                  const item = lookup.get(row.id);
                  const isPost = item?.targetType === "post";
                  const tripId = isPost ? item?.post_id : item?.trip_id;
                  return typeof tripId === "string" ? (
                    <Button
                      nativeButton={false}
                      render={
                        <Link
                          href={
                            isPost
                              ? `/admin/posts?post=${encodeURIComponent(tripId)}`
                              : `/admin/trips?trip=${encodeURIComponent(tripId)}`
                          }
                        />
                      }
                      variant="outline"
                      size="sm"
                      className="rounded-full text-brand-blue"
                    >
                      {isPost ? "View post" : "Manage trip"}
                    </Button>
                  ) : null;
                }
          }
        />
      )}
      {kind === "reports" && (
        <AdminReportDialog
          selection={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
      {!compact && (
        <ItineraryPagination
          label={kind + " pages"}
          page={query.data?.page ?? page}
          totalPages={query.data?.totalPages ?? 1}
          busy={query.isFetching}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
