"use client";

import { type ReactNode, useMemo, useState } from "react";
import { SearchField } from "@/components/search-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableText,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminRow } from "@/lib/admin-data";

type AdminTableProps = {
  rows: AdminRow[];
  entityLabel: string;
  searchPlaceholder: string;
  initialSearch?: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  total?: number;
  onAction?: (row: AdminRow) => void;
  pendingActionId?: string;
  renderExtraActions?: (row: AdminRow) => ReactNode;
};

function statusClass(status: string) {
  if (status === "Active" || status === "Published")
    return "border-transparent bg-emerald-50 text-emerald-700";
  if (status === "Flagged")
    return "border-transparent bg-rose-50 text-rose-700";
  if (status === "Pending review")
    return "border-transparent bg-amber-50 text-amber-800";
  return "border-brand-line bg-brand-surface-muted text-muted-foreground";
}

export function AdminManagementTable({
  rows,
  entityLabel,
  searchPlaceholder,
  initialSearch = "",
  search,
  onSearchChange,
  total,
  onAction,
  renderExtraActions,
  pendingActionId,
}: AdminTableProps) {
  const [localQuery, setQuery] = useState(initialSearch);
  const [draftSearch, setDraftSearch] = useState(initialSearch);
  const query = search ?? localQuery;
  const filteredRows = useMemo(() => {
    if (onSearchChange) return rows;
    const normalized = query.trim().toLowerCase();
    if (!normalized) return rows;
    return rows.filter((row) =>
      Object.values(row).some(
        (value) =>
          typeof value === "string" && value.toLowerCase().includes(normalized),
      ),
    );
  }, [query, rows, onSearchChange]);

  return (
    <Card className="overflow-hidden rounded-2xl border-brand-line bg-white shadow-none">
      <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold">All {entityLabel}</h2>
            <p className="text-xs text-muted-foreground">
              {total ?? filteredRows.length}{" "}
              {(total ?? filteredRows.length) === 1 ? "result" : "results"}
            </p>
          </div>
          <div className="w-full sm:max-w-md">
            <SearchField
              value={draftSearch}
              onChange={setDraftSearch}
              placeholder={searchPlaceholder}
              onSearch={() =>
                onSearchChange
                  ? onSearchChange(draftSearch.trim())
                  : setQuery(draftSearch.trim())
              }
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-28">ID</TableHead>
              <TableHead>
                {entityLabel === "users" ? "User" : "Title"}
              </TableHead>
              {entityLabel === "reports" && (
                <>
                  <TableHead>Type</TableHead>
                  <TableHead>Reason</TableHead>
                </>
              )}
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Details</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {row.id.slice(0, 8)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <TableText className="font-medium">{row.primary}</TableText>
                    <TableText className="text-xs text-muted-foreground">
                      {row.secondary}
                    </TableText>
                  </div>
                </TableCell>
                {entityLabel === "reports" && (
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-brand-blue-soft text-brand-blue"
                    >
                      {row.category}
                    </Badge>
                  </TableCell>
                )}
                {entityLabel === "reports" && (
                  <TableCell className="text-sm">
                    <TableText>{row.reason ?? ""}</TableText>
                  </TableCell>
                )}
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`rounded-full px-2.5 py-1 text-[11px] ${statusClass(row.status)}`}
                  >
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                  <TableText>{row.meta}</TableText>
                </TableCell>
                <TableCell className="overflow-visible text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAction?.(row)}
                      disabled={!onAction || pendingActionId === row.id}
                      className="rounded-full border-brand-line bg-white text-brand-blue"
                    >
                      {pendingActionId === row.id ? "Updating…" : row.action}
                    </Button>
                    {renderExtraActions?.(row)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!filteredRows.length && (
              <TableRow>
                <TableCell
                  colSpan={entityLabel === "reports" ? 7 : 5}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  No {entityLabel} match that search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
