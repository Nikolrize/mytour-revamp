"use client";

import { ReportConfirmation } from "@/components/report-confirmation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useReportCommunityPost } from "@/hooks/use-community";
import { contentReportSchema } from "@/lib/schemas";
import type { CommunityReportProps, ContentReportValues } from "@/lib/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { Flag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function CommunityReport({ postId, signedIn }: CommunityReportProps) {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const report = useReportCommunityPost(postId);
  const form = useForm<ContentReportValues>({
    resolver: zodResolver(contentReportSchema),
    defaultValues: { reason: "", details: "" },
  });
  if (!signedIn)
    return (
      <Button
        nativeButton={false}
        render={<Link href="/login" />}
        variant="ghost"
        size="icon"
        className="rounded-full text-brand-blue"
        aria-label="Report post"
        title="Report post"
      >
        <Flag className="size-4" />
      </Button>
    );
  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!report.isPending) {
            setOpen(value);
            if (value) {
              form.reset();
              report.reset();
            }
          }
        }}
      >
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-brand-blue"
              aria-label="Report post"
              title="Report post"
            />
          }
        >
          <Flag className="size-4" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report post</DialogTitle>
            <DialogDescription>
              Tell the moderation team why this post needs review.
            </DialogDescription>
          </DialogHeader>
          {/* Reason and optional supporting details */}
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit((values) =>
              report.mutate(values, {
                onSuccess: () => {
                  setOpen(false);
                  form.reset();
                  setConfirmed(true);
                },
              }),
            )}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor={"report-reason-" + postId}>Reason</Label>
              <Input
                aria-invalid={Boolean(form.formState.errors.reason)}
                aria-describedby={
                  form.formState.errors.reason
                    ? "report-reason-" + postId + "-error"
                    : undefined
                }
                id={"report-reason-" + postId}
                maxLength={120}
                disabled={report.isPending}
                {...form.register("reason")}
              />
              {form.formState.errors.reason && (
                <FieldError
                  id={"report-reason-" + postId + "-error"}
                  className="text-xs text-destructive"
                >
                  {form.formState.errors.reason.message}
                </FieldError>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={"report-details-" + postId}>
                Details (optional)
              </Label>
              <Textarea
                aria-invalid={Boolean(form.formState.errors.details)}
                aria-describedby={
                  form.formState.errors.details
                    ? "report-details-" + postId + "-error"
                    : undefined
                }
                id={"report-details-" + postId}
                maxLength={1000}
                disabled={report.isPending}
                {...form.register("details")}
              />
              {form.formState.errors.details && (
                <FieldError
                  id={"report-details-" + postId + "-error"}
                  className="text-xs text-destructive"
                >
                  {form.formState.errors.details.message}
                </FieldError>
              )}
            </div>
            {report.error && (
              <FieldError role="alert" className="text-sm text-destructive">
                {report.error.message}
              </FieldError>
            )}
            <DialogFooter>
              <Button type="submit" disabled={report.isPending}>
                {report.isPending ? "Submitting…" : "Submit report"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ReportConfirmation open={confirmed} onOpenChange={setConfirmed} />
    </>
  );
}
