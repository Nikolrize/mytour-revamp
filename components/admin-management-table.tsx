"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminRow } from "@/lib/admin-data";

type AdminTableProps = {
  rows: AdminRow[];
  entityLabel: string;
  searchPlaceholder: string;
  onAction?: (row: AdminRow) => void;
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
  onAction,
}: AdminTableProps) {
  const [query, setQuery] = useState("");
  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return rows;
    return rows.filter((row) =>
      Object.values(row).some((value) =>
        value.toLowerCase().includes(normalized),
      ),
    );
  }, [query, rows]);

  return (
    <Card className="overflow-hidden rounded-2xl border-brand-line bg-white shadow-none">
      <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold">All {entityLabel}</h2>
            <p className="text-xs text-muted-foreground">
              {filteredRows.length}{" "}
              {filteredRows.length === 1 ? "result" : "results"}
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="h-10 rounded-xl border-brand-line pl-9"
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
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Details</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {row.id}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{row.primary}</span>
                    <span className="text-xs text-muted-foreground">
                      {row.secondary}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`rounded-full px-2.5 py-1 text-[11px] ${statusClass(row.status)}`}
                  >
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                  {row.meta}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAction?.(row)}
                    disabled={!onAction}
                    className="rounded-full border-brand-line bg-white text-brand-blue"
                  >
                    {row.action}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!filteredRows.length && (
              <TableRow>
                <TableCell
                  colSpan={5}
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
