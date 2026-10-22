"use client";

import { useState } from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DateTimePickerProps = {
  id: string;
  label: string;
  date: Date | undefined;
  time: string;
  minDate?: Date;
  minTime?: string;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
};

const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const hour = Math.floor(index / 2);
  const minute = index % 2 === 0 ? "00" : "30";
  const value = `${String(hour).padStart(2, "0")}:${minute}`;
  const displayHour = hour % 12 || 12;
  return {
    value,
    label: `${displayHour}:${minute} ${hour < 12 ? "AM" : "PM"}`,
  };
});

export function DateTimePicker({
  id,
  label,
  date,
  time,
  minDate,
  minTime,
  onDateChange,
  onTimeChange,
}: DateTimePickerProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Label htmlFor={`${id}-date`} className="text-sm font-medium">
        {label}
      </Label>
      <div className="grid grid-cols-[minmax(0,1fr)_132px] gap-2">
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                id={`${id}-date`}
                variant="outline"
                className="h-11 w-full justify-start gap-2 rounded-xl border-brand-line px-3 text-left font-normal"
              />
            }
          >
            <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {date ? format(date, "MMM d, yyyy") : "Choose date"}
            </span>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(nextDate) => {
                onDateChange(nextDate);
                setCalendarOpen(false);
              }}
              disabled={(candidate) =>
                Boolean(
                  minDate &&
                  isBefore(startOfDay(candidate), startOfDay(minDate)),
                )
              }
              autoFocus
            />
          </PopoverContent>
        </Popover>
        <Select
          value={time}
          onValueChange={(value) => onTimeChange(String(value ?? ""))}
        >
          <SelectTrigger
            id={`${id}-time`}
            aria-label={`${label} time`}
            className="h-11 w-full rounded-xl border-brand-line px-3"
          >
            <SelectValue placeholder="Time" />
          </SelectTrigger>
          <SelectContent align="end">
            {timeOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={Boolean(minTime && option.value < minTime)}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
