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
import type { ConfirmActionProps } from "@/lib/type";
import { useState } from "react";

export function ConfirmAction({
  children,
  title,
  description,
  actionLabel,
  onConfirm,
  pending,
  error,
  variant = "outline",
  size = "default",
  className,
  confirmClassName,
  destructive = false,
  ariaLabel,
}: ConfirmActionProps) {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (!pending) setOpen(value);
      }}
    >
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant={variant}
            size={size}
            className={className}
            aria-label={ariaLabel}
            title={ariaLabel}
            disabled={pending}
          />
        }
      >
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <FieldError role="alert" className="text-sm text-destructive">
            {error}
          </FieldError>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button
            variant={destructive ? "destructive" : "default"}
            className={
              confirmClassName ??
              (destructive
                ? undefined
                : "bg-brand-blue text-white hover:bg-brand-blue-hover")
            }
            disabled={pending}
            onClick={async () => {
              try {
                await onConfirm();
                setOpen(false);
              } catch {
                /* The mutation error remains visible in the dialog. */
              }
            }}
          >
            {pending ? "Working…" : actionLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
