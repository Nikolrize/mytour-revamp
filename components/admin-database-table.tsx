"use client";

import { useMemo } from "react";
import { AdminManagementTable } from "@/components/admin-management-table";
import type { AdminRow } from "@/lib/admin-data";
import { useAdminRecords } from "@/hooks/use-admin";

type Kind = "users" | "trips" | "reports";
type Props = { kind: Kind; searchPlaceholder: string };
const emptyRecords: Record<string, unknown>[] = [];

function toRows(kind: Kind, data: Record<string, unknown>[]): AdminRow[] {
  return data.map((item) => {
    if (kind === "users") {
      const joined =
        typeof item.created_at === "string"
          ? new Date(item.created_at).toLocaleDateString()
          : "";
      return {
        id: String(item.id).slice(0, 8),
        primary: String(item.display_name || "Traveller"),
        secondary: Array.isArray(item.roles) ? item.roles.join(", ") : "client",
        status:
          Array.isArray(item.roles) && item.roles.includes("admin")
            ? "Admin"
            : "Active",
        meta: String(item.tripCount || 0) + " trips · joined " + joined,
        action: "View",
      };
    }
    if (kind === "trips") {
      const published = Boolean(item.isPublic);
      const stops = Array.isArray(item.stops) ? item.stops.length : 0;
      return {
        id: String(item.slug).slice(0, 8),
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
      id: String(item.id).slice(0, 8),
      primary: String(item.tripTitle || "Deleted trip"),
      secondary:
        String(item.reporter || "Traveller") + " · " + String(item.reason),
      status: open ? "Flagged" : String(item.status),
      meta: String(item.details || "No additional details"),
      action: open ? "Resolve report" : "Reviewed",
    };
  });
}

export function AdminDatabaseTable({ kind, searchPlaceholder }: Props) {
  const { query, action } = useAdminRecords(kind);
  const source = query.data ?? emptyRecords;
  const rows = useMemo(() => toRows(kind, source), [kind, source]);
  const lookup = useMemo(
    () => new Map(rows.map((row, index) => [row.id, source[index]])),
    [rows, source],
  );

  const error = query.error?.message ?? action.error?.message ?? "";
  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {query.isPending ? (
        <p className="text-sm text-muted-foreground">Loading {kind}…</p>
      ) : (
        <AdminManagementTable
          rows={rows}
          entityLabel={kind}
          searchPlaceholder={searchPlaceholder}
          onAction={
            kind === "users"
              ? undefined
              : (row) => action.mutate({ item: lookup.get(row.id) })
          }
        />
      )}
      {action.isPending && (
        <p className="text-xs text-muted-foreground">Updating…</p>
      )}
    </div>
  );
}
