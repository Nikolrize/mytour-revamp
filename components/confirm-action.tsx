"use client";

import { useState, type ReactNode, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

type ConfirmActionProps = {
  children: ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onConfirm: () => Promise<unknown>;
  pending?: boolean;
  error?: string;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
  className?: string;
  confirmClassName?: string;
  destructive?: boolean;
  ariaLabel?: string;
};

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
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
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
