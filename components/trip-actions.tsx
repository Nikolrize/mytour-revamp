"use client";

import { useState } from "react";
import { ReportConfirmation } from "@/components/report-confirmation";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Pencil, Trash2, Copy, Flag, Check } from "lucide-react";
import type { Itinerary } from "@/lib/type";
import { tripDetailsSchema, tripReportSchema } from "@/lib/schemas";
import { useProfile } from "@/hooks/use-profile";
import { useTripActions } from "@/hooks/use-trips";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function TripActions({
  trip,
  isOwner,
  isEditing,
  onEditingChange,
}: {
  trip: Itinerary;
  isOwner: boolean;
  isEditing: boolean;
  onEditingChange: (enabled: boolean) => void;
}) {
  const router = useRouter();
  const { profileQuery } = useProfile();
  const signedIn = Boolean(profileQuery.data?.profile);
  const { copy, update, remove, report } = useTripActions(trip.slug);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportConfirmed, setReportConfirmed] = useState(false);
  const editForm = useForm<z.infer<typeof tripDetailsSchema>>({
    resolver: zodResolver(tripDetailsSchema),
    defaultValues: { title: trip.title, description: trip.description },
  });
  const reportForm = useForm<z.infer<typeof tripReportSchema>>({
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
                          id="edit-trip-title"
                          {...editForm.register("title")}
                        />
                        {editForm.formState.errors.title && (
                          <p className="text-sm text-destructive">
                            {editForm.formState.errors.title.message}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-trip-description">
                          Description
                        </Label>
                        <Textarea
                          id="edit-trip-description"
                          maxLength={2000}
                          {...editForm.register("description")}
                        />
                        {editForm.formState.errors.description && (
                          <p className="text-sm text-destructive">
                            {editForm.formState.errors.description.message}
                          </p>
                        )}
                      </div>
                      {update.error && (
                        <p role="alert" className="text-sm text-destructive">
                          {update.error.message}
                        </p>
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
                      <p role="alert" className="text-sm text-destructive">
                        {remove.error.message}
                      </p>
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
                      id="report-reason"
                      maxLength={120}
                      {...reportForm.register("reason")}
                    />
                    {reportForm.formState.errors.reason && (
                      <p className="text-sm text-destructive">
                        {reportForm.formState.errors.reason.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="report-details">Details (optional)</Label>
                    <Textarea
                      id="report-details"
                      maxLength={1000}
                      {...reportForm.register("details")}
                    />
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
          </>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error.message}
        </p>
      )}
      <ReportConfirmation
        open={reportConfirmed}
        onOpenChange={setReportConfirmed}
      />
    </div>
  );
}
