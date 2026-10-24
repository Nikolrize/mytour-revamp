"use client";

import { useId, useState } from "react";
import type { AdminFilterDefinition } from "@/lib/type";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// Draft selections make one backend request only after Apply filters.
export function AdminTableFilters({
  definitions,
  defaults,
  onApply,
}: {
  definitions: AdminFilterDefinition[];
  defaults: Record<string, string>;
  onApply: (values: Record<string, string>) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState(defaults);
  return (
    <form
      className="flex flex-wrap items-end gap-3 rounded-xl bg-brand-surface-muted/60 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        onApply({ ...draft });
      }}
    >
      {definitions.map(({ key, label, options }) => (
        <div key={key} className="flex min-w-36 flex-1 flex-col gap-2">
          <Label htmlFor={id + "-" + key}>{label}</Label>
          <Select
            value={draft[key] ?? defaults[key] ?? "all"}
            onValueChange={(value) =>
              setDraft((current) => ({
                ...current,
                [key]: value ?? defaults[key] ?? "all",
              }))
            }
          >
            <SelectTrigger
              id={id + "-" + key}
              className="h-10 w-full rounded-xl bg-white"
            >
              <SelectValue>
                {
                  options.find(
                    (option) =>
                      option.value === (draft[key] ?? defaults[key] ?? "all"),
                  )?.label
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
      <Button type="submit" className="h-10 rounded-full">
        Apply filters
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-10 rounded-full"
        onClick={() => {
          setDraft(defaults);
          onApply({ ...defaults });
        }}
      >
        Clear filters
      </Button>
    </form>
  );
}
