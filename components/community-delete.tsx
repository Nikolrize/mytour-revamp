"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import type { CommunityDeleteProps } from "@/lib/type";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function CommunityDelete({
  kind,
  pending,
  error,
  onConfirm,
}: CommunityDeleteProps) {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${kind}`}
          />
        }
      >
        <Trash2 className="size-4 text-destructive" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this {kind}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the {kind}
            {kind === "post"
              ? ", its photos, likes, and comments. The attached itinerary stays in Explore."
              : "."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <FieldError role="alert" className="text-sm text-destructive">
            {error}
          </FieldError>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={async () => {
              try {
                await onConfirm();
                setOpen(false);
              } catch {
                /* The mutation error is shown inside the dialog. */
              }
            }}
          >
            {pending ? "Deleting…" : `Delete ${kind}`}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
