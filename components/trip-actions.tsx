"use client";

import { ReportConfirmation } from "@/components/report-confirmation";
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
import { useProfile } from "@/hooks/use-profile";
import { useTripActions } from "@/hooks/use-trips";
import { tripDetailsSchema, tripReportSchema } from "@/lib/schemas";
import type {
  ContentReportValues,
  TripActionsProps,
  TripDetailsValues,
} from "@/lib/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, Flag, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function TripActions({
  trip,
  isOwner,
  isEditing,
  onEditingChange,
}: TripActionsProps) {
  const router = useRouter();
  const { profileQuery } = useProfile();
  const signedIn = Boolean(profileQuery.data?.profile);
  const { copy, update, remove, report } = useTripActions(trip.slug);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportConfirmed, setReportConfirmed] = useState(false);

  const editForm = useForm<TripDetailsValues>({
    resolver: zodResolver(tripDetailsSchema),
    defaultValues: { title: trip.title, description: trip.description },
  });
  const reportForm = useForm<ContentReportValues>({
    resolver: zodResolver(tripReportSchema),
    defaultValues: { reason: "", details: "" },
  });

  const error = copy.error || update.error || remove.error || report.error;

  if (
    profileQuery.data?.profile?.role === "admin" ||
    profileQuery.data?.profile?.role === "master_admin"
  )
    return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Owner editing and deletion, or community reuse and reporting */}
      <div className={`flex flex-wrap gap-2 ${isOwner ? "justify-end" : ""}`}>
        {isOwner ? (
          <>
            {!isEditing ? (
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => onEditingChange(true)}
              >
                <Pencil className="size-4" /> Edit trip
              </Button>
            ) : (
              <>
                <Button
                  className="rounded-full bg-brand-blue text-white hover:bg-brand-blue-hover"
                  disabled={update.isPending || remove.isPending}
                  onClick={() => onEditingChange(false)}
                >
                  <Check className="size-4" /> Done editing
                </Button>
                <Dialog open={editing} onOpenChange={setEditing}>
                  <DialogTrigger
                    render={
                      <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => {
                          update.reset();
                          editForm.reset({
                            title: trip.title,
                            description: trip.description,
                          });
                        }}
                      />
                    }
                  >
                    <Pencil className="size-4" /> Edit details
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit trip</DialogTitle>
                      <DialogDescription>
                        Update your trip name and description. Status follows
                        the trip dates automatically.
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      className="flex flex-col gap-4"
                      onSubmit={editForm.handleSubmit((values) =>
                        update.mutate(values, {
                          onSuccess: () => setEditing(false),
                        }),
                      )}
                    >
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-trip-title">Trip name</Label>
                        <Input
                          aria-invalid={Boolean(
                            editForm.formState.errors.title,
                          )}
                          aria-describedby={
                            editForm.formState.errors.title
                              ? "edit-trip-title-error"
                              : undefined
                          }
                          id="edit-trip-title"
                          {...editForm.register("title")}
                        />
                        {editForm.formState.errors.title && (
                          <FieldError
                            id={"edit-trip-title-error"}
                            className="text-sm text-destructive"
                          >
                            {editForm.formState.errors.title.message}
                          </FieldError>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-trip-description">
                          Description
                        </Label>
                        <Textarea
                          aria-invalid={Boolean(
                            editForm.formState.errors.description,
                          )}
                          aria-describedby={
                            editForm.formState.errors.description
                              ? "edit-trip-description-error"
                              : undefined
                          }
                          id="edit-trip-description"
                          maxLength={2000}
                          {...editForm.register("description")}
                        />
                        {editForm.formState.errors.description && (
                          <FieldError
                            id={"edit-trip-description-error"}
                            className="text-sm text-destructive"
                          >
                            {editForm.formState.errors.description.message}
                          </FieldError>
                        )}
                      </div>
                      {update.error && (
                        <FieldError
                          role="alert"
                          className="text-sm text-destructive"
                        >
                          {update.error.message}
                        </FieldError>
                      )}
                      <DialogFooter>
                        <Button type="submit" disabled={update.isPending}>
                          {update.isPending ? "Saving…" : "Save changes"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                <AlertDialog open={deleting} onOpenChange={setDeleting}>
                  <AlertDialogTrigger
                    render={
                      <Button variant="destructive" className="rounded-full" />
                    }
                  >
                    <Trash2 className="size-4 text-destructive" /> Delete trip
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you sure you want to delete this trip?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your trip and its itinerary
                        stops.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    {remove.error && (
                      <FieldError
                        role="alert"
                        className="text-sm text-destructive"
                      >
                        {remove.error.message}
                      </FieldError>
                    )}
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={remove.isPending}>
                        Cancel
                      </AlertDialogCancel>
                      <Button
                        variant="destructive"
                        disabled={remove.isPending}
                        onClick={() =>
                          remove.mutate(undefined, {
                            onSuccess: () => router.replace("/trips"),
                          })
                        }
                      >
                        {remove.isPending ? "Deleting…" : "Delete trip"}
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </>
        ) : (
          <>
            <Button
              disabled={profileQuery.isPending || copy.isPending}
              onClick={() =>
                signedIn
                  ? copy.mutate(undefined, {
                      onSuccess: ({ id }) => router.push(`/trips/${id}`),
                    })
                  : router.push("/login")
              }
              className="rounded-full"
            >
              <Copy className="size-4" />{" "}
              {copy.isPending ? "Copying…" : "Copy itinerary"}
            </Button>
            <Dialog
              open={reporting}
              onOpenChange={(open) => {
                if (open && !signedIn) {
                  router.push("/login");
                  return;
                }
                setReporting(open);
              }}
            >
              <DialogTrigger
                render={
                  <Button
                    variant="outline"
                    className="rounded-full"
                    disabled={profileQuery.isPending}
                    onClick={() => report.reset()}
                  />
                }
              >
                <Flag className="size-4" /> Report trip
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report trip</DialogTitle>
                  <DialogDescription>
                    Tell the moderation team what needs attention.
                  </DialogDescription>
                </DialogHeader>
                <form
                  className="flex flex-col gap-4"
                  onSubmit={reportForm.handleSubmit((values) =>
                    report.mutate(values, {
                      onSuccess: () => {
                        setReporting(false);
                        reportForm.reset();
                        setReportConfirmed(true);
                      },
                    }),
                  )}
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="report-reason">Reason</Label>
                    <Input
                      aria-invalid={Boolean(reportForm.formState.errors.reason)}
                      aria-describedby={
                        reportForm.formState.errors.reason
                          ? "report-reason-error"
                          : undefined
                      }
                      id="report-reason"
                      maxLength={120}
                      {...reportForm.register("reason")}
                    />
                    {reportForm.formState.errors.reason && (
                      <FieldError
                        id={"report-reason-error"}
                        className="text-sm text-destructive"
                      >
                        {reportForm.formState.errors.reason.message}
                      </FieldError>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="report-details">Details (optional)</Label>
                    <Textarea
                      aria-invalid={Boolean(
                        reportForm.formState.errors.details,
                      )}
                      id="report-details"
                      maxLength={1000}
                      {...reportForm.register("details")}
                    />
                  </div>
                  {report.error && (
                    <FieldError
                      role="alert"
                      className="text-sm text-destructive"
                    >
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
          </>
        )}
      </div>
      {error && (
        <FieldError role="alert" className="text-sm text-destructive">
          {error.message}
        </FieldError>
      )}
      <ReportConfirmation
        open={reportConfirmed}
        onOpenChange={setReportConfirmed}
      />
    </div>
  );
}
