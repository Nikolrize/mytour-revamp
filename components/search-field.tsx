"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Explicit submission keeps typing separate from backend search requests.
// A button also works inside another form, such as the post composer.
export function SearchField({
  value,
  onChange,
  onSearch,
  placeholder,
  id,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder: string;
  id?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex w-full min-w-0 items-center gap-2">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.nativeEvent.isComposing) {
              event.preventDefault();
              event.stopPropagation();
              if (!disabled) onSearch();
            }
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          maxLength={200}
          disabled={disabled}
          className="h-10 rounded-xl border-brand-line bg-white pl-9 shadow-sm focus-visible:border-brand-blue focus-visible:ring-brand-blue/20"
        />
      </div>
      <Button
        type="button"
        disabled={disabled}
        onClick={onSearch}
        className="h-10 shrink-0 rounded-full"
      >
        Search
      </Button>
    </div>
  );
}
