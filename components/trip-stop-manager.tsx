"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { tripStopSchema } from "@/lib/schemas";
import type { StopValues } from "@/hooks/use-trip-stops";
import { useTripStops } from "@/hooks/use-trip-stops";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Values = z.input<typeof tripStopSchema>;
type ParsedValues = z.output<typeof tripStopSchema>;
const empty: Values = {
  title: "",
  description: "",
  day: 1,
  startTime: "09:00",
  endTime: "10:00",
  mapsUrl: "",
};

export function TripStopManager({
  tripId = "",
  onAdd,
  pending = false,
  error,
}: {
  tripId?: string;
  onAdd?: (values: StopValues) => Promise<void>;
  pending?: boolean;
  error?: string;
}) {
  const { create } = useTripStops(tripId, false);
  const form = useForm<Values, unknown, ParsedValues>({
    resolver: zodResolver(tripStopSchema),
    defaultValues: empty,
  });
  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (onAdd) await onAdd(values);
      else await create.mutateAsync(values);
    } catch {
      return;
    }
    form.reset(empty);
  });
  const FormContainer = onAdd ? "div" : "form";
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-brand-line bg-white p-5">
      <div>
        <h2 className="font-semibold">Add a stop</h2>
        <p className="text-sm text-muted-foreground">
          Add a place to your itinerary and route map.
        </p>
      </div>
      <FormContainer
        onSubmit={onAdd ? undefined : onSubmit}
        className="grid gap-3 sm:grid-cols-2"
      >
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="stop-title">Stop name</Label>
          <Input
            id="stop-title"
            {...form.register("title")}
            className="rounded-xl"
          />
          {form.formState.errors.title && (
            <p className="text-xs text-destructive">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="stop-description">Note</Label>
          <Textarea id="stop-description" {...form.register("description")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="stop-day">Day</Label>
          <Input
            id="stop-day"
            type="number"
            min={1}
            max={31}
            {...form.register("day")}
            className="rounded-xl"
          />
          {form.formState.errors.day && (
            <span className="text-xs text-destructive">
              {form.formState.errors.day.message}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="stop-start">Start</Label>
            <Input
              id="stop-start"
              type="time"
              {...form.register("startTime")}
              className="rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="stop-end">End</Label>
            <Input
              id="stop-end"
              type="time"
              {...form.register("endTime")}
              className="rounded-xl"
            />
            {form.formState.errors.endTime && (
              <span className="text-xs text-destructive">
                {form.formState.errors.endTime.message}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="stop-maps-link">Google Maps link</Label>
          <Input
            id="stop-maps-link"
            type="url"
            placeholder="Paste the place’s Google Maps share link"
            {...form.register("mapsUrl")}
            className="rounded-xl"
          />
          <p className="text-xs text-muted-foreground">
            We’ll read the coordinates from the link for your route map.
          </p>
          {form.formState.errors.mapsUrl && (
            <span className="text-xs text-destructive">
              {form.formState.errors.mapsUrl.message}
            </span>
          )}
        </div>
        {(error || create.error) && (
          <p role="alert" className="text-sm text-destructive sm:col-span-2">
            {error || create.error?.message}
          </p>
        )}
        <div className="sm:col-span-2">
          <Button
            type={onAdd ? "button" : "submit"}
            onClick={onAdd ? () => void onSubmit() : undefined}
            disabled={pending || create.isPending}
            className="rounded-full bg-brand-blue text-white hover:bg-brand-blue-hover"
          >
            {pending || create.isPending ? "Adding…" : "Add stop"}
          </Button>
        </div>
      </FormContainer>
    </section>
  );
}
