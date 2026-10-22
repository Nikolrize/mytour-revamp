"use client";

import { useState, type FormEvent } from "react";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/date-time-picker";
import { destinations } from "@/lib/data";

const interests = [
  "Local food",
  "Culture",
  "Nature",
  "Beaches",
  "Slow mornings",
  "Hidden gems",
];

function formatTime(time: string) {
  if (!time) return "time not set";
  const [rawHour, minute] = time.split(":").map(Number);
  return `${rawHour % 12 || 12}:${String(minute).padStart(2, "0")} ${rawHour < 12 ? "AM" : "PM"}`;
}

export function PlanBuilder() {
  const [tripName, setTripName] = useState("");
  const [selectedStates, setSelectedStates] = useState(["Penang"]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [travellers, setTravellers] = useState("Just me");
  const [style, setStyle] = useState("A little of everything");
  const [selectedInterests, setSelectedInterests] = useState([
    "Local food",
    "Culture",
  ]);
  const [generated, setGenerated] = useState(false);

  const states = [...new Set(destinations.map((place) => place.state))];
  const chosenPlace =
    destinations.find((place) => selectedStates.includes(place.state)) ??
    destinations[0];
  const tripDays =
    startDate && endDate
      ? Math.max(1, differenceInCalendarDays(endDate, startDate) + 1)
      : 3;
  const durationLabel =
    startDate && endDate
      ? `${tripDays} ${tripDays === 1 ? "day" : "days"}`
      : "Flexible dates";

  function handleStartDateChange(date: Date | undefined) {
    setStartDate(date);
    if (date && endDate && isBefore(startOfDay(endDate), startOfDay(date))) {
      setEndDate(undefined);
      setEndTime("");
    } else if (
      date &&
      endDate &&
      isSameDay(date, endDate) &&
      startTime &&
      endTime &&
      endTime < startTime
    ) {
      setEndTime("");
    }
    setGenerated(false);
  }

  function handleStartTimeChange(time: string) {
    setStartTime(time);
    if (
      startDate &&
      endDate &&
      isSameDay(startDate, endDate) &&
      endTime &&
      time &&
      endTime < time
    )
      setEndTime("");
    setGenerated(false);
  }

  function toggleState(state: string) {
    setSelectedStates((current) => {
      if (current.includes(state))
        return current.length > 1
          ? current.filter((item) => item !== state)
          : current;
      return [...current, state];
    });
    setGenerated(false);
  }

  function toggleInterest(interest: string) {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
    setGenerated(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGenerated(true);
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
        <h1 className="text-4xl font-medium tracking-[-0.06em] sm:text-6xl">
          Let's make a{" "}
          <span className="font-serif italic text-brand-red">plan.</span>
        </h1>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
          Name your trip, pick one or more states, and set the times that work
          for you.
        </p>
      </header>

      {/* Trip preferences and live itinerary preview */}
      <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Card className="rounded-[24px] border-brand-line bg-white shadow-sm">
            <CardContent className="flex flex-col gap-6 p-5 sm:p-7">
              <div className="flex flex-col gap-2">
                <Label htmlFor="trip-name" className="text-sm font-medium">
                  Give your trip a name
                </Label>
                <Input
                  id="trip-name"
                  value={tripName}
                  maxLength={80}
                  onChange={(event) => {
                    setTripName(event.target.value);
                    setGenerated(false);
                  }}
                  className="h-11 rounded-xl border-brand-line bg-background px-3"
                  placeholder="e.g. Island days with the family"
                />
              </div>
              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-medium">
                  Which states would you like to visit?
                </legend>
                <p className="text-xs text-muted-foreground">
                  Choose one or add a few to make a multi-state trip.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {states.map((state) => {
                    const place = destinations.find(
                      (item) => item.state === state,
                    )!;
                    const selected = selectedStates.includes(state);
                    return (
                      <Button
                        type="button"
                        key={state}
                        variant="ghost"
                        aria-pressed={selected}
                        onClick={() => toggleState(state)}
                        className={`group relative h-auto min-h-24 w-full items-end justify-start overflow-hidden whitespace-normal rounded-2xl border p-4 text-left text-white transition-colors hover:bg-transparent ${selected ? "border-brand-blue ring-2 ring-brand-blue/20" : "border-transparent"}`}
                      >
                        <span
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                          style={{ backgroundImage: `url('${place.image}')` }}
                          aria-hidden="true"
                        />
                        <span
                          className="absolute inset-0 bg-gradient-to-t from-brand-blue-deep/80 to-brand-blue-deep/10"
                          aria-hidden="true"
                        />
                        <span className="relative flex w-full items-end justify-between">
                          <span>
                            <span className="block text-sm font-semibold">
                              {state}
                            </span>
                            <span className="text-xs text-white/75">
                              {place.name}
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

          <Card className="rounded-[24px] border-brand-line bg-white shadow-sm">
            <CardContent className="flex flex-col gap-6 p-5 sm:p-7">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-yellow-soft text-brand-red">
                  <CalendarDays className="size-4" />
                </span>
                <div className="flex flex-col gap-1">
                  <h2 className="font-semibold">A few trip details</h2>
                  <p className="text-sm text-muted-foreground">
                    We'll use these to keep your itinerary at the right pace.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <DateTimePicker
                  id="trip-start"
                  label="Trip starts"
                  date={startDate}
                  time={startTime}
                  onDateChange={handleStartDateChange}
                  onTimeChange={handleStartTimeChange}
                />
                <DateTimePicker
                  id="trip-end"
                  label="Trip ends"
                  date={endDate}
                  time={endTime}
                  minDate={startDate}
                  minTime={
                    startDate && endDate && isSameDay(startDate, endDate)
                      ? startTime
                      : undefined
                  }
                  onDateChange={(date) => {
                    setEndDate(date);
                    if (!date) setEndTime("");
                    setGenerated(false);
                  }}
                  onTimeChange={(time) => {
                    setEndTime(time);
                    setGenerated(false);
                  }}
                />
              </div>
              <div className="flex flex-col gap-4">
                <Label
                  htmlFor="trip-travellers"
                  className="text-sm font-medium"
                >
                  Who's going?
                </Label>
                <Select
                  value={travellers}
                  onValueChange={(value) => {
                    setTravellers(String(value ?? "Just me"));
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
              </div>
              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-medium">
                  What kind of pace feels right?
                </legend>
                <div className="flex flex-wrap gap-2">
                  {["A little of everything", "Take it slow", "Pack it in"].map(
                    (item) => (
                      <Button
                        key={item}
                        type="button"
                        onClick={() => {
                          setStyle(item);
                          setGenerated(false);
                        }}
                        variant={style === item ? "default" : "outline"}
                        className={`h-9 rounded-full px-4 text-xs ${style === item ? "bg-brand-blue text-white hover:bg-brand-blue-hover" : "border-brand-line text-muted-foreground"}`}
                      >
                        {item}
                      </Button>
                    ),
                  )}
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
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="submit"
              className="h-12 flex-1 rounded-full bg-brand-blue text-white hover:bg-brand-blue-hover"
            >
              <Sparkles className="size-4" /> Build my itinerary{" "}
              <ArrowRight className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-full border-brand-line bg-white px-6"
              onClick={() => setGenerated(true)}
            >
              Start with a blank trip
            </Button>
          </div>
        </form>

        <Card className="overflow-hidden rounded-[24px] border-brand-line bg-white shadow-sm lg:sticky lg:top-6">
          <div className="relative h-56 bg-brand-blue-soft">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${chosenPlace.image}')` }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-brand-blue-deep/70 to-transparent"
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
                  {tripName || `${selectedStates[0]} getaway`}
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
            <div className="flex flex-col gap-0">
              {[
                ...Array.from(
                  { length: Math.min(tripDays, 5) },
                  (_, index) => ({
                    day: `DAY ${index + 1}`,
                    title:
                      index === 0
                        ? selectedInterests.includes("Local food")
                          ? "A taste of the neighbourhood"
                          : "Get to know the place"
                        : index === tripDays - 1
                          ? "One last stop before home"
                          : selectedInterests.includes("Culture")
                            ? "Local stories & slow wandering"
                            : "Follow a local favourite",
                    desc: `${selectedStates[Math.min(index, selectedStates.length - 1)]} · ${index === 0 ? "an easy first day" : "leave room to explore"}`,
                  }),
                ),
              ].map((item, index) => (
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
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
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
                <Compass className="size-4 text-brand-blue" /> Your plan will
                take shape as you choose what matters.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
