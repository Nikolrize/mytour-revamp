"use client";

import {
  LoadingBlock,
  CommentsLoadingSkeleton,
} from "@/components/loading-skeletons";

import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  differenceInCalendarDays,
  format,
  isSameDay,
  isBefore,
  startOfDay,
} from "date-fns";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Compass,
  MapPin,
  Sparkles,
  Users,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TripStopManager } from "@/components/trip-stop-manager";
import { DateTimePicker } from "@/components/date-time-picker";
import { stateImages, tripInterestOptions } from "@/lib/data";
import { tripPlanSchema } from "@/lib/schemas";
import { usePlan, type GeneratedStop } from "@/hooks/use-plan";

type TripPlanValues = z.infer<typeof tripPlanSchema>;

const interests = tripInterestOptions;

function formatTime(time: string) {
  if (!time) return "time not set";
  const [rawHour, minute] = time.split(":").map(Number);
  return `${rawHour % 12 || 12}:${String(minute).padStart(2, "0")} ${rawHour < 12 ? "AM" : "PM"}`;
}

export function PlanBuilder({ mode = "ai" }: { mode?: "ai" | "manual" }) {
  const router = useRouter();
  const form = useForm<TripPlanValues>({
    resolver: zodResolver(tripPlanSchema),
    defaultValues: {
      title: "",
      description: "",
      states: [],
      startTime: "",
      endTime: "",
      travellers: "Just me",
      style: "A little of everything",
      interests: ["Local food", "Culture"],
    },
  });
  const {
    register,
    setValue,
    handleSubmit: submitForm,
    formState: { errors },
  } = form;
  const { statesQuery, generateItinerary, createTrip, resolveStop } = usePlan(
    (id) => router.push(`/trips/${id}`),
  );
  const tripName = useWatch({ control: form.control, name: "title" });
  const selectedStates =
    useWatch({ control: form.control, name: "states" }) ?? [];
  const startDate = useWatch({ control: form.control, name: "startDate" });
  const endDate = useWatch({ control: form.control, name: "endDate" });
  const startTime = useWatch({ control: form.control, name: "startTime" });
  const endTime = useWatch({ control: form.control, name: "endTime" });
  const travellers = useWatch({ control: form.control, name: "travellers" });
  const style = useWatch({ control: form.control, name: "style" });
  const selectedInterests =
    useWatch({ control: form.control, name: "interests" }) ?? [];
  const [generated, setGenerated] = useState(false);
  const [generatedStops, setGeneratedStops] = useState<GeneratedStop[]>([]);
  const [manualStops, setManualStops] = useState<GeneratedStop[]>([]);

  const states = useMemo(
    () => statesQuery.data?.states.map((state) => state.name) ?? [],
    [statesQuery.data?.states],
  );
  useEffect(() => {
    if (!states.length) return;
    const current = form.getValues("states");
    const available = current.filter((name) => states.includes(name));
    if (!available.length) {
      form.setValue("states", [states[0]], { shouldDirty: false });
    } else if (available.length !== current.length) {
      form.setValue("states", available, { shouldDirty: false });
    }
  }, [form, states]);
  const selectedStateImage = stateImages[selectedStates[0]];
  const tripDays =
    startDate && endDate
      ? Math.max(1, differenceInCalendarDays(endDate, startDate) + 1)
      : 3;
  const durationLabel =
    startDate && endDate
      ? `${tripDays} ${tripDays === 1 ? "day" : "days"}`
      : "Flexible dates";

  function handleStartDateChange(date: Date | undefined) {
    setValue("startDate", date, { shouldValidate: true });
    if (date && endDate && isBefore(startOfDay(endDate), startOfDay(date))) {
      setValue("endDate", undefined, { shouldValidate: true });
      setValue("endTime", "", { shouldValidate: true });
    } else if (
      date &&
      endDate &&
      isSameDay(date, endDate) &&
      startTime &&
      endTime &&
      endTime < startTime
    ) {
      setValue("endTime", "", { shouldValidate: true });
    }
    setGenerated(false);
  }

  function handleStartTimeChange(time: string) {
    setValue("startTime", time, { shouldValidate: true });
    if (
      startDate &&
      endDate &&
      isSameDay(startDate, endDate) &&
      endTime &&
      time &&
      endTime < time
    )
      setValue("endTime", "", { shouldValidate: true });
    setGenerated(false);
  }

  function toggleState(state: string) {
    const next = selectedStates.includes(state)
      ? selectedStates.length > 1
        ? selectedStates.filter((item) => item !== state)
        : selectedStates
      : [...selectedStates, state];
    setValue("states", next, { shouldValidate: true, shouldDirty: true });
    setGenerated(false);
  }

  function toggleInterest(interest: string) {
    setValue(
      "interests",
      selectedInterests.includes(interest)
        ? selectedInterests.filter((item) => item !== interest)
        : [...selectedInterests, interest],
      { shouldDirty: true },
    );
    setGenerated(false);
  }

  function handleGenerate(values: TripPlanValues) {
    generateItinerary.mutate(values, {
      onSuccess: ({ stops }) => {
        setGeneratedStops(stops);
        setGenerated(true);
      },
    });
  }

  function handleSave(values: TripPlanValues) {
    createTrip.mutate({
      values,
      stops: mode === "manual" ? manualStops : generated ? generatedStops : [],
    });
  }

  return (
    <div className="flex w-full flex-col gap-8 py-10 sm:gap-10 sm:py-14">
      {/* Trip builder introduction */}
      <header className="flex flex-col gap-3">
        <Badge
          variant="outline"
          className="w-fit rounded-full border-brand-line bg-white px-3 py-1 text-brand-blue"
        >
          <Sparkles className="size-3.5" /> Your next Malaysia story
        </Badge>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-4xl font-medium tracking-[-0.06em] sm:text-6xl">
            {mode === "ai" ? "Plan with " : "Build your "}
            <span className="text-brand-red">
              {mode === "ai" ? "AI." : "own itinerary."}
            </span>
          </h1>
          {mode === "manual" && (
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={submitForm(handleSave)}
                disabled={createTrip.isPending || resolveStop.isPending}
                className="h-11 rounded-full bg-brand-blue px-6 text-white hover:bg-brand-blue-hover"
              >
                {createTrip.isPending ? "Saving trip…" : "Create trip"}
              </Button>
            </div>
          )}
        </div>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
          Name your trip, pick one or more states, and set the times that work
          for you.
        </p>
      </header>

      {/* Trip preferences and live itinerary preview */}
      <div
        className={
          mode === "ai"
            ? "grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]"
            : "grid items-start gap-6 lg:grid-cols-2"
        }
      >
        <form
          onSubmit={(event) => event.preventDefault()}
          className="flex flex-col gap-6"
        >
          <Card className="rounded-[24px] border-brand-line bg-white shadow-sm">
            <CardContent className="flex flex-col gap-6 p-5 sm:p-7">
              <div className="flex flex-col gap-2">
                <Label htmlFor="trip-name" className="text-sm font-medium">
                  Give your trip a name
                </Label>
                <Input
                  id="trip-name"
                  {...register("title")}
                  maxLength={80}
                  onChange={(event) => {
                    setValue("title", event.target.value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setGenerated(false);
                  }}
                  className="h-11 rounded-xl border-brand-line bg-background px-3"
                  placeholder="e.g. Island days with the family"
                />
                {errors.title && (
                  <p className="text-xs text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="trip-description">Description (optional)</Label>
                <Textarea
                  id="trip-description"
                  {...register("description")}
                  maxLength={2000}
                  rows={3}
                  placeholder="What is this trip about? Add any details you want to share."
                  className="rounded-xl border-brand-line bg-background"
                />
                {errors.description && (
                  <p className="text-xs text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-medium">
                  Which states would you like to visit?
                </legend>
                <p className="text-xs text-muted-foreground">
                  Choose one or add a few to make a multi-state trip.
                </p>
                {statesQuery.isPending && (
                  <LoadingBlock label="Loading states">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {Array.from({ length: 8 }, (_, index) => (
                        <Skeleton key={index} className="h-24 rounded-2xl" />
                      ))}
                    </div>
                  </LoadingBlock>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {states.map((state) => {
                    const stateImage = stateImages[state];
                    const selected = selectedStates.includes(state);
                    return (
                      <Button
                        type="button"
                        key={state}
                        variant="ghost"
                        aria-pressed={selected}
                        onClick={() => toggleState(state)}
                        className={`group relative h-auto min-h-24 w-full items-end justify-start overflow-hidden whitespace-normal rounded-2xl border bg-brand-blue-deep p-4 text-left text-white transition-colors hover:bg-brand-blue-deep hover:text-white ${selected ? "border-brand-blue ring-2 ring-brand-blue/20" : "border-transparent"}`}
                      >
                        <span
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                          style={
                            stateImage
                              ? { backgroundImage: `url('${stateImage}')` }
                              : undefined
                          }
                          aria-hidden="true"
                        />
                        <span
                          className="absolute inset-0 bg-black/50"
                          aria-hidden="true"
                        />
                        <span className="relative flex w-full items-end justify-between">
                          <span>
                            <span className="block text-sm font-semibold">
                              {state}
                            </span>
                          </span>
                          {selected && (
                            <span className="grid size-6 place-items-center rounded-full bg-white text-brand-blue">
                              <Check className="size-4" />
                            </span>
                          )}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </fieldset>
            </CardContent>
          </Card>

          {mode === "ai" && (
            <Card className="rounded-[24px] border-brand-line bg-white shadow-sm">
              <CardContent className="flex flex-col gap-6 p-5 sm:p-7">
                <div className="flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-yellow-soft text-brand-red">
                    <CalendarDays className="size-4" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <h2 className="font-semibold">A few trip details</h2>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ll use these to keep your itinerary at the right
                      pace.
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <DateTimePicker
                        id="trip-start"
                        label="Trip starts"
                        date={field.value}
                        time={startTime}
                        onDateChange={handleStartDateChange}
                        onTimeChange={handleStartTimeChange}
                      />
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <DateTimePicker
                        id="trip-end"
                        label="Trip ends"
                        date={field.value}
                        time={endTime}
                        minDate={startDate}
                        minTime={
                          startDate && endDate && isSameDay(startDate, endDate)
                            ? startTime
                            : undefined
                        }
                        onDateChange={(date) => {
                          field.onChange(date);
                          if (!date)
                            setValue("endTime", "", { shouldValidate: true });
                          setGenerated(false);
                        }}
                        onTimeChange={(time) => {
                          setValue("endTime", time, { shouldValidate: true });
                          setGenerated(false);
                        }}
                      />
                    )}
                  />
                  {(errors.startDate || errors.endDate) && (
                    <p className="text-xs text-destructive sm:col-span-2">
                      {errors.startDate?.message || errors.endDate?.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-4">
                  <Label
                    htmlFor="trip-travellers"
                    className="text-sm font-medium"
                  >
                    Who&apos;s going?
                  </Label>
                  <Controller
                    control={form.control}
                    name="travellers"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(String(value ?? "Just me"));
                          setGenerated(false);
                        }}
                      >
                        <SelectTrigger
                          id="trip-travellers"
                          className="h-11 w-full rounded-xl border-brand-line px-3"
                        >
                          <Users className="size-4 text-muted-foreground" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Just me">Just me</SelectItem>
                          <SelectItem value="Two of us">Two of us</SelectItem>
                          <SelectItem value="Friends">Friends</SelectItem>
                          <SelectItem value="Family">Family</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <fieldset className="flex flex-col gap-3">
                  <legend className="text-sm font-medium">
                    What kind of pace feels right?
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "A little of everything",
                      "Take it slow",
                      "Pack it in",
                    ].map((item) => (
                      <Button
                        key={item}
                        type="button"
                        onClick={() => {
                          setValue("style", item);
                          setGenerated(false);
                        }}
                        variant={style === item ? "default" : "outline"}
                        className={`h-9 rounded-full px-4 text-xs ${style === item ? "bg-brand-blue text-white hover:bg-brand-blue-hover" : "border-brand-line text-muted-foreground"}`}
                      >
                        {item}
                      </Button>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="flex flex-col gap-3">
                  <legend className="text-sm font-medium">
                    What are you into?
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest) => (
                      <Button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        variant={
                          selectedInterests.includes(interest)
                            ? "secondary"
                            : "outline"
                        }
                        className={`h-9 rounded-full px-4 text-xs ${selectedInterests.includes(interest) ? "bg-brand-blue-soft text-brand-blue hover:bg-brand-blue-soft" : "border-brand-line text-muted-foreground"}`}
                      >
                        {interest}
                      </Button>
                    ))}
                  </div>
                </fieldset>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            {mode === "ai" && (
              <Button
                type="button"
                onClick={submitForm(handleGenerate)}
                disabled={generateItinerary.isPending || createTrip.isPending}
                className="h-12 flex-1 rounded-full bg-brand-blue text-white hover:bg-brand-blue-hover"
              >
                <Sparkles className="size-4" />{" "}
                {generateItinerary.isPending
                  ? "Building your route…"
                  : generated
                    ? "Regenerate with AI"
                    : "Generate with AI"}{" "}
                <ArrowRight className="size-4" />
              </Button>
            )}
            {mode === "ai" && generated && (
              <Button
                type="button"
                onClick={submitForm(handleSave)}
                disabled={
                  createTrip.isPending ||
                  generateItinerary.isPending ||
                  resolveStop.isPending
                }
                variant="outline"
                className="h-12 rounded-full px-6"
              >
                {createTrip.isPending ? "Saving trip…" : "Save itinerary"}
              </Button>
            )}
          </div>
          {(errors.states || errors.endTime) && (
            <p role="alert" className="text-sm text-destructive">
              {errors.states?.message || errors.endTime?.message}
            </p>
          )}
          {createTrip.error && (
            <p role="alert" className="text-sm text-destructive">
              {createTrip.error.message}
            </p>
          )}
          {generateItinerary.error && (
            <p role="alert" className="text-sm text-destructive">
              {generateItinerary.error.message}
            </p>
          )}
        </form>
        {mode === "manual" && (
          <div className="flex min-w-0 flex-col gap-6">
            {" "}
            <TripStopManager
              pending={resolveStop.isPending || createTrip.isPending}
              error={resolveStop.error?.message}
              onAdd={async (values) => {
                const stop = await resolveStop.mutateAsync(values);
                setManualStops((current) => [...current, stop]);
              }}
            />
            {/* Manual stops are real draft entries, saved with the trip. */}
            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold">Your stops</h2>
              {/* Daily itinerary cards include every detail entered for a stop. */}
              {Array.from(new Set(manualStops.map((stop) => stop.day)))
                .sort((a, b) => a - b)
                .map((day) => (
                  <Card
                    key={day}
                    className="rounded-[22px] border-brand-line bg-white shadow-none"
                  >
                    <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
                      <div className="flex items-center justify-between gap-3 border-b border-brand-line pb-4">
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 place-items-center rounded-xl bg-brand-blue-soft text-brand-blue">
                            <CalendarDays className="size-4" />
                          </span>
                          <h3 className="font-semibold">Day {day}</h3>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {
                            manualStops.filter((stop) => stop.day === day)
                              .length
                          }{" "}
                          stops
                        </span>
                      </div>
                      <div className="flex flex-col gap-5">
                        {manualStops.map((stop, index) =>
                          stop.day !== day ? null : (
                            <div key={index} className="flex items-start gap-3">
                              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-blue-soft text-brand-blue">
                                <MapPin className="size-4" />
                              </span>
                              <div className="flex min-w-0 flex-1 flex-col gap-2">
                                <p className="text-xs font-medium text-muted-foreground">
                                  {formatTime(stop.startTime)}–
                                  {formatTime(stop.endTime)}
                                </p>
                                <h4 className="break-words font-medium">
                                  {stop.title}
                                </h4>
                                {stop.description && (
                                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                                    {stop.description}
                                  </p>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={"Remove " + stop.title}
                                disabled={createTrip.isPending}
                                onClick={() =>
                                  setManualStops((current) =>
                                    current.filter((_, i) => i !== index),
                                  )
                                }
                                className="shrink-0 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </section>
          </div>
        )}

        {mode === "ai" && (
          <Card className="overflow-hidden rounded-[24px] border-brand-line bg-white shadow-sm lg:sticky lg:top-6">
            <div className="relative h-56 bg-brand-blue-soft">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={
                  selectedStateImage
                    ? { backgroundImage: `url('${selectedStateImage}')` }
                    : undefined
                }
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 bg-black/50"
                aria-hidden="true"
              />
              <Badge className="absolute left-5 top-5 rounded-full border border-white/25 bg-white/15 text-white backdrop-blur hover:bg-white/15">
                LIVE PREVIEW
              </Badge>
              <div className="absolute bottom-5 left-5 flex flex-col gap-1 text-white">
                <span className="text-xs text-white/75">
                  {selectedStates.join(" · ")}
                </span>
                <h2 className="text-2xl font-medium">
                  {tripName || "Name your trip"}
                </h2>
              </div>
            </div>
            <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Your trip outline
                  </p>
                  <h3 className="text-lg font-semibold">
                    {tripName || "Name your trip"}
                  </h3>
                </div>
                <Badge
                  variant="secondary"
                  className="rounded-full bg-brand-blue-soft text-brand-blue"
                >
                  {durationLabel}
                </Badge>
              </div>
              {(startDate || endDate) && (
                <p className="text-xs text-muted-foreground">
                  {startDate
                    ? `Starts ${format(startDate, "MMM d, yyyy")} at ${formatTime(startTime)}`
                    : "Start date not set"}
                  {endDate
                    ? ` · Ends ${format(endDate, "MMM d, yyyy")} at ${formatTime(endTime)}`
                    : " · End date not set"}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Travelling: {travellers.toLowerCase()}
              </p>
              {generateItinerary.isPending && (
                <CommentsLoadingSkeleton label="Generating itinerary" />
              )}
              <div className="flex flex-col gap-0">
                {(!generated
                  ? []
                  : generatedStops.map((stop) => ({
                      day: "DAY " + stop.day + " · " + stop.startTime,
                      title: stop.title,
                      desc: stop.area,
                    }))
                ).map((item, index) => (
                  <div
                    key={item.day}
                    className="grid grid-cols-[34px_1fr] gap-x-3"
                  >
                    <span
                      className={`relative z-10 grid size-[34px] place-items-center rounded-full ${index === 1 ? "bg-brand-red-soft text-brand-red" : "bg-brand-blue-soft text-brand-blue"}`}
                    >
                      <MapPin className="size-4" />
                    </span>
                    <div className="flex flex-col gap-1 pb-5">
                      <p className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground">
                        {item.day}
                      </p>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {generated ? (
                <div className="flex flex-col gap-2 rounded-2xl bg-brand-blue-soft p-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-brand-blue">
                    <Check className="size-4" /> Preview updated
                  </p>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {style} ·{" "}
                    {selectedInterests.length
                      ? selectedInterests.join(", ")
                      : "No interests selected yet"}
                  </p>
                </div>
              ) : (
                <p className="flex items-center gap-2 rounded-xl bg-brand-surface-muted px-4 py-3 text-xs text-muted-foreground">
                  <Compass className="size-4 text-brand-blue" /> Generate an
                  itinerary to see your actual stops here.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
