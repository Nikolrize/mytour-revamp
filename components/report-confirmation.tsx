"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ReportConfirmationProps } from "@/lib/type";
import { CheckCircle2 } from "lucide-react";

// Shared confirmation for successfully submitted trip and post reports.
export function ReportConfirmation({
  open,
  onOpenChange,
}: ReportConfirmationProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <CheckCircle2 className="size-8 text-brand-blue" aria-hidden="true" />
          <DialogTitle>Report submitted</DialogTitle>
          <DialogDescription>
            Your report has been sent to the moderation team.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
