"use client";

import { useState } from "react";
import { ReportConfirmation } from "@/components/report-confirmation";
import Link from "next/link";
import { Flag } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { contentReportSchema } from "@/lib/schemas";
import { useReportCommunityPost } from "@/hooks/use-community";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function CommunityReport({
  postId,
  signedIn,
}: {
  postId: string;
  signedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const report = useReportCommunityPost(postId);
  const form = useForm<z.infer<typeof contentReportSchema>>({
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
                id={"report-reason-" + postId}
                maxLength={120}
                disabled={report.isPending}
                {...form.register("reason")}
              />
              {form.formState.errors.reason && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.reason.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={"report-details-" + postId}>
                Details (optional)
              </Label>
              <Textarea
                id={"report-details-" + postId}
                maxLength={1000}
                disabled={report.isPending}
                {...form.register("details")}
              />
              {form.formState.errors.details && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.details.message}
                </p>
              )}
            </div>
            {report.error && (
              <p role="alert" className="text-sm text-destructive">
                {report.error.message}
              </p>
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
