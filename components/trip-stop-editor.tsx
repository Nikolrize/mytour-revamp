"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { ItineraryStop } from "@/lib/type";
import { editStopSchema } from "@/lib/schemas";
import { useTripStops } from "@/hooks/use-trip-stops";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function TripStopEditor({
  tripId,
  stop,
}: {
  tripId: string;
  stop: ItineraryStop;
}) {
  const [open, setOpen] = useState(false);
  const { update } = useTripStops(tripId, false);
  const defaults = {
    title: stop.place,
    description: stop.note,
    day: stop.day,
    startTime: stop.startTime?.slice(0, 5) || "",
    endTime: stop.endTime?.slice(0, 5) || "",
  };
  const form = useForm<z.infer<typeof editStopSchema>>({
    resolver: zodResolver(editStopSchema),
    defaultValues: defaults,
  });
  if (!stop.id) return null;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-full text-brand-blue hover:bg-brand-blue-soft hover:text-brand-blue-hover"
            title={`Edit ${stop.place}`}
            aria-label={`Edit ${stop.place}`}
            onClick={() => {
              form.reset(defaults);
              update.reset();
            }}
          />
        }
      >
        <Pencil className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit stop</DialogTitle>
          <DialogDescription>
            Adjust this place, note, day, or visiting time.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit((values) =>
            update.mutate(
              { stopId: stop.id!, values },
              { onSuccess: () => setOpen(false) },
            ),
          )}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor={`stop-title-${stop.id}`}>Stop name</Label>
            <Input id={`stop-title-${stop.id}`} {...form.register("title")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`stop-note-${stop.id}`}>Note</Label>
            <Textarea
              id={`stop-note-${stop.id}`}
              maxLength={1000}
              {...form.register("description")}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`stop-day-${stop.id}`}>Day</Label>
              <Input
                id={`stop-day-${stop.id}`}
                type="number"
                min={1}
                max={31}
                {...form.register("day", { valueAsNumber: true })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`stop-start-${stop.id}`}>Start</Label>
              <Input
                id={`stop-start-${stop.id}`}
                type="time"
                {...form.register("startTime")}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`stop-end-${stop.id}`}>End</Label>
              <Input
                id={`stop-end-${stop.id}`}
                type="time"
                {...form.register("endTime")}
              />
            </div>
          </div>
          {Object.entries(form.formState.errors).map(([field, error]) => (
            <p key={field} role="alert" className="text-sm text-destructive">
              {error.message}
            </p>
          ))}
          {update.error && (
            <p role="alert" className="text-sm text-destructive">
              {update.error.message}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? "Saving…" : "Save stop"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
