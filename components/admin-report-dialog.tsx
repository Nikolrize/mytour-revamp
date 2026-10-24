"use client";

import { LoadingBlock } from "@/components/loading-skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminReportDetail } from "@/hooks/use-admin";
import type { AdminReportDialogProps } from "@/lib/type";
import Link from "next/link";

function date(value: string | null) {
  return value
    ? new Date(value).toLocaleString("en-MY", {
        timeZone: "Asia/Kuala_Lumpur",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not reviewed yet";
}
export function AdminReportDialog({
  selection,
  onClose,
}: AdminReportDialogProps) {
  const query = useAdminReportDetail(
    selection?.id ?? "",
    selection?.targetType ?? "trip",
    Boolean(selection),
  );
  const report = query.data?.report;
  return (
    <Dialog
      open={Boolean(selection)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Report details</DialogTitle>
          <DialogDescription>
            Full report information and moderation history.
          </DialogDescription>
        </DialogHeader>
        {query.isPending ? (
          <LoadingBlock label="Loading report details">
            <div className="flex flex-col gap-4">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </LoadingBlock>
        ) : query.error ? (
          <FieldError role="alert" className="text-sm text-destructive">
            {query.error.message}
          </FieldError>
        ) : (
          report && (
            <>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="rounded-full bg-brand-blue-soft text-brand-blue"
                >
                  {report.targetType === "post" ? "Post" : "Trip"}
                </Badge>
                <Badge
                  variant="secondary"
                  className={
                    report.status === "open"
                      ? "rounded-full bg-rose-50 text-rose-700"
                      : "rounded-full bg-emerald-50 text-emerald-700"
                  }
                >
                  {report.status === "open" ? "Flagged" : "Reviewed"}
                </Badge>
              </div>
              <dl className="flex flex-col gap-4">
                {[
                  ["Report ID", report.id],
                  ["Content ID", report.contentId],
                  [
                    report.targetType === "post" ? "Post text" : "Trip title",
                    report.title,
                  ],
                  ["Reason", report.reason],
                  [
                    "Additional details",
                    report.details || "No additional details",
                  ],
                  ["Reported by", report.reporter],
                  ["Reporter ID", report.reporterId],
                  ["Reported on", date(report.createdAt)],
                  [
                    "Status",
                    report.status === "open"
                      ? "Open"
                      : report.status === "resolved"
                        ? "Resolved"
                        : "Dismissed",
                  ],
                  ["Reviewed by", report.reviewedBy || "Not reviewed yet"],
                  ["Reviewer ID", report.reviewedById || "Not reviewed yet"],
                  ["Reviewed on", date(report.reviewedAt)],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-1">
                    <dt className="text-xs font-medium text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="whitespace-pre-wrap text-sm [overflow-wrap:anywhere]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <DialogFooter>
                <Button
                  nativeButton={false}
                  render={
                    <Link
                      href={
                        report.targetType === "post"
                          ? "/admin/posts?post=" +
                            encodeURIComponent(report.contentId)
                          : "/admin/trips?trip=" +
                            encodeURIComponent(report.contentId)
                      }
                    />
                  }
                  variant="outline"
                  className="rounded-full"
                >
                  {report.targetType === "post" ? "View post" : "Manage trip"}
                </Button>
                <Button onClick={onClose} className="rounded-full">
                  Close
                </Button>
              </DialogFooter>
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
